/**
 * Música de fons lliure de drets: es genera al navegador amb el Web Audio API,
 * així que no hi ha cap fitxer amb copyright ni cap descàrrega externa.
 * Es reprodueix en bucle a volum baix i entra dins la gravació.
 */

export interface BgTrack {
  id: string;
  label: string;
  emoji: string;
  descripcion: string;
}

export const BG_TRACKS: BgTrack[] = [
  {
    id: "calma",
    label: "Calma",
    emoji: "🌙",
    descripcion: "Acords suaus per llegir o explicar contes.",
  },
  {
    id: "noticies",
    label: "Notícies",
    emoji: "📻",
    descripcion: "Pols rítmic discret per informatius i entrevistes.",
  },
];

export interface BgHandle {
  stop: () => void;
  setVolume: (v: number) => void;
}

/** Reprodueix en bucle un arxiu real pujat per la classe (música de fons pròpia). */
export function startBackgroundFromBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  destinations: AudioNode[],
  volume = 0.12,
): BgHandle {
  const master = ctx.createGain();
  master.gain.value = volume;
  destinations.forEach((d) => master.connect(d));

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(master);
  src.start();

  return {
    stop: () => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      window.setTimeout(() => {
        src.stop();
        master.disconnect();
      }, 900);
    },
    setVolume: (v: number) => {
      master.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
    },
  };
}

const CALMA = [220, 277.18, 329.63, 261.63];
const NOTICIES = [146.83, 146.83, 196, 174.61];

/** Arrenca un bucle musical cap a les destinacions indicades (monitor + gravació). */
export function startBackground(
  ctx: AudioContext,
  trackId: string,
  destinations: AudioNode[],
  volume = 0.12,
): BgHandle {
  const master = ctx.createGain();
  master.gain.value = volume;
  destinations.forEach((d) => master.connect(d));

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = trackId === "calma" ? 1200 : 2200;
  filter.connect(master);

  const notes = trackId === "calma" ? CALMA : NOTICIES;
  const beat = trackId === "calma" ? 2.4 : 0.6;
  const stopped = { value: false };
  let timer = 0;
  let step = 0;

  const playStep = () => {
    if (stopped.value) return;
    const now = ctx.currentTime;
    const freq = notes[step % notes.length] ?? 220;
    const voices = trackId === "calma" ? [1, 1.5, 2] : [1, 2];

    voices.forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = trackId === "calma" ? "sine" : "triangle";
      osc.frequency.value = freq * mult;
      const gain = ctx.createGain();
      const peak = trackId === "calma" ? 0.25 / (i + 1) : 0.2 / (i + 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + beat * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + beat * 0.95);
      osc.connect(gain).connect(filter);
      osc.start(now);
      osc.stop(now + beat);
    });

    step += 1;
    timer = window.setTimeout(playStep, beat * 1000);
  };

  playStep();

  return {
    stop: () => {
      stopped.value = true;
      window.clearTimeout(timer);
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      window.setTimeout(() => master.disconnect(), 900);
    },
    setVolume: (v: number) => {
      master.gain.setTargetAtTime(v, ctx.currentTime, 0.1);
    },
  };
}
