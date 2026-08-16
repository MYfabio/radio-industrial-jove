/**
 * Accés a la base de dades de pòdcasts allotjada a Railway Postgres.
 * Tot (fitxa + àudio + caràtula) es desa aquí: no depèn de cap emmagatzematge extern.
 */
import postgres from "postgres";
import { ensureClassesSchema } from "./classes.server";

export type Sql = ReturnType<typeof postgres>;

export function getSql(): Sql {
  const url = process.env["RAILWAY_DATABASE_URL"];
  if (!url) throw new Error("Falta la variable RAILWAY_DATABASE_URL.");
  return postgres(url, {
    ssl: { rejectUnauthorized: false },
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    // La connexió de Railway passa per un pooler que no admet "prepared
    // statements": sense això, Postgres no pot determinar el tipus dels
    // paràmetres i falla amb "could not determine data type of parameter".
    prepare: false,
  });
}

export async function ensureSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS podcasts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      "desc" TEXT,
      cat TEXT,
      author TEXT,
      tags TEXT[],
      audio_url TEXT,
      transcript TEXT,
      dur INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pendent',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS audio_data BYTEA`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS audio_mime TEXT`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS cover TEXT`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS cover_data BYTEA`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS cover_mime TEXT`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS template TEXT`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS teacher_note TEXT`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS class_id INTEGER`;
  await sql`ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS owner_user_id TEXT`;
  await sql`ALTER TABLE podcasts ALTER COLUMN audio_url DROP NOT NULL`;
}

export interface PodcastRow {
  id: number;
  title: string;
  desc: string | null;
  cat: string | null;
  author: string | null;
  tags: string[] | null;
  audio_url: string | null;
  transcript: string | null;
  dur: number;
  status: string;
  cover: string | null;
  template: string | null;
  teacher_note: string | null;
  publish_at: string | null;
  created_at: string;
  has_cover_image?: boolean;
  class_id: number | null;
  class_name: string | null;
}

const LIST_COLUMNS = `p.id, p.title, p."desc", p.cat, p.author, p.tags, p.audio_url, p.transcript,
  p.dur, p.status, p.cover, p.template, p.teacher_note, p.publish_at, p.created_at,
  (p.cover_data IS NOT NULL) AS has_cover_image, p.class_id, c.name AS class_name`;
const LIST_FROM = `podcasts p LEFT JOIN classes c ON c.id = p.class_id`;

export interface NewPodcast {
  title: string;
  desc: string | null;
  cat: string | null;
  author: string | null;
  tags: string[];
  transcript: string | null;
  dur: number;
  template: string | null;
  cover: string | null;
  audioBase64: string;
  audioMime: string;
  coverBase64: string | null;
  coverMime: string | null;
  publishAt: string | null;
  classId: number | null;
  ownerId: string | null;
  origin: string;
}

function decode(base64: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return Buffer.from(bytes);
}

export async function createPodcast(sql: Sql, data: NewPodcast) {
  await ensureSchema(sql);
  const audio = decode(data.audioBase64);
  const cover = data.coverBase64 ? decode(data.coverBase64) : null;

  const [row] = await sql`
    INSERT INTO podcasts (
      title, "desc", cat, author, tags, transcript, dur, status,
      template, cover, audio_data, audio_mime, cover_data, cover_mime, publish_at, class_id, owner_user_id
    ) VALUES (
      ${data.title}::text, ${data.desc}::text, ${data.cat}::text, ${data.author}::text, ${data.tags}::text[],
      ${data.transcript}::text, ${Math.round(data.dur || 0)}, 'pendent',
      ${data.template}::text, ${data.cover}::text, ${audio}::bytea, ${data.audioMime}::text,
      ${cover}::bytea, ${data.coverMime}::text, ${data.publishAt}::timestamptz, ${data.classId}::int, ${data.ownerId}::text
    )
    RETURNING id
  `;

  const id = row!["id"] as number;
  const audioUrl = `${data.origin.replace(/\/$/, "")}/api/public/audio/${id}`;
  await sql`UPDATE podcasts SET audio_url = ${audioUrl}::text WHERE id = ${id}::int`;
  return { id, audio_url: audioUrl };
}

/** Mur públic: només aprovats i amb la data de publicació ja arribada. */
export async function listApproved(sql: Sql) {
  await ensureSchema(sql);
  await ensureClassesSchema(sql);
  const rows = await sql.unsafe(`
    SELECT ${LIST_COLUMNS} FROM ${LIST_FROM}
    WHERE p.status = 'aprovat'
      AND (p.publish_at IS NULL OR p.publish_at <= now())
    ORDER BY COALESCE(p.publish_at, p.created_at) DESC
    LIMIT 200
  `);
  return rows as unknown as PodcastRow[];
}

