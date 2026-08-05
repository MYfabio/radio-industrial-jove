/**
 * Edición automática: recorta silencios al principio y al final,
 * normaliza el volumen y aplica fundidos suaves. Devuelve un WAV.
 */
export interface AutoEditResult {
  blob: Blob;
  url: string;
  originalSeconds: number;
  editedSeconds: number;
}

function encodeWav(channel: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + channel.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + channel.length * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, channel.length * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < channel.length; i++) {
    const s = Math.max(-1, Math.min(1, channel[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export async function autoEdit(blob: Blob): Promise<AutoEditResult> {
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());

  // Mezcla a mono
  const length = decoded.length;
  const mono = new Float32Array(length);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const data = decoded.getChannelData(c);
    for (let i = 0; i < length; i++) mono[i] = (mono[i] ?? 0) + (data[i] ?? 0) / decoded.numberOfChannels;
  }

  // Detección de silencio por ventanas
  const win = Math.floor(decoded.sampleRate * 0.02);
  const threshold = 0.015;
  const loud = (start: number) => {
    let peak = 0;
    for (let i = start; i < Math.min(start + win, length); i++) peak = Math.max(peak, Math.abs(mono[i] ?? 0));
    return peak > threshold;
  };

  let startIdx = 0;
  while (startIdx < length && !loud(startIdx)) startIdx += win;
  let endIdx = length - win;
  while (endIdx > startIdx && !loud(endIdx)) endIdx -= win;

  const pad = Math.floor(decoded.sampleRate * 0.1);
  startIdx = Math.max(0, startIdx - pad);
  endIdx = Math.min(length, endIdx + win + pad);
  if (endIdx <= startIdx) {
    startIdx = 0;
    endIdx = length;
  }

  const trimmed = mono.slice(startIdx, endIdx);

  // Normalizado a -1 dBFS
  let peak = 0;
  for (let i = 0; i < trimmed.length; i++) peak = Math.max(peak, Math.abs(trimmed[i] ?? 0));
  const gain = peak > 0.0001 ? 0.89 / peak : 1;

  // Fundidos de 60 ms
  const fade = Math.min(Math.floor(decoded.sampleRate * 0.06), Math.floor(trimmed.length / 2));
  for (let i = 0; i < trimmed.length; i++) {
    let g = gain;
    if (i < fade) g *= i / fade;
    if (i > trimmed.length - fade) g *= (trimmed.length - i) / fade;
    trimmed[i] = (trimmed[i] ?? 0) * g;
  }

  const wav = encodeWav(trimmed, decoded.sampleRate);
  await ctx.close();

  return {
    blob: wav,
    url: URL.createObjectURL(wav),
    originalSeconds: decoded.duration,
    editedSeconds: trimmed.length / decoded.sampleRate,
  };
}
