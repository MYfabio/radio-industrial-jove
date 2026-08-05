/**
 * Sonidos subidos por los alumnos: se guardan en el navegador (IndexedDB)
 * para que sigan ahí la próxima vez que abran la radio.
 */
import { applyEnvelope, type PlayOptions } from "@/lib/soundEffects";

export interface CustomSound {

  id: string;
  name: string;
  emoji: string;
  blob: Blob;
}

const DB_NAME = "radio-escolar";
const STORE = "sounds";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listCustomSounds(): Promise<CustomSound[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as CustomSound[]);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomSound(sound: CustomSound): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(sound);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCustomSound(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

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

