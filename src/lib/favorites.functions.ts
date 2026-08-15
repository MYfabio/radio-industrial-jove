import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { optionalSupabaseAuth } from "./optionalAuth.server";

export interface ToggleFavoriteInput {
  podcastId: number;
}

export const toggleFavoriteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ToggleFavoriteInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { ensureFavoritesSchema, toggleFavorite } = await import("./favorites.server");
    const sql = getSql();
    try {
      await ensureFavoritesSchema(sql);
      const favorited = await toggleFavorite(sql, context.userId, data.podcastId);
      return { favorited };
    } finally {
      await sql.end();
    }
  });

/** Ids dels pòdcasts que l'usuari actual ha marcat com a preferits (buit si no ha iniciat sessió). */
export const fetchMyFavoriteIds = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    if (!context.userId) return [] as number[];
    const { getSql } = await import("./podcasts.server");
    const { ensureFavoritesSchema, listFavoriteIds } = await import("./favorites.server");
    const sql = getSql();
    try {
      await ensureFavoritesSchema(sql);
      return await listFavoriteIds(sql, context.userId);
    } finally {
      await sql.end();
    }
  });

export const fetchMyFavoritePodcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql, listFavoritesForUser } = await import("./podcasts.server");
    const sql = getSql();
    try {
      return await listFavoritesForUser(sql, context.userId);
    } finally {
      await sql.end();
    }
  });
