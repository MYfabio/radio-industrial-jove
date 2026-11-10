/**
 * Uneix els trams d'una gravació feta en diverses sessions (parar i continuar
 * més tard) en un sol WAV mono, un darrere l'altre.
 */
import { encodeWav } from "@/lib/autoEdit";

export async function joinSegments(segments: Blob[]): Promise<Blob> {
  const ctx = new AudioContext();
  try {
    const parts: Float32Array[] = [];
    for (const segment of segments) {
      const decoded = await ctx.decodeAudioData(await segment.arrayBuffer());
      const mono = new Float32Array(decoded.length);
      for (let c = 0; c < decoded.numberOfChannels; c++) {
        const data = decoded.getChannelData(c);
        for (let i = 0; i < decoded.length; i++)
          mono[i] = (mono[i] ?? 0) + (data[i] ?? 0) / decoded.numberOfChannels;
      }
      parts.push(mono);
    }
    const joined = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
    let offset = 0;
    for (const part of parts) {
      joined.set(part, offset);
      offset += part.length;
    }
    return encodeWav(joined, ctx.sampleRate);
  } finally {
    await ctx.close();
  }
}
