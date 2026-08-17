import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const fetchMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const { ensureClassesSchema } = await import("./classes.server");
    const { ensureSchoolsSchema } = await import("./schools.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      await ensureSchoolsSchema(sql);
      await ensureClassesSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      return await getOrCreateProfile(sql, context.userId, email);
    } finally {
      await sql.end();
    }
  });

export const acceptTermsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, acceptTerms } = await import("./settings.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      await acceptTerms(sql, context.userId);
      return { ok: true };
    } finally {
      await sql.end();
    }
  });
