import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Role } from "./settings.server";
import type { ClassRow } from "./classes.server";
import { describePgError } from "./pgError";

export type { ClassRow };

/** Missatges d'error en la llengua de qui fa la petició. */
async function msg(key: keyof typeof import("./i18n/messages/server").serverMessages, params?: Record<string, string | number>) {
  const { st } = await import("./i18n/server");
  const { serverMessages } = await import("./i18n/messages/server");
  return st(serverMessages, key, params);
}

async function ensureAll(sql: import("./podcasts.server").Sql) {
  const { ensureSettingsSchema } = await import("./settings.server");
  const { ensureClassesSchema } = await import("./classes.server");
  const { ensureSchoolsSchema } = await import("./schools.server");
  await ensureSettingsSchema(sql);
  await ensureSchoolsSchema(sql);
  await ensureClassesSchema(sql);
}

export interface CreateClassInput {
  name: string;
  shareToSchool: boolean;
}

export const createClassFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateClassInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { getOrCreateProfile } = await import("./settings.server");
    const { createClass } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      if ((profile.role as Role) === "alumne") {
        throw new Error(await msg("classCreateForbidden"));
      }
      const name = data.name.trim();
      if (!name) throw new Error(await msg("classNameRequired"));
      return await createClass(sql, context.userId, name, profile.school_id, data.shareToSchool);
    } catch (err) {
      if (err instanceof Error && err.message === "CODE_UNIQUE") throw new Error(await msg("codeUnique"));
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export const fetchMyClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { listClassesByOwner } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      return await listClassesByOwner(sql, context.userId);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface JoinClassInput {
  code: string;
}

export const joinClassFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: JoinClassInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { joinClassByCode } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const cls = await joinClassByCode(sql, context.userId, data.code);
      if (!cls) throw new Error(await msg("classCodeUnknown"));
      return cls;
    } finally {
      await sql.end();
    }
  });

/** Les classes de què és membre l'usuari actual, i quina és l'activa. */
export const fetchMyMembershipsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ classes: ClassRow[]; activeClassId: number | null }> => {
    const { getSql } = await import("./podcasts.server");
    const { getOrCreateProfile } = await import("./settings.server");
    const { listMembershipsForUser } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      const classes = await listMembershipsForUser(sql, context.userId);
      return { classes, activeClassId: profile.class_id };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface SetActiveClassInput {
  classId: number;
}

/** Tria la classe activa (on van els pòdcasts que publiqui) entre les seves. */
export const setActiveClassFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SetActiveClassInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { setActiveClass } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const ok = await setActiveClass(sql, context.userId, data.classId);
      if (!ok) throw new Error(await msg("notMemberOfClass"));
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface DeleteClassInput {
  classId: number;
}

/** Esborra una classe buida: qui l'ha creada o el coordinador de la seva escola. */
export const deleteClassFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: DeleteClassInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { getOrCreateProfile, isSuperAdminEmail } = await import("./settings.server");
    const { getClassById, countPodcastsForClass, deleteClass } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureAll(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      const cls = await getClassById(sql, data.classId);
      if (!cls) throw new Error(await msg("classCodeUnknown"));
      const isOwner = cls.created_by === context.userId;
      const isSchoolCoordinador =
        profile.role === "coordinador" && profile.school_id !== null && cls.school_id === profile.school_id;
      if (!isOwner && !isSchoolCoordinador && !isSuperAdminEmail(email)) {
        throw new Error(await msg("classNotYours"));
      }
      const count = await countPodcastsForClass(sql, cls.id);
      if (count > 0) throw new Error(await msg("classHasPodcasts", { count }));
      await deleteClass(sql, cls.id);
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface ClassByCodeInput {
  code: string;
}

/** Consulta pública (sense sessió) del nom d'una classe pel seu codi, per al mur /classe/$code. */
export const fetchClassByCode = createServerFn({ method: "GET" })
  .inputValidator((input: ClassByCodeInput) => input)
  .handler(async ({ data }) => {
    const { getSql } = await import("./podcasts.server");
    const { getClassByInviteCode, ensureClassesSchema } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureClassesSchema(sql);
      const cls = await getClassByInviteCode(sql, data.code);
      if (!cls) throw new Error(await msg("classCodeUnknown"));
      return cls;
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
