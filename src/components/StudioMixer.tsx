/**
 * Taula de mescles de l'estudi: el hook useStudioAudio gestiona el motor
 * (src/lib/studioAudio.ts), els dispositius, la persistència i les
 * desconnexions; el component StudioMixer n'és la interfície.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Headphones,
  Mic,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StudioEngine,
  detectOutputSupport,
  type InputChannel,
  type MicConfig,
  type MonitorLevels,
  type OutputSupport,
} from "@/lib/studioAudio";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  matchDevice,
  newMic,
  saveSettings,
  type StudioAudioSettings,
} from "@/lib/studioAudioSettings";
import { useT, type Translate } from "@/lib/i18n";
import { mixerMessages as m } from "@/lib/i18n/messages/mixer";

const MAX_MICS = 4;

export interface StudioAudio {
  settings: StudioAudioSettings;
  inputs: MediaDeviceInfo[];
  outputs: MediaDeviceInfo[];
  support: OutputSupport;
  maxOutputChannels: number;
  micStatus: Record<string, { connected: boolean; mono: boolean }>;
  outputErrors: string[];
  testing: boolean;
  busy: boolean;
  error: string | null;
  /** Crea (si cal) el motor amb les sortides i nivells actuals. */
  ensureEngine: () => StudioEngine;
  /** Obre els micros configurats (si encara no ho estan). */
  openMics: () => Promise<void>;
  /** Tanca els micros i el motor (en acabar de gravar). */
  dispose: () => void;
  toggleTest: () => Promise<void>;
  refreshDevices: (askPermission?: boolean) => Promise<void>;
  addMic: () => void;
  removeMic: (id: string) => void;
  updateMic: (id: string, patch: Partial<Omit<MicConfig, "id">>) => void;
  setOutputs: (ids: string[]) => void;
  setPair: (pair: number) => void;
  setMonitor: (patch: Partial<MonitorLevels>) => void;
  setSingleMonitor: (on: boolean) => void;
  setProcessing: (on: boolean) => void;
}

