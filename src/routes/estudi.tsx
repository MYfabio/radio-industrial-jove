import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic,
  Pause,
  Play,
  Square,
  Download,
  Wand2,
  Loader2,
  Sparkles,
  Upload,
  Trash2,
  ListChecks,
  Music,
  Users,
  FileAudio,
  Headphones,
  GraduationCap,
  Printer,
  ExternalLink,
  Palette,
} from "lucide-react";
import { Waveform } from "@/components/Waveform";
import { LevelMeter } from "@/components/LevelMeter";
import { PublishPodcast } from "@/components/PublishPodcast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";

import { Button } from "@/components/ui/button";
import { EFFECTS, playEffect, type EffectId } from "@/lib/soundEffects";
import { SITE_NAME, CANVA_COVER_TEMPLATE_URL } from "@/lib/siteConfig";
import { autoEdit, type AutoEditResult } from "@/lib/autoEdit";
import {
  BG_TRACKS,
  startBackground,
  startBackgroundFromBuffer,
  type BgHandle,
} from "@/lib/bgMusic";
import { encodeMp3, safeFileName } from "@/lib/mp3";
import { playBuffer, randomEmoji } from "@/lib/customSounds";
import { blobToBase64 } from "@/lib/publishPodcast";
import {
  fetchSounds,
  uploadSoundFn,
  deleteSoundFn,
} from "@/lib/sounds.functions";
import type { SoundRow, SoundKind } from "@/lib/sounds.server";
import { useAuth } from "@/lib/auth";
import { TEMPLATES, type PodcastTemplate } from "@/lib/podcastTemplates";
import { printTemplateGuide } from "@/lib/printTemplate";
import { langFromMatches, tr, useLang, useT } from "@/lib/i18n";
import {
  estudiMessages as m,
  estudiTemplateMessages as tm,
} from "@/lib/i18n/messages/estudi";
import type { AiEditResult } from "@/routes/api/ai-edit";

export const Route = createFileRoute("/estudi")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: tr(lang, m, "metaTitle", { site: SITE_NAME }) },
        { name: "description", content: tr(lang, m, "metaDescription") },
        {
          property: "og:title",
          content: tr(lang, m, "ogTitle", { site: SITE_NAME }),
        },
        { property: "og:description", content: tr(lang, m, "ogDescription") },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: RadioStudio,
});

type Status = "idle" | "recording" | "paused" | "done";

