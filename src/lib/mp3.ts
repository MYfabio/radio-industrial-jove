/**
 * Exportació a MP3 amb metadades (etiquetes ID3v2) fetes al navegador.
 */
import { Mp3Encoder } from "@breezystack/lamejs";

export interface Mp3Meta {
  title: string;
  artist: string;
  album: string;
  comment?: string;
}

function frame(id: string, text: string) {
  const body = new TextEncoder().encode(`\u0003${text}`);
  const size = body.length;
  const out = new Uint8Array(10 + size);
  out.set(new TextEncoder().encode(id), 0);
  out[4] = (size >>> 21) & 0x7f;
  out[5] = (size >>> 14) & 0x7f;
  out[6] = (size >>> 7) & 0x7f;
  out[7] = size & 0x7f;
  out.set(body, 10);
  return out;
}

function id3(meta: Mp3Meta) {
  const frames = [
    frame("TIT2", meta.title),
    frame("TPE1", meta.artist),
    frame("TALB", meta.album),
    ...(meta.comment ? [frame("COMM", meta.comment)] : []),
  ];
  const size = frames.reduce((a, f) => a + f.length, 0);
  const header = new Uint8Array(10);
  header.set(new TextEncoder().encode("ID3"), 0);
  header[3] = 3;
  header[6] = (size >>> 21) & 0x7f;
  header[7] = (size >>> 14) & 0x7f;
  header[8] = (size >>> 7) & 0x7f;
  header[9] = size & 0x7f;

  const out = new Uint8Array(10 + size);
  out.set(header, 0);
  let offset = 10;
  for (const f of frames) {
    out.set(f, offset);
    offset += f.length;
  }
  return out;
}

function toInt16(input: Float32Array) {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const s = Math.max(-1, Math.min(1, input[i] ?? 0));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** Converteix una gravació (webm/wav) a MP3 128 kbps amb metadades. */
export async function encodeMp3(blob: Blob, meta: Mp3Meta): Promise<Blob> {
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(await blob.arrayBuffer());
  await ctx.close();

  const channels = Math.min(2, buffer.numberOfChannels);
  const encoder = new Mp3Encoder(channels, buffer.sampleRate, 128);
  const left = toInt16(buffer.getChannelData(0));
  const right = channels > 1 ? toInt16(buffer.getChannelData(1)) : null;

  const parts: Uint8Array[] = [id3(meta)];
  const block = 1152;
  for (let i = 0; i < left.length; i += block) {
    const l = left.subarray(i, i + block);
    const chunk = right
      ? encoder.encodeBuffer(l, right.subarray(i, i + block))
      : encoder.encodeBuffer(l);
    if (chunk.length > 0) parts.push(new Uint8Array(chunk));
  }
  const end = encoder.flush();
  if (end.length > 0) parts.push(new Uint8Array(end));

  return new Blob(parts as BlobPart[], { type: "audio/mpeg" });
}

/** Nom de fitxer net a partir del títol. */
export function safeFileName(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "podcast"}.mp3`;
}
