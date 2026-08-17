import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { describePgError } from "./pgError";

async function requireSuperAdmin(context: { userId: string; claims: Record<string, unknown> }) {
  const { getSql } = await import("./podcasts.server");
  const { getOrCreateProfile, isSuperAdminEmail } = await import("./settings.server");
  const sql = getSql();
  try {
    const email = (context.claims["email"] as string | undefined) ?? "";
    if (!isSuperAdminEmail(email)) throw new Error("Aquest panell només és per al super admin.");
    await getOrCreateProfile(sql, context.userId, email);
  } finally {
    await sql.end();
  }
}

export interface CreateSchoolInput {
  name: string;
  radioName: string;
  googleDomain: string;
  coordinadorEmail: string;
}

export const createSchoolFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreateSchoolInput) => input)
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const { createSchool } = await import("./schools.server");
    const sql = getSql();
    try {
      const name = data.name.trim();
      if (!name) throw new Error("Posa-hi un nom per al centre.");
      const domain = data.googleDomain.trim().toLowerCase();
      if (!domain || !domain.includes(".")) throw new Error("Posa-hi un domini de Google vàlid (p. ex. escola.org).");
      const email = data.coordinadorEmail.trim().toLowerCase();
      if (!email.includes("@")) throw new Error("Posa-hi el correu del coordinador o coordinadora.");
      return await createSchool(sql, {
        name,
        radioName: data.radioName.trim() || name,
        googleDomain: domain,
        coordinadorEmail: email,
        createdBy: context.userId,
      });
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export const fetchSchoolsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const { listSchools } = await import("./schools.server");
    const sql = getSql();
    try {
      return await listSchools(sql);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

async function requireCoordinadorSchoolId(context: { userId: string; claims: Record<string, unknown> }) {
  const { getSql } = await import("./podcasts.server");
  const { getOrCreateProfile } = await import("./settings.server");
  const sql = getSql();
  try {
    const email = (context.claims["email"] as string | undefined) ?? "";
    const profile = await getOrCreateProfile(sql, context.userId, email);
    if (profile.role !== "coordinador") throw new Error("Aquest panell només és per al coordinador o coordinadora.");
    if (profile.school_id === null) throw new Error("El teu compte no està vinculat a cap escola.");
    return profile.school_id;
  } finally {
    await sql.end();
  }
}

export const fetchMySchoolFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const schoolId = await requireCoordinadorSchoolId(context);
    const { getSql } = await import("./podcasts.server");
    const { getSchoolById, listSchoolMembers } = await import("./schools.server");
    const sql = getSql();
    try {
      const school = await getSchoolById(sql, schoolId);
      if (!school) throw new Error("Aquesta escola ja no existeix.");
      const members = await listSchoolMembers(sql, schoolId);
      return { school, members };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface UpdateSchoolInput {
  radioName: string;
  allowExternalSharing: boolean;
}

export const updateMySchoolFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdateSchoolInput) => input)
  .handler(async ({ context, data }) => {
    const schoolId = await requireCoordinadorSchoolId(context);
    const { getSql } = await import("./podcasts.server");
    const { updateSchoolSettings } = await import("./schools.server");
    const sql = getSql();
    try {
      const radioName = data.radioName.trim();
      if (!radioName) throw new Error("Posa-hi un nom per a la ràdio.");
      await updateSchoolSettings(sql, schoolId, { radioName, allowExternalSharing: data.allowExternalSharing });
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface SetDocentInput {
  email: string;
}

export const setDocentFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SetDocentInput) => input)
  .handler(async ({ context, data }) => {
    const schoolId = await requireCoordinadorSchoolId(context);
    const { getSql } = await import("./podcasts.server");
    const { setMemberRole } = await import("./schools.server");
    const sql = getSql();
    try {
      const email = data.email.trim().toLowerCase();
      if (!email.includes("@")) throw new Error("Posa-hi un correu vàlid.");
      const ok = await setMemberRole(sql, schoolId, email, "docent");
      if (!ok) {
        throw new Error(
          "Aquesta persona encara no ha iniciat sessió a la plataforma. Demana-li que ho faci un cop amb Google i torna-ho a provar.",
        );
      }
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
