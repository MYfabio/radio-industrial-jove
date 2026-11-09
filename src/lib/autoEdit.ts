/**
 * Edició automàtica: retalla el silenci del principi i del final, escurça les
 * pauses llargues del mig (per exemple si l'alumne dubta o para a pensar),
 * normalitza el volum i aplica fosos suaus. Retorna un WAV.
 *
 * Com es decideix què és silenci:
 * - Es mesura l'energia (RMS) en finestres de 20 ms, no el pic.
 * - El llindar s'adapta a cada gravació: una mica per sobre del soroll de fons
 *   i sempre ben per sota del nivell de la veu. Una veu fluixa no es confon
 *   amb silenci, i si la veu no es distingeix del fons no es retalla res.
 * - Un cop de soroll aïllat (un clic, una cadira) no compta com a veu.
 *
 * Com es talla:
 * - Només s'escurcen les pauses de més d'1,6 s, i s'hi deixen uns 0,7 s.
 * - Es conserva un marge abans de reprendre la veu (no es menja l'inici de la
 *   paraula) i els dos trossos s'uneixen amb un fos encreuat (sense clic).
 * - Amb música de fons no es talla cap pausa: el tall es notaria a la música.
 */
export interface AutoEditResult {
  blob: Blob;
  url: string;
  originalSeconds: number;
  editedSeconds: number;
  /** Quantes pauses llargues s'han escurçat. */
  pausesShortened: number;
}

export interface AutoEditOptions {
  /**
   * La gravació porta música de fons: no s'escurcen pauses i als extrems
   * només es retalla el silenci real (no una entrada de música fluixa).
   */
  music?: boolean;
}

export interface EditedSamples {
  samples: Float32Array;
  pausesShortened: number;
}

/** Finestra d'anàlisi. */
const WINDOW_S = 0.02;
/** Les pauses més curtes que això es deixen tal qual. */
const MIN_PAUSE_S = 1.6;
/** Silenci que es conserva després de l'última paraula abans del tall. */
const KEEP_AFTER_S = 0.45;
/** Marge que es conserva abans de reprendre la veu després del tall. */
const KEEP_BEFORE_S = 0.25;
/** Fos encreuat a cada unió. */
const CROSSFADE_S = 0.03;
/** Marges que es deixen al principi i al final de la gravació. */
const EDGE_BEFORE_S = 0.15;
const EDGE_AFTER_S = 0.3;
/** Fosos d'entrada i de sortida. */
const FADE_S = 0.06;
/** Amb música, llindar fix (RMS): només és silenci el silenci de debò. */
const MUSIC_THRESHOLD_DB = -46;
/** Una finestra és «veu» si n'hi ha prou d'actives al seu voltant (±100 ms). */
const NEIGHBOURS = 5;
const MIN_ACTIVE = 3;
const SILENT_DB = -100;

function encodeWav(channel: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + channel.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++)
      view.setUint8(offset + i, s.charCodeAt(i));
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

/** Nivell (dB RMS) de cada finestra de `win` mostres. */
function windowLevelsDb(mono: Float32Array, win: number): Float32Array {
  const count = Math.ceil(mono.length / win);
  const levels = new Float32Array(count);
  for (let w = 0; w < count; w++) {
    const from = w * win;
    const to = Math.min(from + win, mono.length);
    let sum = 0;
    for (let i = from; i < to; i++) {
      const s = mono[i] ?? 0;
      sum += s * s;
    }
    const rms = Math.sqrt(sum / Math.max(1, to - from));
    levels[w] = rms > 0 ? Math.max(SILENT_DB, 20 * Math.log10(rms)) : SILENT_DB;
  }
  return levels;
}

function percentile(sorted: Float32Array, p: number): number {
  if (sorted.length === 0) return SILENT_DB;
  const idx = Math.round(p * (sorted.length - 1));
  return sorted[idx] ?? SILENT_DB;
}

/**
 * Llindar de silenci de la gravació. El fons és el nivell de les finestres
 * més fluixes i la veu, el de les més fortes: el llindar queda 10 dB per
 * sobre del fons, però mai a menys de 15 dB de la veu (si el fons és sorollós
 * es talla menys, no més) ni a més de 40 dB (si el fons és silenci digital).
 */
function silenceThresholdDb(levels: Float32Array, music: boolean): number {
  if (music) return MUSIC_THRESHOLD_DB;
  const sorted = Float32Array.from(levels).sort();
  const floor = percentile(sorted, 0.05);
  const voice = percentile(sorted, 0.95);
  return Math.min(Math.max(floor + 10, voice - 40), voice - 15);
}

/**
 * Marca les finestres amb veu. No n'hi ha prou amb una finestra forta: n'hi
 * ha d'haver almenys MIN_ACTIVE al voltant, i així un clic aïllat no compta
 * i una veu fluixa que va i ve al voltant del llindar sí.
 */
