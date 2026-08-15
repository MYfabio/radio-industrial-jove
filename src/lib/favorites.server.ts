/** Pòdcasts preferits: cada usuari pot marcar-ne al mur per retrobar-los a "El meu espai". */
import type { Sql } from "./podcasts.server";

export async function ensureFavoritesSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      auth_user_id TEXT NOT NULL,
      podcast_id INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (auth_user_id, podcast_id)
    );
  `;
}

export async function toggleFavorite(sql: Sql, userId: string, podcastId: number): Promise<boolean> {
  const [existing] = await sql`
    SELECT 1 FROM favorites WHERE auth_user_id = ${userId} AND podcast_id = ${podcastId}
  `;
  if (existing) {
    await sql`DELETE FROM favorites WHERE auth_user_id = ${userId} AND podcast_id = ${podcastId}`;
    return false;
  }
  await sql`INSERT INTO favorites (auth_user_id, podcast_id) VALUES (${userId}, ${podcastId})`;
  return true;
}

export async function listFavoriteIds(sql: Sql, userId: string): Promise<number[]> {
  const rows = await sql`SELECT podcast_id FROM favorites WHERE auth_user_id = ${userId}`;
  return (rows as unknown as { podcast_id: number }[]).map((r) => r.podcast_id);
}