export function useStudioAudio({ multi }: { multi: boolean }): StudioAudio {
  const [settings, setSettings] =
    useState<StudioAudioSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [outputs, setOutputsList] = useState<MediaDeviceInfo[]>([]);
  const [support, setSupport] = useState<OutputSupport>({
    contextSink: false,
    elementSink: false,
    mode: "default",
  });
  const [maxOutputChannels, setMaxOutputChannels] = useState(2);
  const [micStatus, setMicStatus] = useState<
    Record<string, { connected: boolean; mono: boolean }>
  >({});
  const [outputErrors, setOutputErrors] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<StudioEngine | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const multiRef = useRef(multi);
  multiRef.current = multi;
  const outputsRef = useRef<MediaDeviceInfo[]>([]);
  outputsRef.current = outputs;

  // Carrega la configuració desada (després d'hidratar).
  useEffect(() => {
    setSupport(detectOutputSupport());
    const saved = loadSettings();
    if (saved) setSettings(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveSettings(settings);
  }, [settings, loaded]);

  /** Micros que es fan servir ara mateix: tots en mode múltiple, el primer (o el per defecte) si no. */
  const activeMics = useCallback((): MicConfig[] => {
    const s = settingsRef.current;
    if (multiRef.current) return s.mics.length > 0 ? s.mics : [newMic(0)];
    return [s.mics[0] ? { ...s.mics[0], pan: 0 } : newMic(0)];
  }, []);

  const levelsFor = useCallback((s: StudioAudioSettings): MonitorLevels => {
    return {
      ...s.monitor,
      micsEnabled: multiRef.current ? s.monitor.micsEnabled : s.singleMonitor,
    };
  }, []);

  const refreshStatus = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) {
      setMicStatus({});
      return;
    }
    const next: Record<string, { connected: boolean; mono: boolean }> = {};
    eng.micStatus().forEach((st) => {
      next[st.id] = { connected: st.connected, mono: st.sourceChannels < 2 };
    });
    setMicStatus(next);
  }, []);

  /** Sortides que es volen i que ara mateix estan connectades. */
  const effectiveOutputs = useCallback((s: StudioAudioSettings) => {
    const available = outputsRef.current;
    if (available.length === 0) return s.outputs; // encara no llistades: ho intentem igual
    return s.outputs
      .map((id) => matchDevice(id, s.outputLabels[id] ?? "", available))
      .filter((id) => id && id !== "default");
  }, []);

  const applyOutputs = useCallback(
    async (s: StudioAudioSettings) => {
      const eng = engineRef.current;
      if (!eng) return;
      const failed = await eng.setOutputs(effectiveOutputs(s), s.pair);
      setOutputErrors(failed);
      setMaxOutputChannels(eng.maxOutputChannels);
    },
    [effectiveOutputs],
  );

  const ensureEngine = useCallback((): StudioEngine => {
    let eng = engineRef.current;
    if (!eng || eng.ctx.state === "closed") {
      eng = new StudioEngine(levelsFor(settingsRef.current));
      eng.setOnStripChange(() => refreshStatus());
      engineRef.current = eng;
      setMaxOutputChannels(eng.maxOutputChannels);
      void applyOutputs(settingsRef.current);
    }
    void eng.ctx.resume();
    return eng;
  }, [applyOutputs, levelsFor, refreshStatus]);

  const refreshDevices = useCallback(async (askPermission = false) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
    try {
      if (askPermission) {
        const probe = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        probe.getTracks().forEach((t) => t.stop());
      }
      const all = await navigator.mediaDevices.enumerateDevices();
      setInputs(
        all.filter(
          (d) =>
            d.kind === "audioinput" && !!d.deviceId && d.deviceId !== "default",
        ),
      );
      setOutputsList(
        all.filter(
          (d) =>
            d.kind === "audiooutput" &&
            !!d.deviceId &&
            d.deviceId !== "default",
        ),
      );
    } catch {
      setError("micsFailed");
    }
  }, []);

  const openMics = useCallback(async () => {
    const eng = ensureEngine();
    if (eng.hasMics()) return;
    const s = settingsRef.current;
    const list = activeMics().map((mic) => ({
      ...mic,
      deviceId: matchDevice(mic.deviceId, mic.label, inputs),
    }));
    for (const mic of list) {
      await eng.addMic(mic, { processing: s.processing });
    }
    refreshStatus();
    // Amb el permís concedit, els noms dels dispositius ja es poden llegir.
    void refreshDevices(false);
  }, [activeMics, ensureEngine, inputs, refreshDevices, refreshStatus]);

  const dispose = useCallback(() => {
    engineRef.current?.dispose();
    engineRef.current = null;
    setTesting(false);
    setMicStatus({});
  }, []);

  const toggleTest = useCallback(async () => {
    setError(null);
    if (testing) {
      dispose();
      return;
    }
    setBusy(true);
    try {
      await openMics();
      setTesting(true);
    } catch {
      setError("micsFailed");
      dispose();
    } finally {
      setBusy(false);
    }
  }, [dispose, openMics, testing]);

  useEffect(() => () => engineRef.current?.dispose(), []);

  // Canvis de nivell del retorn: en directe.
  useEffect(() => {
    engineRef.current?.setLevels(levelsFor(settings));
  }, [settings.monitor, settings.singleMonitor, multi, levelsFor, settings]);

  // Canvi de mode (1 micro ↔ diversos) amb els micros oberts: es tornen a obrir.
  const lastMulti = useRef(multi);
  useEffect(() => {
    if (lastMulti.current === multi) return;
    lastMulti.current = multi;
    const eng = engineRef.current;
    if (!eng || !eng.hasMics()) return;
    eng.micStatus().forEach((st) => eng.removeMic(st.id));
    void openMics().catch(() => setError("micsFailed"));
  }, [multi, openMics]);

  // Connexions i desconnexions de dispositius: la sessió no cau.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;
    const onChange = async () => {
      await refreshDevices(false);
      const eng = engineRef.current;
      if (!eng) return;
      // Sortides: torna a aplicar (treu les que han marxat, recupera les que tornen).
      await applyOutputs(settingsRef.current);
      // Micros: els desconnectats es tornen a obrir si el dispositiu ha tornat.
      const all = await navigator.mediaDevices
        .enumerateDevices()
        .catch(() => [] as MediaDeviceInfo[]);
      for (const st of eng.micStatus()) {
        if (st.connected) continue;
        const cfg = settingsRef.current.mics.find((x) => x.id === st.id);
        const deviceId = cfg?.deviceId ?? "";
        const back =
          !deviceId ||
          all.some((d) => d.kind === "audioinput" && d.deviceId === deviceId);
        if (back)
          await eng
            .reopenMic(st.id, { processing: settingsRef.current.processing })
            .catch(() => false);
      }
      refreshStatus();
    };
    const handler = () => void onChange();
    navigator.mediaDevices.addEventListener("devicechange", handler);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", handler);
  }, [applyOutputs, refreshDevices, refreshStatus]);

  // En activar el mode múltiple sense micros desats, en preparem dos (com l'antic mode a dos).
  useEffect(() => {
    if (!loaded || !multi) return;
    setSettings((cur) => {
      if (cur.mics.length > 0) return cur;
      const a = inputs[0];
      const b = inputs[1];
      return {
        ...cur,
        mics: [
          newMic(0, a?.deviceId ?? "", a?.label ?? ""),
          newMic(1, b?.deviceId ?? "", b?.label ?? ""),
        ],
      };
    });
  }, [loaded, multi, inputs]);

  // Llista inicial (sense demanar permís: si ja el tenia, surten els noms).
  useEffect(() => {
    void refreshDevices(false);
  }, [refreshDevices]);

  const patchSettings = useCallback((patch: Partial<StudioAudioSettings>) => {
    setSettings((cur) => ({ ...cur, ...patch }));
  }, []);

  const addMic = useCallback(() => {
    setSettings((cur) => {
      if (cur.mics.length >= MAX_MICS) return cur;
      const used = new Set(cur.mics.map((x) => x.deviceId));
      const free = inputs.find((d) => !used.has(d.deviceId));
      const mic = newMic(
        cur.mics.length,
        free?.deviceId ?? "",
        free?.label ?? "",
      );
      const eng = engineRef.current;
      if (eng?.hasMics() && multiRef.current) {
        void eng
          .addMic(mic, { processing: cur.processing })
          .then(refreshStatus)
          .catch(() => setError("micsFailed"));
      }
      return { ...cur, mics: [...cur.mics, mic] };
    });
  }, [inputs, refreshStatus]);

  const removeMic = useCallback(
    (id: string) => {
      engineRef.current?.removeMic(id);
      refreshStatus();
      setSettings((cur) => ({
        ...cur,
        mics: cur.mics.filter((x) => x.id !== id),
      }));
    },
    [refreshStatus],
  );

  const updateMic = useCallback(
    (id: string, patch: Partial<Omit<MicConfig, "id">>) => {
      let changedDevice = false;
      setSettings((cur) => {
        const mics = cur.mics.length > 0 ? cur.mics : [newMic(0)];
        const target = mics.find((x) => x.id === id) ?? mics[0]!;
        const next = { ...target, ...patch };
        changedDevice =
          patch.deviceId !== undefined && patch.deviceId !== target.deviceId;
        const updated = mics.map((x) => (x.id === target.id ? next : x));
        const eng = engineRef.current;
        if (eng?.hasMics()) {
          if (changedDevice) {
            eng.removeMic(target.id);
            void eng
              .addMic(next, { processing: cur.processing })
              .then(refreshStatus)
              .catch(() => setError("micsFailed"));
          } else {
            eng.updateMic(target.id, patch);
          }
        }
        return { ...cur, mics: updated };
      });
    },
    [refreshStatus],
  );

  const setOutputs = useCallback(
    (ids: string[]) => {
      setSettings((cur) => {
        const labels = { ...cur.outputLabels };
        ids.forEach((id) => {
          const d = outputsRef.current.find((x) => x.deviceId === id);
          if (d?.label) labels[id] = d.label;
        });
        const next = { ...cur, outputs: ids, outputLabels: labels };
        void applyOutputs(next);
        return next;
      });
    },
    [applyOutputs],
  );

  const setPair = useCallback(
    (pair: number) => {
      setSettings((cur) => {
        const next = { ...cur, pair };
        void applyOutputs(next);
        return next;
      });
    },
    [applyOutputs],
  );

  const setMonitor = useCallback((patch: Partial<MonitorLevels>) => {
    setSettings((cur) => ({ ...cur, monitor: { ...cur.monitor, ...patch } }));
  }, []);

  const setSingleMonitor = useCallback(
    (on: boolean) => patchSettings({ singleMonitor: on }),
    [patchSettings],
  );

  const setProcessing = useCallback(
    (on: boolean) => {
      patchSettings({ processing: on });
      // Les restriccions del micro només s'apliquen en obrir-lo: si és obert, el reobrim.
      const eng = engineRef.current;
      if (eng?.hasMics()) {
        eng.micStatus().forEach((st) => eng.removeMic(st.id));
        void openMics().catch(() => setError("micsFailed"));
      }
    },
    [openMics, patchSettings],
  );

  return {
    settings,
    inputs,
    outputs,
    support,
    maxOutputChannels,
    micStatus,
    outputErrors,
    testing,
    busy,
    error,
    ensureEngine,
    openMics,
    dispose,
    toggleTest,
    refreshDevices,
    addMic,
    removeMic,
    updateMic,
    setOutputs,
    setPair,
    setMonitor,
    setSingleMonitor,
    setProcessing,
  };
}

