/**
 * Configuració d'àudio de l'estudi que es recorda entre sessions
 * (localStorage, sempre dins de try/catch). Els deviceId només es
 * restauren si el dispositiu continua connectat; si no, es busca pel nom.
 */
import type { InputChannel, MicConfig, MonitorLevels } from "./studioAudio";

const KEY = "radio-estudi-audio-v1";

export interface StudioAudioSettings {
  mics: MicConfig[];
  outputs: string[];
  outputLabels: Record<string, string>;
  pair: number;
  monitor: MonitorLevels;
  processing: boolean;
  /**
   * Amb un sol micro, sentir la pròpia veu està desactivat per defecte: molta
   * gent grava amb els altaveus del portàtil i faria acoblament.
   */
  singleMonitor: boolean;
  /**
   * Mode de diversos micros: si cada persona rep també la seva pròpia veu.
   * Desactivat per defecte: el navegador la retorna amb retard i sona a eco.
   */
  selfMonitor: boolean;
  /**
   * Aparellament manual casc → micro (clau = deviceId de la sortida, "" = per
   * defecte; valor = id de la tira o "none"). Si no hi és, és automàtic.
   */
  pairs: Record<string, string>;
}

export const DEFAULT_SETTINGS: StudioAudioSettings = {
  mics: [],
  outputs: [],
  outputLabels: {},
  pair: 0,
  monitor: { micsEnabled: true, master: 1, mics: 1, fx: 1 },
  processing: false,
  singleMonitor: false,
  selfMonitor: false,
  pairs: {},
};

// Retorn a volum complet per defecte: efectes i fons sonen igual que abans del canvi.
export const DEFAULT_MONITOR: MonitorLevels = {
  micsEnabled: true,
  master: 1,
  mics: 1,
  fx: 1,
};

export function newMic(index: number, deviceId = "", label = ""): MicConfig {
  return {
    id: `mic-${Date.now().toString(36)}-${index}`,
    deviceId,
    label,
    inputChannel: "mix",
    volume: 1,
    pan: 0,
  };
}

function isInputChannel(v: unknown): v is InputChannel {
  return v === "mix" || v === "left" || v === "right";
}

function num(v: unknown, fallback: number, min: number, max: number): number {
  return typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, v))
    : fallback;
}

export function loadSettings(): StudioAudioSettings | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StudioAudioSettings>;
    const mics = Array.isArray(data.mics)
      ? data.mics.slice(0, 4).map((m, i) => ({
          id: typeof m.id === "string" ? m.id : newMic(i).id,
          deviceId: typeof m.deviceId === "string" ? m.deviceId : "",
          label: typeof m.label === "string" ? m.label : "",
          inputChannel: isInputChannel(m.inputChannel) ? m.inputChannel : "mix",
          volume: num(m.volume, 1, 0, 2),
          pan: num(m.pan, 0, -1, 1),
        }))
      : [];
    const mon = (data.monitor ?? {}) as Partial<MonitorLevels>;
    return {
      mics,
      outputs: Array.isArray(data.outputs)
        ? data.outputs.filter((x): x is string => typeof x === "string")
        : [],
      outputLabels:
        data.outputLabels && typeof data.outputLabels === "object"
          ? (data.outputLabels as Record<string, string>)
          : {},
      pair: num(data.pair, 0, 0, 15),
      monitor: {
        micsEnabled:
          typeof mon.micsEnabled === "boolean"
            ? mon.micsEnabled
            : DEFAULT_MONITOR.micsEnabled,
        master: num(mon.master, DEFAULT_MONITOR.master, 0, 1.5),
        mics: num(mon.mics, DEFAULT_MONITOR.mics, 0, 1.5),
        fx: num(mon.fx, DEFAULT_MONITOR.fx, 0, 1.5),
      },
      processing: data.processing === true,
      singleMonitor: data.singleMonitor === true,
      selfMonitor: data.selfMonitor === true,
      pairs:
        data.pairs && typeof data.pairs === "object"
          ? Object.fromEntries(
              Object.entries(data.pairs as Record<string, unknown>).filter(
                (e): e is [string, string] => typeof e[1] === "string",
              ),
            )
          : {},
    };
  } catch {
    return null;
  }
}

export function saveSettings(settings: StudioAudioSettings) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Sense localStorage la configuració no es recorda: l'estudi funciona igual.
  }
}

/**
 * Reconcilia un deviceId desat amb els dispositius actuals: el mateix id si
 * encara hi és; si no, el que tingui el mateix nom; si no, "" (per defecte).
 */
export function matchDevice(
  savedId: string,
  savedLabel: string,
  devices: MediaDeviceInfo[],
): string {
  if (!savedId) return "";
  if (devices.some((d) => d.deviceId === savedId)) return savedId;
  const byLabel = savedLabel
    ? devices.find((d) => d.label === savedLabel)
    : undefined;
  return byLabel?.deviceId ?? "";
}
