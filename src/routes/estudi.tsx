import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square, Download, Wand2, Loader2, Sparkles, Upload, Trash2, ListChecks, Music, Users, FileAudio, Headphones, GraduationCap, Printer } from "lucide-react";
import { Waveform } from "@/components/Waveform";
import { LevelMeter } from "@/components/LevelMeter";
import { PublishPodcast } from "@/components/PublishPodcast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";

import { Button } from "@/components/ui/button";
import { EFFECTS, playEffect, type EffectId } from "@/lib/soundEffects";
import { SITE_NAME } from "@/lib/siteConfig";
import { autoEdit, type AutoEditResult } from "@/lib/autoEdit";
import { BG_TRACKS, startBackground, type BgHandle } from "@/lib/bgMusic";
import { encodeMp3, safeFileName } from "@/lib/mp3";
import { playBuffer, randomEmoji } from "@/lib/customSounds";
import { blobToBase64 } from "@/lib/publishPodcast";
import { fetchSounds, uploadSoundFn, deleteSoundFn } from "@/lib/sounds.functions";
import type { SoundRow } from "@/lib/sounds.server";
import { useAuth } from "@/lib/auth";
import { TEMPLATES, type PodcastTemplate } from "@/lib/podcastTemplates";
import { printTemplateGuide } from "@/lib/printTemplate";
import type { AiEditResult } from "@/routes/api/ai-edit";




