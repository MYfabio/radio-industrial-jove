/**
 * Projectes a mig fer: l'alumne para una gravació, la desa i la continua un
 * altre dia (des de qualsevol ordinador). Cada tram gravat es desa tal qual
 * (sense recodificar) i el navegador els uneix. Només els veu qui els ha desat.
 */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlInt, sqlBool, sqlBytea } from "./sqlLiteral";

export interface DraftRow {
  id: number;
  title: string;
  template: string | null;
  seconds: number;
  music: boolean;
  segments: number;
  updated_at: string;
}

export interface DraftMeta {
  title: string;
  template: string | null;
  seconds: number;
  music: boolean;
}

const MAX_SEGMENT_BYTES = 15 * 1024 * 1024;
const MAX_SEGMENTS = 20;
const MAX_DRAFTS = 10;

export async function ensureDraftsSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS drafts (
      id SERIAL PRIMARY KEY,
      owner_user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      template TEXT,
      seconds INTEGER NOT NULL DEFAULT 0,
      music BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS draft_segments (
      draft_id INTEGER NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      mime TEXT NOT NULL,
      data BYTEA NOT NULL,
      PRIMARY KEY (draft_id, position)
    );
  `);
}

async function assertOwner(sql: Sql, id: number, ownerId: string) {
  const [row] = await sql.unsafe(
    `SELECT id FROM drafts WHERE id = ${sqlInt(id)} AND owner_user_id = ${sqlText(ownerId)}`,
  );
  if (!row) throw new Error("Projecte no trobat.");
}

export async function listDrafts(sql: Sql, ownerId: string): Promise<DraftRow[]> {
  await ensureDraftsSchema(sql);
  const rows = await sql.unsafe(`
    SELECT d.id, d.title, d.template, d.seconds, d.music, d.updated_at,
           (SELECT COUNT(*)::int FROM draft_segments s WHERE s.draft_id = d.id) AS segments
      FROM drafts d
     WHERE d.owner_user_id = ${sqlText(ownerId)}
     ORDER BY d.updated_at DESC
  `);
  return rows as unknown as DraftRow[];
}

/** Crea el projecte (id nul) o n'actualitza la fitxa. Retorna l'id. */
export async function saveDraft(
  sql: Sql,
  ownerId: string,
  id: number | null,
  meta: DraftMeta,
): Promise<number> {
  await ensureDraftsSchema(sql);
  const title = meta.title.slice(0, 80) || "Projecte";
  const seconds = Math.max(0, Math.round(meta.seconds));
  if (id !== null) {
    await assertOwner(sql, id, ownerId);
    await sql.unsafe(`
      UPDATE drafts
         SET title = ${sqlText(title)}, template = ${sqlText(meta.template)},
             seconds = ${sqlInt(seconds)}, music = ${sqlBool(meta.music)},
             updated_at = CURRENT_TIMESTAMP
       WHERE id = ${sqlInt(id)}
    `);
    return id;
  }
  const [count] = await sql.unsafe(
    `SELECT COUNT(*)::int AS n FROM drafts WHERE owner_user_id = ${sqlText(ownerId)}`,
  );
  if ((count?.["n"] as number) >= MAX_DRAFTS) {
    throw new Error("Tens massa projectes desats: esborra'n algun.");
  }
  const [row] = await sql.unsafe(`
    INSERT INTO drafts (owner_user_id, title, template, seconds, music)
    VALUES (${sqlText(ownerId)}, ${sqlText(title)}, ${sqlText(meta.template)}, ${sqlInt(seconds)}, ${sqlBool(meta.music)})
    RETURNING id
  `);
  return row!["id"] as number;
}

export async function addDraftSegment(
  sql: Sql,
  ownerId: string,
  data: { draftId: number; position: number; mime: string; dataBase64: string },
) {
  await assertOwner(sql, data.draftId, ownerId);
  if (data.position < 0 || data.position >= MAX_SEGMENTS) {
    throw new Error("Aquest projecte ja té massa trams.");
  }
  const bytes = Buffer.from(data.dataBase64, "base64");
  if (bytes.length > MAX_SEGMENT_BYTES) {
    throw new Error("El tram és massa llarg per desar-lo.");
  }
  await sql.unsafe(`
    INSERT INTO draft_segments (draft_id, position, mime, data)
    VALUES (${sqlInt(data.draftId)}, ${sqlInt(data.position)}, ${sqlText(data.mime)}, ${sqlBytea(bytes)})
    ON CONFLICT (draft_id, position) DO NOTHING
  `);
  return { ok: true };
}

export async function getDraftSegment(
  sql: Sql,
  ownerId: string,
  draftId: number,
  position: number,
) {
  await assertOwner(sql, draftId, ownerId);
  const [row] = await sql.unsafe(
    `SELECT data, mime FROM draft_segments WHERE draft_id = ${sqlInt(draftId)} AND position = ${sqlInt(position)}`,
  );
  if (!row) throw new Error("Tram no trobat.");
  return {
    mime: row["mime"] as string,
    dataBase64: Buffer.from(row["data"] as Uint8Array).toString("base64"),
  };
}

export async function deleteDraft(sql: Sql, ownerId: string, id: number) {
  await ensureDraftsSchema(sql);
  await sql.unsafe(
    `DELETE FROM drafts WHERE id = ${sqlInt(id)} AND owner_user_id = ${sqlText(ownerId)}`,
  );
  return { ok: true };
}
