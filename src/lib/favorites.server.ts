/** Pòdcasts preferits: cada usuari pot marcar-ne al mur per retrobar-los a "El meu espai". */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlInt } from "./sqlLiteral";

export async function ensureFavoritesSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS favorites (
      auth_user_id TEXT NOT NULL,
      podcast_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (auth_user_id, podcast_id)
    );
  `);
}

export async function toggleFavorite(sql: Sql, userId: string, podcastId: number): Promise<boolean> {
  const [existing] = await sql.unsafe(
    `SELECT 1 FROM favorites WHERE auth_user_id = ${sqlText(userId)} AND podcast_id = ${sqlInt(podcastId)}`,
  );
  if (existing) {
    await sql.unsafe(
      `DELETE FROM favorites WHERE auth_user_id = ${sqlText(userId)} AND podcast_id = ${sqlInt(podcastId)}`,
    );
    return false;
  }
  await sql.unsafe(
    `INSERT INTO favorites (auth_user_id, podcast_id) VALUES (${sqlText(userId)}, ${sqlInt(podcastId)})`,
  );
  return true;
}

export async function listFavoriteIds(sql: Sql, userId: string): Promise<number[]> {
  const rows = await sql.unsafe(`SELECT podcast_id FROM favorites WHERE auth_user_id = ${sqlText(userId)}`);
  return (rows as unknown as { podcast_id: number }[]).map((r) => r.podcast_id);
}
