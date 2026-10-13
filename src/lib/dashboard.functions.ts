import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { describePgError } from "./pgError";
import type { ClassDashboard } from "./dashboard.server";

export type { ClassDashboard };

async function msg(
  key: keyof typeof import("./i18n/messages/server").serverMessages,
  params?: Record<string, string | number>,
) {
  const { st } = await import("./i18n/server");
  const { serverMessages } = await import("./i18n/messages/server");
  return st(serverMessages, key, params);
}

export interface ClassDashboardInput {
  classId: number;
}

/** Només qui ha creat la classe, el coordinador del seu centre o el super admin. */
export const fetchClassDashboardFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ClassDashboardInput) => input)
  .handler(async ({ context, data }): Promise<ClassDashboard> => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile, isSuperAdminEmail } =
      await import("./settings.server");
    const { ensureSchoolsSchema } = await import("./schools.server");
    const { ensureClassesSchema, getClassById } =
      await import("./classes.server");
    const { getClassDashboard } = await import("./dashboard.server");
    const sql = getSql();
    try {
      const email = (context.claims["email"] as string | undefined) ?? "";
      await ensureSettingsSchema(sql);
      await ensureSchoolsSchema(sql);
      await ensureClassesSchema(sql);
      const profile = await getOrCreateProfile(sql, context.userId, email);
      const cls = await getClassById(sql, data.classId);
      if (!cls) throw new Error(await msg("classCodeUnknown"));
      const isOwner = cls.created_by === context.userId;
      const isSchoolCoordinador =
        profile.role === "coordinador" &&
        profile.school_id !== null &&
        cls.school_id === profile.school_id;
      if (!isOwner && !isSchoolCoordinador && !isSuperAdminEmail(email)) {
        throw new Error(await msg("classNotYours"));
      }
      return await getClassDashboard(sql, cls.id);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