export const Route = createFileRoute("/estudi")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — Grava el teu pòdcast amb ona i efectes` },
      {
        name: "description",
        content:
          "Estudi de ràdio per a alumnes: grava la teva veu, mira l'ona en directe, llaça aplaudiments i efectes, i edita el pòdcast automàticament.",
      },
      { property: "og:title", content: `${SITE_NAME} — Estudi de pòdcast` },
      {
        property: "og:description",
        content: "Grava pòdcast amb ona en directe, botons d'efectes i edició automàtica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RadioStudio,
});

type Status = "idle" | "recording" | "paused" | "done";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function RadioStudio() {
  const { user } = useAuth();
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
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeCustom, setActiveCustom] = useState<number | null>(null);
  const [template, setTemplate] = useState<PodcastTemplate | null>(null);
  const [bgTrack, setBgTrack] = useState<string | null>(null);
  const [bgVolume, setBgVolume] = useState(0.12);
  const [fxVolume, setFxVolume] = useState(0.9);
  const [fxFade, setFxFade] = useState(0);

  const [duo, setDuo] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [micA, setMicA] = useState("");
  const [micB, setMicB] = useState("");
  const [mp3Busy, setMp3Busy] = useState(false);
  const [mp3Url, setMp3Url] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bufferCache = useRef<Map<number, AudioBuffer>>(new Map());

  const COL1_DEFAULT = 300;
  const COL3_DEFAULT = 360;
  const [col1Width, setCol1Width] = useState(COL1_DEFAULT);
  const [col3Width, setCol3Width] = useState(COL3_DEFAULT);
  const dragging = useRef<"left" | "right" | null>(null);
  const dragStart = useRef({ x: 0, width: 0 });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("studioColWidths") ?? "null") as {
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
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
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
      localStorage.setItem("studioColWidths", JSON.stringify({ col1: col1Width, col3: col3Width }));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [col1Width, col3Width]);

  const startDrag = (which: "left" | "right", width: number) => (e: React.PointerEvent) => {
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
    playEffect(ctx, id, destinations, { volume: fxVolume, fadeIn: fxFade, fadeOut: fxFade });
    setActiveEffect(id);
    window.setTimeout(() => setActiveEffect((cur) => (cur === id ? null : cur)), 500);
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
      window.setTimeout(() => setActiveCustom((cur) => (cur === sound.id ? null : cur)), 500);
    } catch {
      setError(`No s'ha pogut reproduir "${sound.name}".`);
    }
  };

  const handleUpload = async (files: FileList | File[] | null) => {
    const list = files ? Array.from(files as ArrayLike<File>) : [];
    if (list.length === 0) return;
    setError(null);

    if (!user) {
      setError("Inicia sessió amb Google per afegir sons a la galeria compartida de la classe.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadStatus(`Pujant ${list.length} so${list.length > 1 ? "ns" : ""}...`);

    let addedCount = 0;
    const rejected: string[] = [];

    for (const file of list) {
      const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|m4a|ogg|aac|webm)$/i.test(file.name);
      if (!isAudio) {
        rejected.push(`${file.name} (no és àudio)`);
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        rejected.push(`${file.name} (més de 8 MB)`);
        continue;
      }
      try {
        const dataBase64 = await blobToBase64(file);
        await uploadSoundFn({
          data: {
            name: file.name.replace(/\.[^.]+$/, "").slice(0, 24) || "El meu so",
            emoji: randomEmoji(),
            mime: file.type || "audio/mpeg",
            dataBase64,
          },
        });
        addedCount += 1;
      } catch {
        rejected.push(`${file.name} (no s'ha pogut pujar)`);
      }
    }

    if (addedCount > 0) refreshSounds();
    setUploadStatus(
      addedCount > 0 ? `Fet! S'han afegit ${addedCount} so${addedCount > 1 ? "ns" : ""} a la galeria.` : null,
    );
    if (rejected.length > 0) setError(`No s'han pogut afegir: ${rejected.join(", ")}.`);
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
      setError(e instanceof Error ? e.message : "No s'ha pogut esborrar el so.");
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
      setError("No s'han pogut llegir els micròfons. Dóna permís al navegador.");
    }
  };

  const toggleBackground = (id: string) => {
    const next = bgTrack === id ? null : id;
    setBgTrack(next);
    bgRef.current?.stop();
    bgRef.current = null;
    if (next) {
      const ctx = ensureCtx();
      bgRef.current = startBackground(ctx, next, destinationsNow(ctx), bgVolume);
    }
  };

  const start = async () => {
    setError(null);
    try {
      const wanted: MediaTrackConstraints[] = duo
        ? [
            micA ? { deviceId: { exact: micA } } : {},
            micB ? { deviceId: { exact: micB } } : {},
          ]
        : [{}];

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
        bgRef.current = startBackground(ctx, bgTrack, [monitorRef.current ?? ctx.destination, mix], bgVolume);
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
      setError("No s'ha pogut accedir al micròfon. Dóna permís al navegador i torna-ho a provar.");
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
            ? "La IA està molt ocupada ara mateix. Torna-ho a provar d'aquí a un minut."
            : res.status === 402
              ? "S'han esgotat els crèdits d'IA de l'espai de treball."
              : `La IA no ha pogut editar el pòdcast: ${body}`,
        );
      } else {
        setAi((await res.json()) as AiEditResult);
      }
    } catch {
      setError("No s'ha pogut editar l'àudio automàticament. Prova de gravar-ho de nou.");
    } finally {
      setAiLoading(false);
      setEditing(false);
    }
  };

  /** La versió que es publica i s'exporta: l'editada si existeix, si no l'original. */
  const finalBlob = () => edited?.blob ?? blobRef.current;
  const finalTitle = () => ai?.titulo || template?.nombre || SITE_NAME;

  const exportMp3 = async () => {
    const blob = finalBlob();
    if (!blob) return;
    setMp3Busy(true);
    setError(null);
    try {
      const mp3 = await encodeMp3(blob, {
        title: finalTitle(),
        artist: SITE_NAME,
        album: template?.nombre ?? "Pòdcasts de classe",
        comment: ai?.resumen ?? "",
      });
      setMp3Url(URL.createObjectURL(mp3));
    } catch {
      setError("No s'ha pogut convertir a MP3. Prova de tornar a gravar.");
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
              <h1 className="truncate text-xl font-bold tracking-tight">{SITE_NAME}</h1>
              <p className="truncate text-xs text-muted-foreground">
                Grava el teu pòdcast, afegeix-hi efectes i edita amb un clic.
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
            <Link
              to="/mur"
              className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:inline-flex"
            >
              Mur de la classe
            </Link>
            <Link
              to="/mestre"
              className="hidden items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:inline-flex"
            >
              <GraduationCap className="size-3.5" /> Mestre
            </Link>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                status === "recording"
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {status === "recording"
                ? "En antena"
                : status === "paused"
                  ? "En pausa"
                  : status === "done"
                    ? "Llest"
                    : "A punt"}
            </span>
          </div>
        </header>

        <div
          className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2 xl:grid-cols-[var(--col1)_6px_minmax(0,1fr)_6px_var(--col3)]"
          style={{ "--col1": `${col1Width}px`, "--col3": `${col3Width}px` } as React.CSSProperties}
        >
          {/* ---------- Columna 1: plantilla i guia ---------- */}
          <div className="min-h-0 space-y-3 lg:overflow-y-auto lg:pr-1">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                1. Tria una plantilla
              </h2>

              <div className="mt-3 grid gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate((cur) => (cur?.id === t.id ? null : t))}
                    aria-pressed={template?.id === t.id}
                    className={`flex items-start gap-2 rounded-xl border p-2.5 text-left transition-all hover:scale-[1.01] active:scale-95 ${
                      template?.id === t.id
                        ? "border-accent bg-accent/15"
                        : "border-border bg-secondary/40"
                    }`}
                  >
                    <span className="text-2xl leading-none">{t.emoji}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{t.nombre}</span>
                      <span className="block text-xs text-muted-foreground">{t.descripcion}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-accent">
                        Objectiu {formatTime(t.duracionObjetivo)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {template && (
              <section className="space-y-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                    <ListChecks className="size-4" /> Guia de {template.nombre}
                  </div>
                  <button
                    type="button"
                    onClick={() => printTemplateGuide(template)}
                    className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-card px-2.5 py-1 text-xs font-semibold text-accent transition-transform hover:scale-105 active:scale-95"
                  >
                    <Printer className="size-3.5" /> PDF
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Intro (llegeix-la tal qual)
                  </p>
                  <p className="mt-1 text-sm">{template.intro}</p>
                </div>

                <ol className="space-y-2">
                  {template.pasos.map((paso, i) => {
                    const inicio = template.pasos
                      .slice(0, i)
                      .reduce((acc, p) => acc + p.segundos, 0);
                    const fin = inicio + paso.segundos;
                    const activo = isLive && seconds >= inicio && seconds < fin;
                    return (
                      <li
                        key={paso.titulo}
                        className={`flex gap-2 rounded-xl border p-2.5 text-sm ${
                          activo ? "border-accent bg-accent/20" : "border-border/60 bg-card/60"
                        }`}
                      >
                        <span className="font-mono tabular-nums text-accent">
                          {formatTime(inicio)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold">{paso.titulo}</span>
                          <span className="block text-muted-foreground">{paso.guion}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Outro (per acomiadar-te)
                  </p>
                  <p className="mt-1 text-sm">{template.outro}</p>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Efectes recomanats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.efectos.map((id) => {
                      const fx = EFFECTS.find((e) => e.id === id);
                      if (!fx) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => triggerEffect(id)}
                          className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-semibold transition-transform hover:scale-105 active:scale-95"
                        >
                          <span className="text-base">{fx.emoji}</span> {fx.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Canvia l'amplada de la primera columna"
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
                  2. Pista de gravació
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
                  onClick={status === "idle" || status === "done" ? start : togglePause}
                  aria-label={
                    status === "recording"
                      ? "Pausar la gravació"
                      : status === "paused"
                        ? "Continuar la gravació"
                        : "Començar a gravar"
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
                    {status === "recording" ? "Pausa" : status === "paused" ? "Segueix" : "Gravar"}
                  </span>
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  Prem el botó gran per gravar i torna a prémer-lo per aturar-te un moment.
                </p>

                {isLive && (
                  <Button variant="secondary" onClick={stop}>
                    <Square className="size-4" /> Acabar la gravació
                  </Button>
                )}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Music className="size-4" /> Música de fons
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {BG_TRACKS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleBackground(t.id)}
                      aria-pressed={bgTrack === t.id}
                      title={t.descripcion}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-transform hover:scale-105 active:scale-95 ${
                        bgTrack === t.id ? "border-accent bg-accent/20 text-accent" : "border-border bg-secondary/40"
                      }`}
                    >
                      <span className="text-base">{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
                <label className="mt-2 block text-xs text-muted-foreground">
                  Volum de la música
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
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Users className="size-4" /> Mode col·laboratiu
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
                  Gravar amb dos micròfons
                </label>
                {duo && (
                  <div className="mt-2 space-y-2">
                    {[
                      { label: "Micròfon A", value: micA, set: setMicA },
                      { label: "Micròfon B", value: micB, set: setMicB },
                    ].map((m) => (
                      <label key={m.label} className="block text-xs text-muted-foreground">
                        {m.label}
                        <select
                          value={m.value}
                          onChange={(e) => m.set(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground"
                        >
                          <option value="">Per defecte</option>
                          {devices.map((d, i) => (
                            <option key={d.deviceId} value={d.deviceId}>
                              {d.label || `Micròfon ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3. Efectes de so
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs text-muted-foreground">
                  Volum dels efectes
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
                  Entrada i sortida suau
                  <span className="ml-1 font-semibold text-foreground">
                    {fxFade === 0 ? "sec" : `${fxFade.toFixed(1)} s`}
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

              <div className="mt-3 grid grid-cols-5 gap-2">

                {EFFECTS.map((fx) => (
                  <button
                    key={fx.id}
                    onClick={() => triggerEffect(fx.id)}
                    aria-label={`Reproduir ${fx.label}`}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105 active:scale-95 ${
                      activeEffect === fx.id
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-border bg-secondary/40 text-foreground"
                    }`}
                  >
                    <span className="text-2xl">{fx.emoji}</span>
                    <span className="text-[11px] font-semibold">{fx.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Sons de la classe</h3>
                  <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="size-4" /> Pujar sons
                  </Button>
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
                  Galeria compartida: tothom de l'escola pot fer servir els sons que hi puja la classe.
                  {!user && " Inicia sessió per afegir-ne de nous."}
                </p>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 cursor-pointer rounded-xl border border-dashed p-2.5 text-center text-xs transition-colors ${
                    dragOver ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"
                  }`}
                >
                  Arrossega aquí diversos sons alhora (o fes clic per triar-los).
                </div>

                {uploadStatus && (
                  <p className="mt-2 text-center text-xs font-semibold text-accent">{uploadStatus}</p>
                )}

                {sounds.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {sounds.map((s) => (
                      <div key={s.id} className="relative">
                        <button
                          onClick={() => void triggerCustom(s)}
                          aria-label={`Reproduir ${s.name}`}
                          className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105 active:scale-95 ${
                            activeCustom === s.id
                              ? "border-accent bg-accent/20 text-accent"
                              : "border-border bg-secondary/40 text-foreground"
                          }`}
                        >
                          <span className="text-2xl">{s.emoji}</span>
                          <span className="line-clamp-1 text-[11px] font-semibold">{s.name}</span>
                        </button>
                        {user && user.id === s.owner_user_id && (
                          <button
                            onClick={() => void removeCustom(s.id)}
                            aria-label={`Esborrar ${s.name}`}
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
            aria-label="Canvia l'amplada de la tercera columna"
            onPointerDown={startDrag("right", col3Width)}
            onDoubleClick={() => setCol3Width(COL3_DEFAULT)}
            className="col-resize-handle hidden xl:flex"
          >
            <span />
          </div>

          {/* ---------- Columna 3: edició, escolta i publicació ---------- */}
          <div className="min-h-0 space-y-3 lg:col-span-2 lg:overflow-y-auto lg:pr-1 xl:col-span-1">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                4. El teu pòdcast
              </h2>

              {!audioUrl && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Quan acabis la gravació, aquí la podràs escoltar, editar i descarregar.
                </p>
              )}

              {audioUrl && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-border bg-secondary/40 p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Gravació original
                    </p>
                    <audio controls src={audioUrl} className="w-full" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={runAutoEdit} disabled={editing}>
                      {editing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                      {aiLoading ? "La IA està editant..." : editing ? "Editant..." : "Editar amb IA"}
                    </Button>
                    <a
                      href={audioUrl}
                      download="radio-escolar.webm"
                      className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    >
                      <Download className="size-4" /> Descarregar l'original
                    </a>
                  </div>

                  {edited && (
                    <div className="rounded-xl border border-accent/50 bg-accent/10 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
                        Versió editada · {formatTime(edited.editedSeconds)} (abans{" "}
                        {formatTime(edited.originalSeconds)})
                      </p>
                      <audio controls src={edited.url} className="w-full" />
                      <a
                        href={edited.url}
                        download="podcast-editat.wav"
                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                      >
                        <Download className="size-4" /> Descarregar el pòdcast editat
                      </a>
                    </div>
                  )}

                  {aiLoading && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" /> La IA està escoltant el teu pòdcast...
                    </p>
                  )}

                  {ai && (
                    <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent">
                        <Wand2 className="size-4" /> Muntatge suggerit per la IA
                      </div>
                      <div>
                        <h3 className="text-base font-bold">{ai.titulo}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{ai.resumen}</p>
                      </div>

                      {ai.capitulos.length > 0 && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Capítols
                          </p>
                          <ul className="space-y-1 text-sm">
                            {ai.capitulos.map((c, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="font-mono tabular-nums text-accent">{c.tiempo}</span>
                                <span>{c.titulo}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {ai.consejos.length > 0 && (
                        <div>
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Consells per a la pròxima
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
                          <summary className="cursor-pointer font-medium">Veure la transcripció</summary>
                          <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                            {ai.transcript}
                          </p>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-center text-sm text-destructive-foreground">
                  {error}
                </p>
              )}
            </section>

            {audioUrl && (
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Headphones className="size-4" /> 5. Pre-escolta i exporta
                </h2>
                <audio controls src={edited?.url ?? audioUrl} className="mt-3 w-full" />

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="secondary" onClick={() => void exportMp3()} disabled={mp3Busy}>
                    {mp3Busy ? <Loader2 className="size-4 animate-spin" /> : <FileAudio className="size-4" />}
                    {mp3Busy ? "Convertint a MP3..." : "Exportar en MP3"}
                  </Button>
                  {mp3Url && (
                    <a
                      href={mp3Url}
                      download={safeFileName(finalTitle())}
                      className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                    >
                      <Download className="size-4" /> Descarregar {safeFileName(finalTitle())}
                    </a>
                  )}
                </div>
              </section>
            )}

            {audioUrl && (
              <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  6. Publica el pòdcast
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Omple la fitxa i envia'l a la ràdio de l'escola. El mestre el revisarà abans que surti al{" "}
                  <Link to="/mur" className="text-accent hover:underline">
                    mur de la classe
                  </Link>
                  .
                </p>
                <PublishPodcast
                  getBlob={finalBlob}
                  transcript={ai?.transcript ?? ""}
                  dur={edited?.editedSeconds ?? seconds}
                  defaultTitle={ai?.titulo ?? template?.nombre ?? ""}
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
