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

export interface ChooseRoleInput {
  choice: "alumne" | "docent";
}

/**
 * Primer accés: la persona diu si és alumne o docent. Dir "docent" no dona
 * cap permís — crea una sol·licitud d'accés perquè un humà la revisi.
 */
export const chooseRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ChooseRoleInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { ensureSettingsSchema, getOrCreateProfile, setDeclaredRole } = await import("./settings.server");
    const { ensureSchoolsSchema } = await import("./schools.server");
    const sql = getSql();
    try {
      await ensureSettingsSchema(sql);
      await ensureSchoolsSchema(sql);
      const email = (context.claims.email as string | undefined) ?? "";
      await getOrCreateProfile(sql, context.userId, email);
      await setDeclaredRole(sql, context.userId, data.choice);

      if (data.choice === "docent") {
        const { createAccessRequest } = await import("./accessRequests.server");
        const name =
          (context.claims["user_metadata"] as Record<string, unknown> | undefined)?.["full_name"] as
            | string
            | undefined;
        await createAccessRequest(sql, {
          kind: "docent",
          name: name?.trim() || email,
          email,
          schoolName: null,
          domain: email.split("@")[1]?.toLowerCase() ?? null,
          message: "Sol·licitud automàtica del primer accés (ha dit que és docent).",
        });
      }
      return { ok: true };
    } finally {
      await sql.end();
    }
  });