/** Panell del mestre: tot, del més nou al més vell. */
export async function listAll(sql: Sql) {
  await ensureSchema(sql);
  await ensureClassesSchema(sql);
  const rows = await sql.unsafe(`
    SELECT ${LIST_COLUMNS} FROM ${LIST_FROM} ORDER BY p.created_at DESC LIMIT 300
  `);
  return rows as unknown as PodcastRow[];
}

/** "El meu espai": els pòdcasts publicats per aquest usuari, del més nou al més vell. */
export async function listMine(sql: Sql, ownerId: string) {
  await ensureSchema(sql);
  await ensureClassesSchema(sql);
  const rows = await sql.unsafe(
    `SELECT ${LIST_COLUMNS} FROM ${LIST_FROM} WHERE p.owner_user_id = $1::text ORDER BY p.created_at DESC LIMIT 200`,
    [ownerId],
  );
  return rows as unknown as PodcastRow[];
}

/** "El meu espai": els pòdcasts que aquest usuari ha marcat com a preferits. */
export async function listFavoritesForUser(sql: Sql, userId: string) {
  await ensureSchema(sql);
  await ensureClassesSchema(sql);
  const { ensureFavoritesSchema } = await import("./favorites.server");
  await ensureFavoritesSchema(sql);
  const rows = await sql.unsafe(
    `SELECT ${LIST_COLUMNS} FROM ${LIST_FROM}
     JOIN favorites f ON f.podcast_id = p.id
     WHERE f.auth_user_id = $1::text
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return rows as unknown as PodcastRow[];
}

export interface PodcastEdit {
  title: string;
  desc: string | null;
  cat: string | null;
  tags: string[];
}

async function assertOwnerOrCoordinador(sql: Sql, id: number, requesterId: string, isCoordinador: boolean) {
  const [row] = await sql`SELECT owner_user_id FROM podcasts WHERE id = ${id}::int`;
  if (!row) throw new Error("Aquest pòdcast ja no existeix.");
  if (row["owner_user_id"] !== requesterId && !isCoordinador) {
    throw new Error("Només qui l'ha publicat (o el coordinador) pot fer aquest canvi.");
  }
}

export async function updatePodcastFields(
  sql: Sql,
  id: number,
  requesterId: string,
  isCoordinador: boolean,
  data: PodcastEdit,
) {
  await ensureSchema(sql);
  await assertOwnerOrCoordinador(sql, id, requesterId, isCoordinador);
  await sql`
    UPDATE podcasts
       SET title = ${data.title}::text, "desc" = ${data.desc}::text, cat = ${data.cat}::text, tags = ${data.tags}::text[]
     WHERE id = ${id}::int
  `;
  return { ok: true };
}

export async function deletePodcastRow(sql: Sql, id: number, requesterId: string, isCoordinador: boolean) {
  await ensureSchema(sql);
  await assertOwnerOrCoordinador(sql, id, requesterId, isCoordinador);
  await sql`DELETE FROM podcasts WHERE id = ${id}::int`;
  return { ok: true };
}

export async function reviewPodcast(
  sql: Sql,
  id: number,
  status: string,
  teacherNote: string | null,
  publishAt: string | null,
) {
  await ensureSchema(sql);
  await sql`
    UPDATE podcasts
       SET status = ${status}::text,
           teacher_note = ${teacherNote}::text,
           publish_at = ${publishAt}::timestamptz
     WHERE id = ${id}::int
  `;
  return { ok: true };
}

export async function getAudio(sql: Sql, id: number) {
  const [row] = await sql`
    SELECT audio_data, audio_mime, title FROM podcasts WHERE id = ${id}::int
  `;
  if (!row || !row["audio_data"]) return null;
  return {
    data: row["audio_data"] as Uint8Array,
    mime: (row["audio_mime"] as string) || "audio/mpeg",
    title: row["title"] as string,
  };
}

export async function getCover(sql: Sql, id: number) {
  const [row] = await sql`SELECT cover_data, cover_mime FROM podcasts WHERE id = ${id}::int`;
  if (!row || !row["cover_data"]) return null;
  return {
    data: row["cover_data"] as Uint8Array,
    mime: (row["cover_mime"] as string) || "image/jpeg",
  };
}
