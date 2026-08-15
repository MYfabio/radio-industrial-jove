import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Role } from "./settings.server";

export const fetchMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile } = await import("./settings.server");
    const { ensureClassesSchema } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      await ensureClassesSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      return await getOrCreateProfile(sql, context.userId, email);
    } finally {
      await sql.end();
    }
  });

export const fetchPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getSql } = await import("./podcasts.server");
  const { ensureSettingsSchema, getSettings } = await import("./settings.server");
  const sql = getSql();
  try {
    await ensureSettingsSchema(sql);
    return await getSettings(sql);
  } finally {
    await sql.end();
  }
});

export interface UpdateSettingsInput {
  allowExternalSharing: boolean;
  allowedEmailDomain: string;
}

export const updateSiteSettingsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdateSettingsInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile, updateSettings } = await import("./settings.server");
    const { ensureClassesSchema } = await import("./classes.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      await ensureClassesSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      const profile = await getOrCreateProfile(sql, context.userId, email);
      if ((profile.role as Role) !== "coordinador") {
        throw new Error("Només el coordinador del centre pot canviar aquesta opció.");
      }
      await updateSettings(sql, data);
      return { ok: true };
    } finally {
      await sql.end();
    }
  });
