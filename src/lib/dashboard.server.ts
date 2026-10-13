/**
 * Quadre de comandament d'una classe per al docent: qui hi ha, quants
 * pòdcasts ha publicat cadascú i quantes escoltes reals té cada pòdcast.
 *
 * Les escoltes surten de podcast_plays (recompte agregat per pòdcast i dia,
 * sense saber mai qui escolta). Els noms de l'alumnat són els que ja veu el
 * docent al seu panell (nom del perfil o correu).
 */
import type { Sql } from "./podcasts.server";
import { sqlInt } from "./sqlLiteral";

export interface DashboardStudent {
  auth_user_id: string;
  name: string;
  email: string;
  podcasts: number;
  approved: number;
  plays: number;
}

export interface DashboardPodcast {
  id: number;
  title: string;
  author: string | null;
  owner_user_id: string | null;
  status: string;
  created_at: string;
  plays: number;
}

export interface ClassDashboard {
  students: DashboardStudent[];
  podcasts: DashboardPodcast[];
  totalPlays: number;
}

export async function getClassDashboard(
  sql: Sql,
  classId: number,
): Promise<ClassDashboard> {
  const { ensurePlaysSchema } = await import("./plays.server");
  await ensurePlaysSchema(sql);

  const students = await sql.unsafe(`
    WITH membres AS (
      SELECT auth_user_id FROM class_members WHERE class_id = ${sqlInt(classId)}
      UNION
      SELECT auth_user_id FROM profiles WHERE class_id = ${sqlInt(classId)}
    ),
    escoltes AS (
      SELECT podcast_id, SUM(plays)::int AS plays FROM podcast_plays GROUP BY podcast_id
    )
    SELECT p.auth_user_id,
           COALESCE(p.display_name, p.email) AS name,
           p.email,
           COUNT(pod.id)::int AS podcasts,
           COUNT(pod.id) FILTER (WHERE pod.status = 'aprovat')::int AS approved,
           COALESCE(SUM(e.plays), 0)::int AS plays
      FROM membres m
      JOIN profiles p ON p.auth_user_id = m.auth_user_id
      LEFT JOIN podcasts pod ON pod.owner_user_id = p.auth_user_id AND pod.class_id = ${sqlInt(classId)}
      LEFT JOIN escoltes e ON e.podcast_id = pod.id
     WHERE p.role = 'alumne'
     GROUP BY p.auth_user_id, p.display_name, p.email
     ORDER BY podcasts DESC, plays DESC, lower(COALESCE(p.display_name, p.email)) ASC
  `);

  const podcasts = await sql.unsafe(`
    SELECT p.id, p.title, p.author, p.owner_user_id, p.status, p.created_at,
           COALESCE(SUM(pp.plays), 0)::int AS plays
      FROM podcasts p
      LEFT JOIN podcast_plays pp ON pp.podcast_id = p.id
     WHERE p.class_id = ${sqlInt(classId)}
     GROUP BY p.id
     ORDER BY plays DESC, p.created_at DESC
  `);

  const list = podcasts as unknown as DashboardPodcast[];
  return {
    students: students as unknown as DashboardStudent[],
    podcasts: list,
    totalPlays: list.reduce((n, p) => n + p.plays, 0),
  };
}
