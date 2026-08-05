/**
 * Efectos de sonido: aplaudiments, campana, tatxan i transició fan servir
 * arxius reals servits des de /sounds (autohospedats, sense dependre de cap
 * servei extern). La resta es sintetitzen amb Web Audio API.
 */
export type EffectId =
  | "aplausos"
  | "campana"
  | "tambor"
  | "risa"
  | "whoosh"
  | "tada"
  | "pedo";

export interface EffectDef {
  id: EffectId;
  label: string;
  emoji: string;
}

export const EFFECTS: EffectDef[] = [
  { id: "aplausos", label: "Aplaudiments", emoji: "👏" },
  { id: "risa", label: "Rialles", emoji: "😂" },
  { id: "campana", label: "Campana", emoji: "🔔" },
  { id: "tada", label: "Tatxan!", emoji: "🎉" },
  { id: "pedo", label: "Bufa", emoji: "💨" },
  { id: "tambor", label: "Timbal", emoji: "🥁" },
  { id: "whoosh", label: "Transició", emoji: "🌪️" },
];

/** Efectes amb arxiu d'àudio real, autohospedat a /public. */
const FILE_EFFECTS: Partial<Record<EffectId, string>> = {
  campana: "/freesound_community-bell-98033.mp3",
  tada: "/freesound_community-tadaa-47995.mp3",
  whoosh: "/freesound_community-paisaje-sonoro-uem-pisasdas-43442.mp3",
  risa: "/artificiallyinspired-90s-sitcom-laugh-track-v2-353986.mp3",
  pedo: "/apebble-fart-5-228245.mp3",
};

const bufferCache = new Map<string, Promise<AudioBuffer>>();

function loadBuffer(ctx: AudioContext, url: string) {
  let promise = bufferCache.get(url);
  if (!promise) {
    promise = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data));
    bufferCache.set(url, promise);
  }
  return promise;
}

function noiseBuffer(ctx: BaseAudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export interface PlayOptions {
  /** Volum de 0 a 1. */
  volume?: number;
  /** Segons d'entrada suau (fade in). */
  fadeIn?: number;
  /** Segons de sortida suau (fade out). */
  fadeOut?: number;
}

/** Aplica volum + entrada/sortida suau sobre un node de guany. */
export function applyEnvelope(
  gain: GainNode,
  ctx: AudioContext,
  start: number,
  duration: number,
  { volume = 0.9, fadeIn = 0, fadeOut = 0 }: PlayOptions = {},
) {
  const vol = Math.max(0.0001, Math.min(1, volume));
  const inT = Math.max(0, Math.min(fadeIn, duration / 2));
  const outT = Math.max(0, Math.min(fadeOut, duration / 2));
  const g = gain.gain;
  g.cancelScheduledValues(start);
  if (inT > 0) {
    g.setValueAtTime(0.0001, start);
    g.linearRampToValueAtTime(vol, start + inT);
  } else {
    g.setValueAtTime(vol, start);
  }
  if (outT > 0 && Number.isFinite(duration)) {
    g.setValueAtTime(vol, start + duration - outT);
    g.linearRampToValueAtTime(0.0001, start + duration);
  }
}

/** Reproduce el efecto en `ctx` i l'envia a totes les destinacions indicades. */
export function playEffect(
  ctx: AudioContext,
  id: EffectId,
  destinations: AudioNode[],
  opts: PlayOptions = {},
) {
  const out = ctx.createGain();
  out.gain.value = Math.max(0.0001, Math.min(1, opts.volume ?? 0.9));
  destinations.forEach((d) => out.connect(d));
  const now = ctx.currentTime;

  const fileUrl = FILE_EFFECTS[id];
  if (fileUrl) {
    void loadBuffer(ctx, fileUrl)
      .then((buffer) => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(out);
        const start = ctx.currentTime;
        applyEnvelope(out, ctx, start, buffer.duration, opts);
        src.start(start);
      })
      .catch(() => playSynth(ctx, id, out, opts));
    return;
  }

  playSynth(ctx, id, out, opts);
}

/** Versions sintetitzades (reserva si l'arxiu no carrega, o efectes sense arxiu). */
function playSynth(ctx: AudioContext, id: EffectId, out: GainNode, opts: PlayOptions) {
  const now = ctx.currentTime;

  if (id === "aplausos") {
    applyEnvelope(out, ctx, now, 1.4, opts);
    for (let i = 0; i < 26; i++) {
      const t = now + Math.random() * 1.2;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, 0.05);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1800 + Math.random() * 2200;
      filter.Q.value = 1.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.35 + Math.random() * 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      src.connect(filter).connect(gain).connect(out);
      src.start(t);
      src.stop(t + 0.08);
    }
    return;
  }

  if (id === "risa") {
    applyEnvelope(out, ctx, now, 1.1, opts);
    for (let hit = 0; hit < 5; hit++) {
      const t = now + hit * 0.16;
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280 + hit * 12, t);
      osc.frequency.exponentialRampToValueAtTime(420 + hit * 12, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.14);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.16);
    }
    return;
  }

  if (id === "campana") {
    applyEnvelope(out, ctx, now, 1.8, opts);
    [1, 2.4, 3.8].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 880 * mult;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(i === 0 ? 0.6 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);
      osc.connect(gain).connect(out);
      osc.start(now);
      osc.stop(now + 1.8);
    });
    return;
  }

  if (id === "tada") {
    applyEnvelope(out, ctx, now, 1.2, opts);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = now + i * 0.1;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    return;
  }

  if (id === "pedo") {
    applyEnvelope(out, ctx, now, 0.5, opts);
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.45);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    osc.connect(filter).connect(gain).connect(out);
    osc.start(now);
    osc.stop(now + 0.5);
    return;
  }

  if (id === "tambor") {
    applyEnvelope(out, ctx, now, 0.62, opts);
    for (let hit = 0; hit < 3; hit++) {
      const t = now + hit * 0.16;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(gain).connect(out);
      osc.start(t);
      osc.stop(t + 0.3);
    }
    return;
  }

  // whoosh
  applyEnvelope(out, ctx, now, 1, opts);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 1);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.exponentialRampToValueAtTime(4000, now + 0.45);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.9);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.5, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
  src.connect(filter).connect(gain).connect(out);
  src.start(now);
  src.stop(now + 1);
}
