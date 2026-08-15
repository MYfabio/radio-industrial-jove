/**
 * Utilitats per reproduir sons pujats (la llista en si viu ara a la galeria
 * compartida a Railway Postgres — vegeu sounds.functions.ts).
 */
import { applyEnvelope, type PlayOptions } from "@/lib/soundEffects";

const EMOJIS = ["🎵", "🎶", "🔊", "🎧", "📢", "🎤", "⭐", "🎺", "🐱", "🚀"];
export function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)]!;
}

/** Reproduce un sonido subido en el contexto y lo envía a los destinos (altavoz + grabación). */
export function playBuffer(
  ctx: AudioContext,
  buffer: AudioBuffer,
  destinations: AudioNode[],
  opts: PlayOptions = {},
) {
  const gain = ctx.createGain();
  destinations.forEach((d) => gain.connect(d));
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(gain);
  const start = ctx.currentTime;
  applyEnvelope(gain, ctx, start, buffer.duration, opts);
  src.start(start);
  return src;
}
