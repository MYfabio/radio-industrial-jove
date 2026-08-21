/**
 * Galeria de sons compartida: en lloc de desar-se al navegador de cada
 * alumne (IndexedDB), es desa a Railway Postgres perquè tota la classe
 * pugui fer servir els sons que hi puja qualsevol company.
 */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlInt, sqlBytea } from "./sqlLiteral";

export type SoundKind = "efecte" | "musica";

export interface SoundRow {
  id: number;
  name: string;
  emoji: string;
  mime: string;
  kind: SoundKind;
  owner_user_id: string | null;
  created_at: string;
}

const MAX_SOUND_BYTES = 8 * 1024 * 1024;

export async function ensureSoundsSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS sounds (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      mime TEXT NOT NULL,
      data BYTEA NOT NULL,
      owner_user_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await sql.unsafe(`ALTER TABLE sounds ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'efecte'`);
}

function decode(base64: string): Buffer {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return Buffer.from(bytes);
}

export async function listSounds(sql: Sql): Promise<SoundRow[]> {
  await ensureSoundsSchema(sql);
  const rows = await sql.unsafe(`
    SELECT id, name, emoji, mime, kind, owner_user_id, created_at
      FROM sounds
     ORDER BY created_at DESC
     LIMIT 200
  `);
  return rows as unknown as SoundRow[];
}

export async function createSound(
  sql: Sql,
  data: { name: string; emoji: string; mime: string; kind: SoundKind; dataBase64: string; ownerId: string },
): Promise<SoundRow> {
  await ensureSoundsSchema(sql);
  const bytes = decode(data.dataBase64);
  if (bytes.length > MAX_SOUND_BYTES) {
    throw new Error("El so és massa gran (màxim 8 MB).");
  }
  const [row] = await sql.unsafe(`
    INSERT INTO sounds (name, emoji, mime, kind, data, owner_user_id)
    VALUES (${sqlText(data.name)}, ${sqlText(data.emoji)}, ${sqlText(data.mime)}, ${sqlText(data.kind)}, ${sqlBytea(bytes)}, ${sqlText(data.ownerId)})
    RETURNING id, name, emoji, mime, kind, owner_user_id, created_at
  `);
  return row as unknown as SoundRow;
}

export async function getSoundData(sql: Sql, id: number) {
  const [row] = await sql.unsafe(`SELECT data, mime FROM sounds WHERE id = ${sqlInt(id)}`);
  if (!row) return null;
  return { data: row["data"] as Uint8Array, mime: row["mime"] as string };
}

export async function deleteSound(sql: Sql, id: number, requesterId: string, isCoordinador: boolean) {
  const [row] = await sql.unsafe(`SELECT owner_user_id FROM sounds WHERE id = ${sqlInt(id)}`);
  if (!row) return { ok: true };
  if (row["owner_user_id"] !== requesterId && !isCoordinador) {
    throw new Error("Només qui l'ha pujat (o el coordinador) pot esborrar aquest so.");
  }
  await sql.unsafe(`DELETE FROM sounds WHERE id = ${sqlInt(id)}`);
  return { ok: true };
}