/** Etiquetes traduïdes dels efectes (src/lib/soundEffects.ts) i de la música de fons (src/lib/bgMusic.ts), per id. */
const FX_KEYS: Record<EffectId, keyof typeof m> = {
  aplausos: "fxAplausos",
  risa: "fxRisa",
  campana: "fxCampana",
  tada: "fxTada",
  pedo: "fxPedo",
  tambor: "fxTambor",
  whoosh: "fxWhoosh",
};
const BG_KEYS: Record<string, { label: keyof typeof m; desc: keyof typeof m }> =
  {
    calma: { label: "bgCalma", desc: "bgCalmaDesc" },
    noticies: { label: "bgNoticies", desc: "bgNoticiesDesc" },
  };

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function RadioStudio() {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = useT(m);
  const tt = useT(tm);
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [activeEffect, setActiveEffect] = useState<EffectId | null>(null);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState<AutoEditResult | null>(null);
  const [ai, setAi] = useState<AiEditResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [sounds, setSounds] = useState<SoundRow[]>([]);
  const [uploadKind, setUploadKind] = useState<SoundKind>("efecte");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeCustom, setActiveCustom] = useState<number | null>(null);
  const [template, setTemplate] = useState<PodcastTemplate | null>(null);
  const [bgTrack, setBgTrack] = useState<string | null>(null);
  const [bgVolume, setBgVolume] = useState(0.12);
  const [fxVolume, setFxVolume] = useState(0.9);
  const [fxFade, setFxFade] = useState(0);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [duo, setDuo] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [micA, setMicA] = useState("");
  const [micB, setMicB] = useState("");
  const [mp3Busy, setMp3Busy] = useState(false);
  const [mp3Url, setMp3Url] = useState<string | null>(null);

  /** Plantilla amb els textos en la llengua actual (src/lib/podcastTemplates.ts es manté en català). */
  const localizeTemplate = (tp: PodcastTemplate): PodcastTemplate => {
    const pick = (suffix: string, fallback: string) => {
      const key = `${tp.id}${suffix}`;
      return key in tm ? tt(key as keyof typeof tm) : fallback;
    };
    return {
      ...tp,
      nombre: pick("Name", tp.nombre),
      descripcion: pick("Desc", tp.descripcion),
      intro: pick("Intro", tp.intro),
      outro: pick("Outro", tp.outro),
      pasos: tp.pasos.map((paso, i) => ({
        ...paso,
        titulo: pick(`Step${i + 1}Title`, paso.titulo),
        guion: pick(`Step${i + 1}Script`, paso.guion),
      })),
    };
  };
  const tpl = template ? localizeTemplate(template) : null;
  const fxLabel = (id: EffectId) => t(FX_KEYS[id]);
  const bgLabel = (bg: (typeof BG_TRACKS)[number]) => {
    const keys = BG_KEYS[bg.id];
    return keys ? t(keys.label) : bg.label;
  };
  const bgDesc = (bg: (typeof BG_TRACKS)[number]) => {
    const keys = BG_KEYS[bg.id];
    return keys ? t(keys.desc) : bg.descripcion;
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bufferCache = useRef<Map<number, AudioBuffer>>(new Map());
  const resultRef = useRef<HTMLDivElement | null>(null);

  const COL1_DEFAULT = 300;
  const COL3_DEFAULT = 360;
  const [col1Width, setCol1Width] = useState(COL1_DEFAULT);
  const [col3Width, setCol3Width] = useState(COL3_DEFAULT);
  const dragging = useRef<"left" | "right" | null>(null);
  const dragStart = useRef({ x: 0, width: 0 });

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("studioColWidths") ?? "null",
      ) as {
        col1?: number;
        col3?: number;
      } | null;
      if (typeof saved?.col1 === "number") setCol1Width(saved.col1);
      if (typeof saved?.col3 === "number") setCol3Width(saved.col3);
    } catch {
      // Ignora una preferència desada malament.
    }
  }, []);

  useEffect(() => {
    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - dragStart.current.x;
      if (dragging.current === "left") {
        setCol1Width(clamp(dragStart.current.width + delta, 240, 460));
      } else {
        setCol3Width(clamp(dragStart.current.width - delta, 280, 560));
      }
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = null;
      localStorage.setItem(
        "studioColWidths",
        JSON.stringify({ col1: col1Width, col3: col3Width }),
      );
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [col1Width, col3Width]);

  const startDrag =
    (which: "left" | "right", width: number) => (e: React.PointerEvent) => {
      dragging.current = which;
      dragStart.current = { x: e.clientX, width };
      e.preventDefault();
    };

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mixRef = useRef<GainNode | null>(null);
  const monitorRef = useRef<GainNode | null>(null);
  const bgRef = useRef<BgHandle | null>(null);
  const bgTrackRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "recording") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const cleanup = useCallback(() => {
    bgRef.current?.stop();
    bgRef.current = null;
    streamRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    streamRef.current = [];
    mixRef.current = null;
    monitorRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setAnalyser(null);
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  /** Context d'àudio compartit: els efectes sonen per l'altaveu i entren a la gravació. */
  const ensureCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const monitor = ctx.createGain();
      monitor.gain.value = 1;
      monitor.connect(ctx.destination);
      monitorRef.current = monitor;
    }
    void audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const triggerEffect = (id: EffectId) => {
    const ctx = ensureCtx();
    const destinations: AudioNode[] = [];
    if (monitorRef.current) destinations.push(monitorRef.current);
    if (mixRef.current) destinations.push(mixRef.current);
    if (destinations.length === 0) destinations.push(ctx.destination);
    playEffect(ctx, id, destinations, {
      volume: fxVolume,
      fadeIn: fxFade,
      fadeOut: fxFade,
    });
    setActiveEffect(id);
    window.setTimeout(
      () => setActiveEffect((cur) => (cur === id ? null : cur)),
      500,
    );
  };

  const refreshSounds = useCallback(() => {
    fetchSounds()
      .then(setSounds)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshSounds();
  }, [refreshSounds]);

  const destinationsNow = (ctx: AudioContext) => {
    const destinations: AudioNode[] = [];
    if (monitorRef.current) destinations.push(monitorRef.current);
    if (mixRef.current) destinations.push(mixRef.current);
    if (destinations.length === 0) destinations.push(ctx.destination);
    return destinations;
  };

  const triggerCustom = async (sound: SoundRow) => {
    const ctx = ensureCtx();
    try {
      let buffer = bufferCache.current.get(sound.id);
      if (!buffer) {
        const res = await fetch(`/api/public/sound/${sound.id}`);
        buffer = await ctx.decodeAudioData(await res.arrayBuffer());
        bufferCache.current.set(sound.id, buffer);
      }
      playBuffer(ctx, buffer, destinationsNow(ctx), {
        volume: fxVolume,
        fadeIn: fxFade,
        fadeOut: fxFade,
      });

      setActiveCustom(sound.id);
      window.setTimeout(
        () => setActiveCustom((cur) => (cur === sound.id ? null : cur)),
        500,
      );
    } catch {
      setError(t("playFailed", { name: sound.name }));
    }
  };

  const handleUpload = async (files: FileList | File[] | null) => {
    const list = files ? Array.from(files as ArrayLike<File>) : [];
    if (list.length === 0) return;
    setError(null);

    if (!user) {
      setError(t("loginToUpload"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadStatus(
      t(list.length > 1 ? "uploadingMany" : "uploadingOne", {
        count: list.length,
      }),
    );

    let addedCount = 0;
    const rejected: string[] = [];

    for (const file of list) {
      const isAudio =
        file.type.startsWith("audio/") ||
        /\.(mp3|wav|m4a|ogg|aac|webm)$/i.test(file.name);
      if (!isAudio) {
        rejected.push(t("rejectedNotAudio", { name: file.name }));
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        rejected.push(t("rejectedTooBig", { name: file.name }));
        continue;
      }
      try {
        const dataBase64 = await blobToBase64(file);
        await uploadSoundFn({
          data: {
            name:
              file.name.replace(/\.[^.]+$/, "").slice(0, 24) ||
              t("defaultSoundName"),
            emoji: uploadKind === "musica" ? "🎵" : randomEmoji(),
            mime: file.type || "audio/mpeg",
            kind: uploadKind,
            dataBase64,
          },
        });
        addedCount += 1;
      } catch {
        rejected.push(t("rejectedUploadFailed", { name: file.name }));
      }
    }

    if (addedCount > 0) refreshSounds();
    setUploadStatus(
      addedCount > 0
        ? t(addedCount > 1 ? "uploadedMany" : "uploadedOne", {
            count: addedCount,
          })
        : null,
    );
    if (rejected.length > 0)
      setError(t("rejectedSummary", { list: rejected.join(", ") }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.setTimeout(() => setUploadStatus(null), 4000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleUpload(Array.from(e.dataTransfer.files));
  };

  const removeCustom = async (id: number) => {
    try {
      await deleteSoundFn({ data: { id } });
      bufferCache.current.delete(id);
      setSounds((cur) => cur.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteFailed"));
    }
  };

  /** Llista de micròfons disponibles (per al mode a dos). */
  const refreshDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        s.getTracks().forEach((t) => t.stop());
      });
      const all = await navigator.mediaDevices.enumerateDevices();
      const mics = all.filter((d) => d.kind === "audioinput");
      setDevices(mics);
      if (!micA && mics[0]) setMicA(mics[0].deviceId);
      if (!micB && mics[1]) setMicB(mics[1].deviceId);
    } catch {
      setError(t("micsFailed"));
    }
  };

  /** "calma"/"noticies" es sintetitzen; "so:123" és música pujada per la classe. */
  const startBackgroundTrack = async (
    id: string,
    ctx: AudioContext,
    destinations: AudioNode[],
  ): Promise<BgHandle> => {
    if (id.startsWith("so:")) {
      const soundId = Number(id.slice(3));
      let buffer = bufferCache.current.get(soundId);
      if (!buffer) {
        const res = await fetch(`/api/public/sound/${soundId}`);
        buffer = await ctx.decodeAudioData(await res.arrayBuffer());
        bufferCache.current.set(soundId, buffer);
      }
      return startBackgroundFromBuffer(ctx, buffer, destinations, bgVolume);
    }
    return startBackground(ctx, id, destinations, bgVolume);
  };

  const toggleBackground = (id: string) => {
    const next = bgTrack === id ? null : id;
    setBgTrack(next);
    bgTrackRef.current = next;
    bgRef.current?.stop();
    bgRef.current = null;
    if (next) {
      const ctx = ensureCtx();
      void startBackgroundTrack(next, ctx, destinationsNow(ctx))
        .then((handle) => {
          if (bgTrackRef.current === next) bgRef.current = handle;
          else handle.stop();
        })
        .catch(() => setError(t("bgFailed")));
    }
  };

  const stopBackground = () => {
    setBgTrack(null);
    bgTrackRef.current = null;
    bgRef.current?.stop();
    bgRef.current = null;
  };

  const start = async () => {
    setError(null);
    try {
      // Desactivem el processament pensat per a videotrucades: amb els efectes
      // sonant pels altaveus, la cancel·lació d'eco i el control automàtic de
      // guany poden confondre la veu amb "eco" i baixar-ne el volum de cop.
      const rawAudio = {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      };
      const wanted: MediaTrackConstraints[] = duo
        ? [
            micA ? { ...rawAudio, deviceId: { exact: micA } } : rawAudio,
            micB ? { ...rawAudio, deviceId: { exact: micB } } : rawAudio,
          ]
        : [rawAudio];

      const streams: MediaStream[] = [];
      for (const audio of wanted) {
        streams.push(await navigator.mediaDevices.getUserMedia({ audio }));
      }
      streamRef.current = streams;

      const ctx = ensureCtx();

      // Mescla: micros + efectes + música -> gravació i mesurador d'ona
      const mix = ctx.createGain();
      mixRef.current = mix;

      streams.forEach((stream) => {
        const micSource = ctx.createMediaStreamSource(stream);
        const micGain = ctx.createGain();
        micGain.gain.value = streams.length > 1 ? 0.9 : 1;
        micSource.connect(micGain).connect(mix);
      });

      const node = ctx.createAnalyser();
      node.fftSize = 1024;
      mix.connect(node);
      setAnalyser(node);

      const dest = ctx.createMediaStreamDestination();
      mix.connect(dest);

      // Si hi ha música de fons activa, la reencaminem cap a la gravació.
      if (bgTrack) {
        bgRef.current?.stop();
        bgRef.current = null;
        const track = bgTrack;
        void startBackgroundTrack(track, ctx, [
          monitorRef.current ?? ctx.destination,
          mix,
        ]).then((handle) => {
          if (bgTrackRef.current === track) bgRef.current = handle;
          else handle.stop();
        });
      }

      const recorder = new MediaRecorder(dest.stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        blobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start(100);
      recorderRef.current = recorder;

      setAudioUrl(null);
      setEdited(null);
      setMp3Url(null);
      setSeconds(0);
      setStatus("recording");
    } catch {
      setError(t("micAccessFailed"));
    }
  };

  const togglePause = () => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (status === "recording") {
      rec.pause();
      setStatus("paused");
    } else if (status === "paused") {
      rec.resume();
      setStatus("recording");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    cleanup();
    setStatus("done");
    // Celebrem el moment: portem la vista al resultat i el ressaltem un instant.
    setJustFinished(true);
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 150);
    window.setTimeout(() => setJustFinished(false), 3000);
  };

  const runAutoEdit = async () => {
    if (!blobRef.current) return;
    setEditing(true);
    setError(null);
    setAi(null);
    try {
      const result = await autoEdit(blobRef.current);
      setEdited(result);

      // Edició amb IA: transcriu i proposa títol, resum, capítols i consells
      setAiLoading(true);
      const form = new FormData();
      form.append("audio", result.blob, "podcast.wav");
      const res = await fetch("/api/ai-edit", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.text();
        setError(
          res.status === 429
            ? t("aiBusy")
            : res.status === 402
              ? t("aiNoCredits")
              : t("aiFailed", { body }),
        );
      } else {
        setAi((await res.json()) as AiEditResult);
      }
    } catch {
      setError(t("autoEditFailed"));
    } finally {
      setAiLoading(false);
      setEditing(false);
    }
  };

  /** La versió que es publica i s'exporta: l'editada si existeix, si no l'original. */
  const finalBlob = () => edited?.blob ?? blobRef.current;
  const finalTitle = () => ai?.titulo || tpl?.nombre || SITE_NAME;

  const exportMp3 = async () => {
    const blob = finalBlob();
    if (!blob) return;
    setMp3Busy(true);
    setError(null);
    try {
      const mp3 = await encodeMp3(blob, {
        title: finalTitle(),
        artist: SITE_NAME,
        album: tpl?.nombre ?? t("albumDefault"),
        comment: ai?.resumen ?? "",
      });
      setMp3Url(URL.createObjectURL(mp3));
    } catch {
      setError(t("mp3Failed"));
    } finally {
      setMp3Busy(false);
    }
  };

  const isLive = status === "recording" || status === "paused";

  return (
    <main className="studio-bg min-h-screen px-3 py-3 lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col">
        <header className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <Logo className="size-10 shrink-0" />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight">
                {SITE_NAME}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {t("tagline")}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LangToggle />
            <AuthButton />
            <Link
              to="/mur"
              className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:inline-flex"
            >
              {t("classWall")}
            </Link>
            <Link
              to="/mestre"
              className="hidden items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:inline-flex"
            >
              <GraduationCap className="size-3.5" /> {t("teacher")}
            </Link>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                status === "recording"
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {status === "recording"
                ? t("statusRecording")
                : status === "paused"
                  ? t("statusPaused")
                  : status === "done"
                    ? t("statusDone")
                    : t("statusIdle")}
            </span>
          </div>
        </header>

        <div
          className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2 xl:grid-cols-[var(--col1)_6px_minmax(0,1fr)_6px_var(--col3)]"
          style={
            {
              "--col1": `${col1Width}px`,
              "--col3": `${col3Width}px`,
            } as React.CSSProperties
          }
        >
          {/* ---------- Columna 1: plantilla i guia ---------- */}
          <div className="min-h-0 space-y-3 lg:overflow-y-auto lg:pr-1">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("step1Title")}
              </h2>

              <div className="mt-3 grid gap-2">
                {TEMPLATES.map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() =>
                      setTemplate((cur) => (cur?.id === tp.id ? null : tp))
                    }
                    aria-pressed={template?.id === tp.id}
                    className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition-all hover:scale-[1.01] active:scale-95 ${
                      template?.id === tp.id
                        ? "border-accent bg-accent/15"
                        : "border-border bg-secondary/40"
                    }`}
                  >
                    <span className="text-2xl leading-none">{tp.emoji}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {localizeTemplate(tp).nombre}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {localizeTemplate(tp).descripcion}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-accent">
                        {t("targetDuration", {
                          time: formatTime(tp.duracionObjetivo),
                        })}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {tpl && (
              <section className="space-y-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                    <ListChecks className="size-4" />{" "}
                    {t("guideOf", { name: tpl.nombre })}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      printTemplateGuide(tpl, {
                        lang,
                        script: t("printScript"),
                        printButton: t("printButton"),
                        target: t("printTarget"),
                        intro: t("introHeading"),
                        steps: t("printSteps"),
                        outro: t("outroHeading"),
                        effects: t("printEffects"),
                      })
                    }
                    className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-card px-2.5 py-1 text-xs font-semibold text-accent transition-transform hover:scale-105 active:scale-95"
                  >
                    <Printer className="size-3.5" /> PDF
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("introHeading")}
                  </p>
                  <p className="mt-1 text-sm">{tpl.intro}</p>
                </div>

                <ol className="space-y-2">
                  {tpl.pasos.map((paso, i) => {
                    const inicio = tpl.pasos
                      .slice(0, i)
                      .reduce((acc, p) => acc + p.segundos, 0);
                    const fin = inicio + paso.segundos;
                    const activo = isLive && seconds >= inicio && seconds < fin;
                    return (
                      <li
                        key={paso.titulo}
                        className={`flex gap-2 rounded-xl border p-2.5 text-sm ${
                          activo
                            ? "border-accent bg-accent/20"
                            : "border-border/60 bg-card/60"
                        }`}
                      >
                        <span className="font-mono tabular-nums text-accent">
                          {formatTime(inicio)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">
                            {paso.titulo}
                          </span>
                          <span className="block text-muted-foreground">
                            {paso.guion}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("outroHeading")}
                  </p>
                  <p className="mt-1 text-sm">{tpl.outro}</p>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("recommendedEffects")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tpl.efectos.map((id) => {
                      const fx = EFFECTS.find((e) => e.id === id);
                      if (!fx) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => triggerEffect(id)}
                          className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-semibold transition-transform hover:scale-105 active:scale-95"
                        >
                          <span className="text-base">{fx.emoji}</span>{" "}
                          {fxLabel(fx.id)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("resources")}
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href={CANVA_COVER_TEMPLATE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 p-2.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95"
                >
                  <Palette className="size-4 text-accent" />{" "}
                  {t("canvaTemplate")}
                  <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                </a>
                <a
                  href="https://freesound.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 p-2.5 text-sm font-semibold transition-transform hover:scale-[1.01] active:scale-95"
                >
                  <Music className="size-4 text-accent" /> {t("freesoundLink")}
                  <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
                </a>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("freesoundHint")}
              </p>
            </section>
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={t("resizeCol1")}
            onPointerDown={startDrag("left", col1Width)}
            onDoubleClick={() => setCol1Width(COL1_DEFAULT)}
            className="col-resize-handle hidden xl:flex"
          >
            <span />
          </div>

          {/* ---------- Columna 2: pista i botó de gravació ---------- */}
          <div className="min-h-0 space-y-3 lg:overflow-y-auto lg:pr-1">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("step2Title")}
                </h2>
                <span className="font-mono text-xl tabular-nums text-accent">
                  {formatTime(seconds)}
                  {template && (
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      / {formatTime(template.duracionObjetivo)}
                    </span>
                  )}
                </span>
              </div>

              {template && (
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{
                      width: `${Math.min(100, (seconds / template.duracionObjetivo) * 100)}%`,
                    }}
                  />
                </div>
              )}

              <Waveform
                analyser={analyser}
                recording={isLive}
                paused={status === "paused"}
                className="h-24 xl:h-28"
              />

              <LevelMeter analyser={analyser} active={isLive} />

              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  onClick={
                    status === "idle" || status === "done" ? start : togglePause
                  }
                  aria-label={
                    status === "recording"
                      ? t("pauseRecording")
                      : status === "paused"
                        ? t("resumeRecording")
                        : t("startRecording")
                  }
                  className={`flex size-24 flex-col items-center justify-center gap-1 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95 xl:size-28 ${
                    status === "recording" ? "rec-pulse" : ""
                  }`}
                >
                  {status === "recording" ? (
                    <Pause className="size-10" />
                  ) : status === "paused" ? (
                    <Play className="size-10" />
                  ) : (
                    <Mic className="size-10" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {status === "recording"
                      ? t("btnPause")
                      : status === "paused"
                        ? t("btnResume")
                        : t("btnRecord")}
                  </span>
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("recordHint")}
                </p>

                {isLive && (
                  <Button variant="secondary" onClick={stop}>
                    <Square className="size-4" /> {t("finishRecording")}
                  </Button>
                )}

                {error && !audioUrl && (
                  <p className="w-full rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive-foreground">
                    {error}
                  </p>
                )}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-pressed={showAdvanced}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-secondary"
              >
                {showAdvanced ? t("fewerOptions") : t("moreOptions")}
              </button>
            </div>

            <section
              className={
                showAdvanced ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"
              }
            >
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Music className="size-4" /> {t("bgMusic")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BG_TRACKS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => toggleBackground(bg.id)}
                      aria-pressed={bgTrack === bg.id}
                      title={bgDesc(bg)}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-transform hover:scale-105 active:scale-95 ${
                        bgTrack === bg.id
                          ? "border-accent bg-accent/20 text-accent"
                          : "border-border bg-secondary/40"
                      }`}
                    >
                      <span className="text-base">{bg.emoji}</span>{" "}
                      {bgLabel(bg)}
                    </button>
                  ))}
                  {sounds
                    .filter((s) => s.kind === "musica")
                    .map((s) => {
                      const id = `so:${s.id}`;
                      return (
                        <button
                          key={id}
                          onClick={() => toggleBackground(id)}
                          aria-pressed={bgTrack === id}
                          title={s.name}
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-transform hover:scale-105 active:scale-95 ${
                            bgTrack === id
                              ? "border-accent bg-accent/20 text-accent"
                              : "border-border bg-secondary/40"
                          }`}
                        >
                          <span className="text-base">{s.emoji}</span> {s.name}
                        </button>
                      );
                    })}
                  {bgTrack && (
                    <button
                      onClick={stopBackground}
                      className="flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive-foreground transition-transform hover:scale-105 active:scale-95"
                    >
                      <Square className="size-3.5" /> {t("stop")}
                    </button>
                  )}
                </div>
                {showAdvanced && (
                  <label className="mt-2 block text-xs text-muted-foreground">
                    {t("bgVolume")}
                    <input
                      type="range"
                      min={0}
                      max={0.4}
                      step={0.01}
                      value={bgVolume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBgVolume(v);
                        bgRef.current?.setVolume(v);
                      }}
                      className="mt-1 w-full"
                    />
                  </label>
                )}
              </div>

              {showAdvanced && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Users className="size-4" /> {t("collabMode")}
                  </p>
                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={duo}
                      onChange={(e) => {
                        setDuo(e.target.checked);
                        if (e.target.checked) void refreshDevices();
                      }}
                      className="size-4"
                    />
                    {t("twoMics")}
                  </label>
                  {duo && (
                    <div className="mt-2 space-y-2">
                      {[
                        { label: t("micA"), value: micA, set: setMicA },
                        { label: t("micB"), value: micB, set: setMicB },
                      ].map((mic) => (
                        <label
                          key={mic.label}
                          className="block text-xs text-muted-foreground"
                        >
                          {mic.label}
                          <select
                            value={mic.value}
                            onChange={(e) => mic.set(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                          >
                            <option value="">{t("micDefault")}</option>
                            {devices.map((d, i) => (
                              <option key={d.deviceId} value={d.deviceId}>
                                {d.label || t("micN", { n: i + 1 })}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("step3Title")}
              </h2>

              {showAdvanced && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted-foreground">
                    {t("fxVolume")}
                    <span className="ml-1 font-semibold text-foreground">
                      {Math.round(fxVolume * 100)}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={fxVolume}
                      onChange={(e) => setFxVolume(Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className="block text-xs text-muted-foreground">
                    {t("fxFade")}
                    <span className="ml-1 font-semibold text-foreground">
                      {fxFade === 0 ? t("fxFadeDry") : `${fxFade.toFixed(1)} s`}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.1}
                      value={fxFade}
                      onChange={(e) => setFxFade(Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </label>
                </div>
              )}

              <div className="mt-3 grid grid-cols-5 gap-2">
                {EFFECTS.map((fx) => (
                  <button
                    key={fx.id}
                    onClick={() => triggerEffect(fx.id)}
                    aria-label={t("playSound", { name: fxLabel(fx.id) })}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105 active:scale-95 ${
                      activeEffect === fx.id
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-border bg-secondary/40 text-foreground"
                    }`}
                  >
                    <span className="text-2xl">{fx.emoji}</span>
                    <span className="text-[11px] font-semibold">
                      {fxLabel(fx.id)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{t("classSounds")}</h3>
                  {showAdvanced && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-4" /> {t("uploadSounds")}
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleUpload(e.target.files)}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("galleryShared")}
                  {!user && ` ${t("galleryLoginHint")}`}
                </p>

                {showAdvanced && (
                  <>
                    <div className="mt-2 flex gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setUploadKind("efecte")}
                        aria-pressed={uploadKind === "efecte"}
                        className={`flex-1 rounded-full border px-2.5 py-1 font-semibold transition-colors ${
                          uploadKind === "efecte"
                            ? "border-accent bg-accent/20 text-accent"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        🔊 {t("uploadKindEffect")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadKind("musica")}
                        aria-pressed={uploadKind === "musica"}
                        className={`flex-1 rounded-full border px-2.5 py-1 font-semibold transition-colors ${
                          uploadKind === "musica"
                            ? "border-accent bg-accent/20 text-accent"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        🎵 {t("bgMusic")}
                      </button>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-2 cursor-pointer rounded-xl border border-dashed p-2.5 text-center text-xs transition-colors ${
                        dragOver
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {uploadKind === "musica"
                        ? t("dropMusic")
                        : t("dropSounds")}
                    </div>
                  </>
                )}

                {uploadStatus && (
                  <p className="mt-2 text-center text-xs font-semibold text-accent">
                    {uploadStatus}
                  </p>
                )}

                {sounds.filter((s) => s.kind === "efecte").length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {sounds
                      .filter((s) => s.kind === "efecte")
                      .map((s) => (
                        <div key={s.id} className="relative">
                          <button
                            onClick={() => void triggerCustom(s)}
                            aria-label={t("playSound", { name: s.name })}
                            className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105 active:scale-95 ${
                              activeCustom === s.id
                                ? "border-accent bg-accent/20 text-accent"
                                : "border-border bg-secondary/40 text-foreground"
                            }`}
                          >
                            <span className="text-2xl">{s.emoji}</span>
                            <span className="line-clamp-1 text-[11px] font-semibold">
                              {s.name}
                            </span>
                          </button>
                          {user && user.id === s.owner_user_id && (
                            <button
                              onClick={() => void removeCustom(s.id)}
                              aria-label={t("deleteSound", { name: s.name })}
                              className="absolute -right-1.5 -top-1.5 rounded-full border border-border bg-card p-1 text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={t("resizeCol3")}
            onPointerDown={startDrag("right", col3Width)}
            onDoubleClick={() => setCol3Width(COL3_DEFAULT)}
            className="col-resize-handle hidden xl:flex"
          >
            <span />
          </div>

          {/* ---------- Columna 3: edició, escolta i publicació ---------- */}
          <div className="min-h-0 space-y-3 lg:col-span-2 lg:overflow-y-auto lg:pr-1 xl:col-span-1">
            <section
              ref={resultRef}
              className={`rounded-2xl border bg-card p-4 shadow-sm transition-all duration-500 ${
                justFinished
                  ? "border-accent ring-2 ring-accent/50"
                  : "border-border"
              }`}
            >
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("step4Title")}
              </h2>
              {justFinished && audioUrl && (
                <p className="mt-2 rounded-xl bg-accent/15 p-2 text-center text-sm font-semibold text-accent">
                  🎉 {t("finishedBanner")}
                </p>
              )}

              {!audioUrl && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("emptyHint")}
                </p>
              )}

              {audioUrl && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-border bg-secondary/40 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("originalRecording")}
                    </p>
                    <audio controls src={audioUrl} className="w-full" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={runAutoEdit} disabled={editing}>
                      {editing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {aiLoading
                        ? t("aiEditing")
                        : editing
                          ? t("editing")
                          : t("editWithAi")}
                    </Button>
                    <a
                      href={audioUrl}
                      download="radio-escolar.webm"
                      className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    >
                      <Download className="size-4" /> {t("downloadOriginal")}
                    </a>
                  </div>

                  {edited && (
                    <div className="rounded-xl border border-accent/50 bg-accent/10 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
                        {t("editedVersion", {
                          time: formatTime(edited.editedSeconds),
                          before: formatTime(edited.originalSeconds),
                        })}
                      </p>
                      <audio controls src={edited.url} className="w-full" />
                      <a
                        href={edited.url}
                        download="podcast-editat.wav"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                      >
                        <Download className="size-4" /> {t("downloadEdited")}
                      </a>
                    </div>
                  )}

                  {aiLoading && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />{" "}
                      {t("aiListening")}
                    </p>
                  )}

                  {ai && (
                    <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
                        <Wand2 className="size-4" /> {t("aiSuggested")}
                      </div>
                      <div>
                        <h3 className="text-base font-bold">{ai.titulo}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {ai.resumen}
                        </p>
                      </div>

                      {ai.capitulos.length > 0 && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("chapters")}
                          </p>
                          <ul className="space-y-1 text-sm">
                            {ai.capitulos.map((c, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="font-mono tabular-nums text-accent">
                                  {c.tiempo}
                                </span>
                                <span>{c.titulo}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ai.consejos.length > 0 && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {t("tipsNext")}
                          </p>
                          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                            {ai.consejos.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ai.transcript && (
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium">
                            {t("viewTranscript")}
                          </summary>
                          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                            {ai.transcript}
                          </p>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && audioUrl && (
                <p className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive-foreground">
                  {error}
                </p>
              )}
            </section>

            {audioUrl && (
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Headphones className="size-4" /> {t("step5Title")}
                </h2>
                <audio
                  controls
                  src={edited?.url ?? audioUrl}
                  className="mt-3 w-full"
                />

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void exportMp3()}
                    disabled={mp3Busy}
                  >
                    {mp3Busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FileAudio className="size-4" />
                    )}
                    {mp3Busy ? t("convertingMp3") : t("exportMp3")}
                  </Button>
                  {mp3Url && (
                    <a
                      href={mp3Url}
                      download={safeFileName(finalTitle())}
                      className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    >
                      <Download className="size-4" />{" "}
                      {t("downloadFile", { name: safeFileName(finalTitle()) })}
                    </a>
                  )}
                </div>
              </section>
            )}

            {audioUrl && (
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("step6Title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("publishIntro")}{" "}
                  <Link to="/mur" className="text-accent hover:underline">
                    {t("publishIntroLink")}
                  </Link>
                  .
                </p>
                <PublishPodcast
                  getBlob={finalBlob}
                  transcript={ai?.transcript ?? ""}
                  dur={edited?.editedSeconds ?? seconds}
                  defaultTitle={ai?.titulo ?? tpl?.nombre ?? ""}
                  defaultDesc={ai?.resumen ?? ""}
                  template={template?.id ?? null}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
