/**
 * Galeria de sons compartida: en lloc de desar-se al navegador de cada
 * alumne (IndexedDB), es desa a Railway Postgres perquè tota la classe
 * pugui fer servir els sons que hi puja qualsevol company.
 */
import type { Sql } from "./podcasts.server";

export interface SoundRow {
  id: number;
  name: string;
  emoji: string;
  mime: string;
  owner_user_id: string | null;
  created_at: string;
}

const MAX_SOUND_BYTES = 8 * 1024 * 1024;

export async function ensureSoundsSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS sounds (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      mime TEXT NOT NULL,
      data BYTEA NOT NULL,
      owner_user_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

function decode(base64: string): Buffer {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return Buffer.from(bytes);
}

export async function listSounds(sql: Sql): Promise<SoundRow[]> {
  await ensureSoundsSchema(sql);
  const rows = await sql`
    SELECT id, name, emoji, mime, owner_user_id, created_at
      FROM sounds
     ORDER BY created_at DESC
     LIMIT 200
  `;
  return rows as unknown as SoundRow[];
}

export async function createSound(
  sql: Sql,
  data: { name: string; emoji: string; mime: string; dataBase64: string; ownerId: string },
): Promise<SoundRow> {
  await ensureSoundsSchema(sql);
  const bytes = decode(data.dataBase64);
  if (bytes.length > MAX_SOUND_BYTES) {
    throw new Error("El so és massa gran (màxim 8 MB).");
  }
  const [row] = await sql`
    INSERT INTO sounds (name, emoji, mime, data, owner_user_id)
    VALUES (${data.name}::text, ${data.emoji}::text, ${data.mime}::text, ${bytes}, ${data.ownerId}::text)
    RETURNING id, name, emoji, mime, owner_user_id, created_at
  `;
  return row as unknown as SoundRow;
}

export async function getSoundData(sql: Sql, id: number) {
  const [row] = await sql`SELECT data, mime FROM sounds WHERE id = ${id}::int`;
  if (!row) return null;
  return { data: row["data"] as Uint8Array, mime: row["mime"] as string };
}

export async function deleteSound(sql: Sql, id: number, requesterId: string, isCoordinador: boolean) {
  const [row] = await sql`SELECT owner_user_id FROM sounds WHERE id = ${id}::int`;
  if (!row) return { ok: true };
  if (row["owner_user_id"] !== requesterId && !isCoordinador) {
    throw new Error("Només qui l'ha pujat (o el coordinador) pot esborrar aquest so.");
  }
  await sql`DELETE FROM sounds WHERE id = ${id}::int`;
  return { ok: true };
}