/* -------------------------------------------------------------------------- */

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <span className="ml-1 font-semibold text-foreground">{display}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}

function panLabel(t: Translate<typeof m>, pan: number): string {
  if (Math.abs(pan) < 0.05) return t("panCenter");
  const pct = Math.round(Math.abs(pan) * 100);
  return pan < 0 ? `${t("panLeft")} ${pct}%` : `${t("panRight")} ${pct}%`;
}

const selectClass =
  "mt-1 w-full rounded-lg border border-border bg-card px-2 py-1.5 text-sm text-foreground";

export function StudioMixer({
  audio,
  multi,
  onMultiChange,
  recording,
}: {
  audio: StudioAudio;
  multi: boolean;
  onMultiChange: (on: boolean) => void;
  recording: boolean;
}) {
  const t = useT(m);
  const { settings } = audio;
  const mics = multi ? settings.mics : [];
  const outputName = (id: string, i: number) =>
    audio.outputs.find((d) => d.deviceId === id)?.label ||
    settings.outputLabels[id] ||
    t("deviceN", { n: i + 1 });
  const pairs = Math.floor(audio.maxOutputChannels / 2);
  const monitorOn = multi
    ? settings.monitor.micsEnabled
    : settings.singleMonitor;

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={multi}
          onChange={(e) => {
            onMultiChange(e.target.checked);
            if (e.target.checked) void audio.refreshDevices(true);
          }}
          className="size-4"
        />
        {t("multiMode")}
      </label>

      {(multi || monitorOn) && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-600 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />{" "}
          {t("headphonesWarning")}
        </p>
      )}

      {multi && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Mic className="size-3.5" /> {t("micsTitle")}
          </p>
          {mics.map((mic, i) => {
            const status = audio.micStatus[mic.id];
            return (
              <div
                key={mic.id}
                className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">
                    {t("micN", { n: i + 1 })}
                    {status && !status.connected && (
                      <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive-foreground">
                        {t("disconnected")}
                      </span>
                    )}
                    {status?.mono && (
                      <span className="ml-2 text-[10px] uppercase text-muted-foreground">
                        {t("monoSource")}
                      </span>
                    )}
                  </span>
                  {mics.length > 1 && (
                    <button
                      onClick={() => audio.removeMic(mic.id)}
                      title={t("removeMic")}
                      aria-label={t("removeMic")}
                      className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
                <select
                  value={mic.deviceId}
                  onChange={(e) => {
                    const d = audio.inputs.find(
                      (x) => x.deviceId === e.target.value,
                    );
                    audio.updateMic(mic.id, {
                      deviceId: e.target.value,
                      label: d?.label ?? "",
                    });
                  }}
                  className={selectClass}
                  aria-label={t("micN", { n: i + 1 })}
                >
                  <option value="">{t("micDefault")}</option>
                  {audio.inputs.map((d, j) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || t("deviceN", { n: j + 1 })}
                    </option>
                  ))}
                </select>
                <label
                  className="block text-xs text-muted-foreground"
                  title={t("inputHint")}
                >
                  {t("inputChannel")}
                  <select
                    value={mic.inputChannel}
                    onChange={(e) =>
                      audio.updateMic(mic.id, {
                        inputChannel: e.target.value as InputChannel,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="mix">{t("inputMix")}</option>
                    <option value="left">{t("inputLeft")}</option>
                    <option value="right">{t("inputRight")}</option>
                  </select>
                </label>
                <div className="grid gap-2">
                  <Slider
                    label={t("volume")}
                    value={mic.volume}
                    min={0}
                    max={2}
                    step={0.05}
                    onChange={(v) => audio.updateMic(mic.id, { volume: v })}
                    display={`${Math.round(mic.volume * 100)}%`}
                  />
                  <div>
                    <Slider
                      label={t("pan")}
                      value={mic.pan}
                      min={-1}
                      max={1}
                      step={0.05}
                      onChange={(v) =>
                        audio.updateMic(mic.id, {
                          pan: Math.abs(v) < 0.05 ? 0 : v,
                        })
                      }
                      display={panLabel(t, mic.pan)}
                    />
                    {mic.pan !== 0 && (
                      <button
                        onClick={() => audio.updateMic(mic.id, { pan: 0 })}
                        className="text-[11px] font-semibold text-accent hover:underline"
                      >
                        {t("panCenter")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {mics.length < MAX_MICS && (
            <Button size="sm" variant="secondary" onClick={audio.addMic}>
              <Plus className="size-4" /> {t("addMic")}
            </Button>
          )}
        </div>
      )}

      <label
        className="flex items-start gap-2 text-xs text-muted-foreground"
        title={t("processingHint")}
      >
        <input
          type="checkbox"
          checked={settings.processing}
          onChange={(e) => audio.setProcessing(e.target.checked)}
          className="mt-0.5 size-4"
        />
        <span>
          {t("processing")}
          <span className="block text-[11px]">{t("processingHint")}</span>
        </span>
      </label>

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Headphones className="size-3.5" /> {t("outputsTitle")}
        </p>
        {audio.support.mode === "default" ? (
          <p className="text-xs text-muted-foreground">
            {t("outputUnsupported")}
          </p>
        ) : (
          <>
            {audio.support.mode === "element" && (
              <p className="text-xs text-muted-foreground">
                {t("outputElementOnly")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{t("outputsHint")}</p>
            {audio.outputs.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {t("noOutputsListed")}
              </p>
            ) : (
              <div className="space-y-1">
                {audio.outputs.map((d, i) => {
                  const checked = settings.outputs.includes(d.deviceId);
                  return (
                    <label
                      key={d.deviceId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          audio.setOutputs(
                            e.target.checked
                              ? [...settings.outputs, d.deviceId]
                              : settings.outputs.filter(
                                  (x) => x !== d.deviceId,
                                ),
                          )
                        }
                        className="size-4"
                      />
                      {outputName(d.deviceId, i)}
                    </label>
                  );
                })}
                {settings.outputs.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {t("outputDefault")}
                  </p>
                )}
              </div>
            )}
            {audio.outputErrors.length > 0 && (
              <p className="text-xs text-destructive-foreground">
                {t("outputFailed", {
                  list: audio.outputErrors
                    .map((id, i) => outputName(id, i))
                    .join(", "),
                })}
              </p>
            )}
            {audio.support.mode === "context" && pairs > 1 && (
              <label className="block text-xs text-muted-foreground">
                {t("pairLabel")}
                <select
                  value={Math.min(settings.pair, pairs - 1)}
                  onChange={(e) => audio.setPair(Number(e.target.value))}
                  className={selectClass}
                >
                  {Array.from({ length: pairs }, (_, p) => (
                    <option key={p} value={p}>
                      {t("pairOption", { a: p * 2 + 1, b: p * 2 + 2 })}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[11px]">
                  {t("pairHint", { n: audio.maxOutputChannels })}
                </span>
              </label>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("monitorTitle")}
        </p>
        <p className="text-[11px] text-muted-foreground">{t("monitorHint")}</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={monitorOn}
            onChange={(e) =>
              multi
                ? audio.setMonitor({ micsEnabled: e.target.checked })
                : audio.setSingleMonitor(e.target.checked)
            }
            className="size-4"
          />
          {t("monitorMicsOn")}
        </label>
        <Slider
          label={t("monitorMaster")}
          value={settings.monitor.master}
          min={0}
          max={1.5}
          step={0.05}
          onChange={(v) => audio.setMonitor({ master: v })}
          display={`${Math.round(settings.monitor.master * 100)}%`}
        />
        <Slider
          label={t("monitorMics")}
          value={settings.monitor.mics}
          min={0}
          max={1.5}
          step={0.05}
          onChange={(v) => audio.setMonitor({ mics: v })}
          display={`${Math.round(settings.monitor.mics * 100)}%`}
        />
        <Slider
          label={t("monitorFx")}
          value={settings.monitor.fx}
          min={0}
          max={1.5}
          step={0.05}
          onChange={(v) => audio.setMonitor({ fx: v })}
          display={`${Math.round(settings.monitor.fx * 100)}%`}
        />
      </div>

      {!recording && (
        <div>
          <Button
            size="sm"
            variant={audio.testing ? "destructive" : "secondary"}
            onClick={() => void audio.toggleTest()}
            disabled={audio.busy}
          >
            {audio.busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Headphones className="size-4" />
            )}
            {audio.testing ? t("testStop") : t("testStart")}
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("testHint")}
          </p>
        </div>
      )}
      {audio.error && (
        <p className="text-xs text-destructive-foreground">{t("micsFailed")}</p>
      )}
    </div>
  );
}