function voicedWindows(levels: Float32Array, thresholdDb: number): Uint8Array {
  const count = levels.length;
  const prefix = new Uint32Array(count + 1);
  for (let w = 0; w < count; w++) {
    prefix[w + 1] =
      (prefix[w] ?? 0) + ((levels[w] ?? SILENT_DB) > thresholdDb ? 1 : 0);
  }
  const voiced = new Uint8Array(count);
  for (let w = 0; w < count; w++) {
    const from = Math.max(0, w - NEIGHBOURS);
    const to = Math.min(count, w + NEIGHBOURS + 1);
    if ((prefix[to] ?? 0) - (prefix[from] ?? 0) >= MIN_ACTIVE) voiced[w] = 1;
  }
  return voiced;
}

/** Uneix els trams amb un fos encreuat d'igual potència de `xf` mostres. */
function joinWithCrossfade(
  mono: Float32Array,
  segments: [number, number][],
  xf: number,
): Float32Array {
  const total =
    segments.reduce((sum, [from, to]) => sum + (to - from), 0) -
    xf * (segments.length - 1);
  const out = new Float32Array(total);
  let pos = 0;
  segments.forEach(([from, to], k) => {
    const seg = mono.subarray(from, to);
    if (k === 0) {
      out.set(seg, 0);
      pos = seg.length;
      return;
    }
    const joint = pos - xf;
    for (let j = 0; j < xf; j++) {
      const angle = ((j + 0.5) / xf) * (Math.PI / 2);
      out[joint + j] =
        (out[joint + j] ?? 0) * Math.cos(angle) +
        (seg[j] ?? 0) * Math.sin(angle);
    }
    out.set(seg.subarray(xf), pos);
    pos += seg.length - xf;
  });
  return out;
}

/**
 * El muntatge sobre les mostres (sense descodificar ni normalitzar): retalla
 * els extrems i escurça les pauses llargues. Si no s'hi troba veu, no toca res.
 */
export function editSamples(
  mono: Float32Array,
  sampleRate: number,
  opts: AutoEditOptions = {},
): EditedSamples {
  const music = opts.music === true;
  const win = Math.max(1, Math.floor(sampleRate * WINDOW_S));
  const samplesIn = (s: number) => Math.floor(sampleRate * s);

  const levels = windowLevelsDb(mono, win);
  const voiced = voicedWindows(levels, silenceThresholdDb(levels, music));

  let first = 0;
  while (first < voiced.length && !voiced[first]) first++;
  if (first === voiced.length)
    return { samples: mono.slice(), pausesShortened: 0 };
  let last = voiced.length - 1;
  while (last > first && !voiced[last]) last--;

  const start = Math.max(0, first * win - samplesIn(EDGE_BEFORE_S));
  const end = Math.min(mono.length, (last + 1) * win + samplesIn(EDGE_AFTER_S));

  // Trams que es conserven: de cada pausa llarga en queda el final de la
  // paraula anterior (KEEP_AFTER) i el marge previ a la següent (KEEP_BEFORE).
  const segments: [number, number][] = [];
  let segStart = start;
  if (!music) {
    const minPause = Math.ceil(MIN_PAUSE_S / WINDOW_S);
    let w = first;
    while (w <= last) {
      if (voiced[w]) {
        w++;
        continue;
      }
      let silenceEnd = w;
      while (silenceEnd <= last && !voiced[silenceEnd]) silenceEnd++;
      if (silenceEnd - w >= minPause) {
        segments.push([segStart, w * win + samplesIn(KEEP_AFTER_S)]);
        segStart = silenceEnd * win - samplesIn(KEEP_BEFORE_S);
      }
      w = silenceEnd;
    }
  }
  segments.push([segStart, end]);

  return {
    samples: joinWithCrossfade(mono, segments, samplesIn(CROSSFADE_S)),
    pausesShortened: segments.length - 1,
  };
}

export async function autoEdit(
  blob: Blob,
  opts: AutoEditOptions = {},
): Promise<AutoEditResult> {
  const ctx = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  } finally {
    await ctx.close();
  }

  // Mescla a mono
  const length = decoded.length;
  const mono = new Float32Array(length);
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const data = decoded.getChannelData(c);
    for (let i = 0; i < length; i++)
      mono[i] = (mono[i] ?? 0) + (data[i] ?? 0) / decoded.numberOfChannels;
  }

  const { samples: trimmed, pausesShortened } = editSamples(
    mono,
    decoded.sampleRate,
    opts,
  );

  // Normalitzat a -1 dBFS
  let peak = 0;
  for (let i = 0; i < trimmed.length; i++)
    peak = Math.max(peak, Math.abs(trimmed[i] ?? 0));
  const gain = peak > 0.0001 ? 0.89 / peak : 1;

  // Fosos de 60 ms
  const fade = Math.min(
    Math.floor(decoded.sampleRate * FADE_S),
    Math.floor(trimmed.length / 2),
  );
  for (let i = 0; i < trimmed.length; i++) {
    let g = gain;
    if (i < fade) g *= i / fade;
    if (i > trimmed.length - fade) g *= (trimmed.length - i) / fade;
    trimmed[i] = (trimmed[i] ?? 0) * g;
  }

  const wav = encodeWav(trimmed, decoded.sampleRate);

  return {
    blob: wav,
    url: URL.createObjectURL(wav),
    originalSeconds: decoded.duration,
    editedSeconds: trimmed.length / decoded.sampleRate,
    pausesShortened,
  };
}
