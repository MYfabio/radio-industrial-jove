import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { describePgError } from "./pgError";
import type { AccessRequestKind } from "./accessRequests.server";

/** Missatges d'error en la llengua de qui fa la petició. */
async function msg(key: keyof typeof import("./i18n/messages/serverPodcasts").serverPodcastsMessages, params?: Record<string, string | number>) {
  const { st } = await import("./i18n/server");
  const { serverPodcastsMessages } = await import("./i18n/messages/serverPodcasts");
  return st(serverPodcastsMessages, key, params);
}

export interface SubmitAccessRequestInput {
  kind: AccessRequestKind;
  name: string;
  email: string;
  schoolName: string | null;
  domain: string | null;
  message: string | null;
}

/** Formulari públic: no cal haver iniciat sessió per demanar accés. */
export const submitAccessRequestFn = createServerFn({ method: "POST" })
  .inputValidator((input: SubmitAccessRequestInput) => input)
  .handler(async ({ data }) => {
    const { getSql } = await import("./podcasts.server");
    const { createAccessRequest } = await import("./accessRequests.server");
    const sql = getSql();
    try {
      const name = data.name.trim();
      const email = data.email.trim().toLowerCase();
      if (!name) throw new Error(await msg("nameRequired"));
      if (!email.includes("@")) throw new Error(await msg("emailInvalid"));
      if (data.kind === "escola" && !data.schoolName?.trim()) {
        throw new Error(await msg("schoolNameRequired"));
      }
      return await createAccessRequest(sql, {
        kind: data.kind,
        name,
        email,
        schoolName: data.schoolName?.trim() || null,
        domain: data.domain?.trim().toLowerCase() || null,
        message: data.message?.trim() || null,
      });
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

async function requireSuperAdmin(context: { userId: string; claims: Record<string, unknown> }) {
  const { getSql } = await import("./podcasts.server");
  const { ensureSettingsSchema, getOrCreateProfile, isSuperAdminEmail } = await import("./settings.server");
  const { ensureSchoolsSchema } = await import("./schools.server");
  const sql = getSql();
  try {
    const email = (context.claims["email"] as string | undefined) ?? "";
    if (!isSuperAdminEmail(email)) throw new Error(await msg("superAdminOnly"));
    await ensureSettingsSchema(sql);
    await ensureSchoolsSchema(sql);
    await getOrCreateProfile(sql, context.userId, email);
  } finally {
    await sql.end();
  }
}

export const fetchAccessRequestsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const { listAccessRequests } = await import("./accessRequests.server");
    const sql = getSql();
    try {
      return await listAccessRequests(sql);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface ResolveAccessRequestInput {
  id: number;
  resolved: boolean;
}

export const resolveAccessRequestFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ResolveAccessRequestInput) => input)
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const { setAccessRequestResolved } = await import("./accessRequests.server");
    const sql = getSql();
    try {
      await setAccessRequestResolved(sql, data.id, data.resolved);
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
