/**
 * Comptador d'escoltes dels pòdcasts.
 *
 * Només es desa un recompte agregat per pòdcast i dia: cap identificador de
 * qui escolta, cap adreça IP, cap hora exacta. Qui escolta el mur és alumnat
 * menor d'edat, així que el panell ha de poder dir "aquest pòdcast s'ha
 * escoltat 12 vegades" i mai "aquest alumne ha escoltat aquest pòdcast".
 */
import type { Sql } from "./podcasts.server";
import { sqlInt } from "./sqlLiteral";

export interface DailyPlays {
  /** Dia en format YYYY-MM-DD. */
  day: string;
  plays: number;
}

export interface TopPodcast {
  id: number;
  title: string;
  cover: string | null;
  has_cover_image: boolean;
  class_name: string | null;
  plays: number;
}

export interface PlayStats {
  daily: DailyPlays[];
  top: TopPodcast[];
  totalPlays: number;
  last7: number;
  playedPodcasts: number;
  publishedPodcasts: number;
  days: number;
}

export async function ensurePlaysSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS podcast_plays (
      podcast_id INTEGER NOT NULL,
      day DATE NOT NULL,
      plays INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (podcast_id, day)
    );
  `);
}

/** Suma una escolta al pòdcast (al dia d'avui). Ignora els pòdcasts que ja no existeixen. */
export async function registerPlay(
  sql: Sql,
  podcastId: number,
): Promise<boolean> {
  await ensurePlaysSchema(sql);
  const [exists] = await sql.unsafe(
    `SELECT 1 FROM podcasts WHERE id = ${sqlInt(podcastId)}`,
  );
  if (!exists) return false;
  await sql.unsafe(`
    INSERT INTO podcast_plays (podcast_id, day, plays)
    VALUES (${sqlInt(podcastId)}, CURRENT_DATE, 1)
    ON CONFLICT (podcast_id, day) DO UPDATE SET plays = podcast_plays.plays + 1
  `);
  return true;
}

/** Omple els dies sense cap escolta amb un zero, perquè la gràfica no tingui forats. */
function fillDays(rows: DailyPlays[], days: number): DailyPlays[] {
  const byDay = new Map(rows.map((r) => [r.day, r.plays]));
  const out: DailyPlays[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - i),
    );
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, plays: byDay.get(key) ?? 0 });
  }
  return out;
}

/**
 * Estadístiques d'escoltes. Amb `schoolId` es limiten als pòdcasts de les
 * classes d'aquell centre; sense, són les de tota la instal·lació (super admin).
 */
export async function getPlayStats(
  sql: Sql,
  options: { schoolId: number | null; days: number },
): Promise<PlayStats> {
  await ensurePlaysSchema(sql);
  const { schoolId, days } = options;
  const scope =
    schoolId === null ? "" : ` AND c.school_id = ${sqlInt(schoolId)}`;
  const since = `pp.day >= CURRENT_DATE - ${sqlInt(days - 1)}`;
  const from = `podcast_plays pp
      JOIN podcasts p ON p.id = pp.podcast_id
      LEFT JOIN classes c ON c.id = p.class_id`;

  const dailyRows = await sql.unsafe(`
    SELECT to_char(pp.day, 'YYYY-MM-DD') AS day, SUM(pp.plays)::int AS plays
      FROM ${from}
     WHERE ${since}${scope}
     GROUP BY pp.day
     ORDER BY pp.day
  `);

  const topRows = await sql.unsafe(`
    SELECT p.id, p.title, p.cover, (p.cover_data IS NOT NULL) AS has_cover_image,
           c.name AS class_name, SUM(pp.plays)::int AS plays
      FROM ${from}
     WHERE ${since}${scope}
     GROUP BY p.id, p.title, p.cover, (p.cover_data IS NOT NULL), c.name
     ORDER BY plays DESC, p.id DESC
     LIMIT 8
  `);

  const [totals] = await sql.unsafe(`
    SELECT COALESCE(SUM(pp.plays), 0)::int AS total,
           COALESCE(SUM(pp.plays) FILTER (WHERE pp.day >= CURRENT_DATE - 6), 0)::int AS last7,
           COUNT(DISTINCT pp.podcast_id)::int AS played
      FROM ${from}
     WHERE ${since}${scope}
  `);

  const [published] = await sql.unsafe(`
    SELECT COUNT(*)::int AS n
      FROM podcasts p
      LEFT JOIN classes c ON c.id = p.class_id
     WHERE p.status = 'aprovat'${scope}
  `);

  return {
    daily: fillDays(dailyRows as unknown as DailyPlays[], days),
    top: topRows as unknown as TopPodcast[],
    totalPlays: (totals?.["total"] as number) ?? 0,
    last7: (totals?.["last7"] as number) ?? 0,
    playedPodcasts: (totals?.["played"] as number) ?? 0,
    publishedPodcasts: (published?.["n"] as number) ?? 0,
    days,
  };
}
