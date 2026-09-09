import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { describePgError } from "./pgError";
import type { PlayStats } from "./plays.server";

export type { PlayStats };

/** Missatges d'error en la llengua de qui fa la petició. */
async function msg(
  key: keyof typeof import("./i18n/messages/server").serverMessages,
  params?: Record<string, string | number>,
) {
  const { st } = await import("./i18n/server");
  const { serverMessages } = await import("./i18n/messages/server");
  return st(serverMessages, key, params);
}

export interface RegisterPlayInput {
  id: number;
}

/**
 * Suma una escolta. És pública (el mur d'una classe es pot veure amb el codi,
 * sense sessió) i no desa qui escolta: només el recompte del dia. Si falla,
 * no ha de trencar mai la reproducció: qui la crida n'ignora l'error.
 */
export const registerPlayFn = createServerFn({ method: "POST" })
  .inputValidator((input: RegisterPlayInput) => input)
  .handler(async ({ data }) => {
    const id = Number(data.id);
    if (!Number.isSafeInteger(id) || id <= 0) return { ok: false };
    const { getSql } = await import("./podcasts.server");
    const { registerPlay } = await import("./plays.server");
    const sql = getSql();
    try {
      return { ok: await registerPlay(sql, id) };
    } catch {
      // Un comptador que falla no pot impedir que s'escolti el pòdcast.
      return { ok: false };
    } finally {
      await sql.end();
    }
  });

export interface PlayStatsInput {
  days: number;
  /** Només el super admin: null vol dir "tots els centres". */
  schoolId?: number | null;
}

const ALLOWED_DAYS = [7, 30, 90];

/**
 * Estadístiques per als panells. El coordinador només veu el seu centre; el
 * super admin, el que triï (o tots).
 */
export const fetchPlayStatsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PlayStatsInput) => input)
  .handler(async ({ context, data }): Promise<PlayStats> => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile, isSuperAdminEmail } =
      await import("./settings.server");
    const { ensureSchoolsSchema } = await import("./schools.server");
    const { ensureClassesSchema } = await import("./classes.server");
    const { getPlayStats } = await import("./plays.server");
    const sql = getSql();
    try {
      const email = (context.claims["email"] as string | undefined) ?? "";
      await ensureSettingsSchema(sql);
      await ensureSchoolsSchema(sql);
      await ensureClassesSchema(sql);
      const profile = await getOrCreateProfile(sql, context.userId, email);
      const days = ALLOWED_DAYS.includes(data.days) ? data.days : 30;

      let schoolId: number | null;
      if (isSuperAdminEmail(email)) {
        schoolId = data.schoolId ?? null;
      } else {
        if (profile.role !== "coordinador")
          throw new Error(await msg("coordinadorOnly"));
        if (profile.school_id === null) throw new Error(await msg("noSchool"));
        schoolId = profile.school_id;
      }
      return await getPlayStats(sql, { schoolId, days });
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
