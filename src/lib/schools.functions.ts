import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { describePgError } from "./pgError";
import type { MemberRole, ImportRow, SchoolRow, SchoolMemberRow, SchoolInviteRow } from "./schools.server";
import type { ClassRow } from "./classes.server";

export type { MemberRole, ImportRow, SchoolRow, SchoolMemberRow, SchoolInviteRow };

/** Missatges d'error en la llengua de qui fa la petició. */
async function msg(key: keyof typeof import("./i18n/messages/server").serverMessages, params?: Record<string, string | number>) {
  const { st } = await import("./i18n/server");
  const { serverMessages } = await import("./i18n/messages/server");
  return st(serverMessages, key, params);
}

async function requireSuperAdmin(context: { userId: string; claims: Record<string, unknown> }) {
  const { getSql } = await import("./podcasts.server");
  const { ensureSettingsSchema, getOrCreateProfile, isSuperAdminEmail } = await import("./settings.server");
  const { ensureSchoolsSchema } = await import("./schools.server");
  const { ensureClassesSchema } = await import("./classes.server");
  const sql = getSql();
  try {
    const email = (context.claims["email"] as string | undefined) ?? "";
    if (!isSuperAdminEmail(email)) throw new Error(await msg("superAdminOnly"));
    await ensureSettingsSchema(sql);
    await ensureSchoolsSchema(sql);
    await ensureClassesSchema(sql);
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
      if (!name) throw new Error(await msg("schoolNameRequired"));
      const domain = data.googleDomain.trim().toLowerCase();
      if (!domain || !domain.includes(".")) throw new Error(await msg("domainInvalid"));
      const email = data.coordinadorEmail.trim().toLowerCase();
      if (!email.includes("@")) throw new Error(await msg("coordinadorEmailRequired"));
      try {
        return await createSchool(sql, {
          name,
          radioName: data.radioName.trim() || name,
          googleDomain: domain,
          coordinadorEmail: email,
          createdBy: context.userId,
        });
      } catch (err) {
        if (err instanceof Error && err.message === "DOMAIN_TAKEN") throw new Error(await msg("domainTaken"));
        throw err;
      }
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

export interface UpdateSchoolAdminInput {
  id: number;
  name: string;
  radioName: string;
  googleDomain: string;
  coordinadorEmail: string;
}

/** Super admin: edita les dades bàsiques d'un centre. */
export const updateSchoolAdminFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: UpdateSchoolAdminInput) => input)
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const { updateSchool } = await import("./schools.server");
    const sql = getSql();
    try {
      const name = data.name.trim();
      if (!name) throw new Error(await msg("schoolNameRequired"));
      const domain = data.googleDomain.trim().toLowerCase();
      if (domain && !domain.includes(".")) throw new Error(await msg("domainInvalid"));
      const email = data.coordinadorEmail.trim().toLowerCase();
      if (email && !email.includes("@")) throw new Error(await msg("emailInvalid"));
      try {
        await updateSchool(sql, data.id, {
          name,
          radioName: data.radioName.trim() || name,
          googleDomain: domain || null,
          coordinadorEmail: email || null,
        });
      } catch (err) {
        if (err instanceof Error && err.message === "DOMAIN_TAKEN") throw new Error(await msg("domainTaken"));
        throw err;
      }
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface DeleteSchoolInput {
  id: number;
}

/** Super admin: esborra un centre (les classes i els pòdcasts es conserven, sense escola). */
export const deleteSchoolFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: DeleteSchoolInput) => input)
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const { deleteSchool, getSchoolById } = await import("./schools.server");
    const sql = getSql();
    try {
      const school = await getSchoolById(sql, data.id);
      if (!school) throw new Error(await msg("schoolGone"));
      await deleteSchool(sql, data.id);
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export interface SchoolPeople {
  school: SchoolRow;
  members: SchoolMemberRow[];
  invites: SchoolInviteRow[];
  classes: ClassRow[];
  classMembers: Record<number, number>;
}

async function loadSchoolPeople(sql: import("./podcasts.server").Sql, schoolId: number): Promise<SchoolPeople> {
  const { getSchoolById, listSchoolMembers, listSchoolInvites } = await import("./schools.server");
  const { ensureClassesSchema, listClassesBySchool, countMembersByClass } = await import("./classes.server");
  const school = await getSchoolById(sql, schoolId);
  if (!school) throw new Error(await msg("schoolGone"));
  await ensureClassesSchema(sql);
  // Una consulta darrere l'altra: la connexió passa per un pooler i la resta
  // del projecte tampoc no encadena consultes en paral·lel.
  const members = await listSchoolMembers(sql, schoolId);
  const invites = await listSchoolInvites(sql, schoolId);
  const classes = await listClassesBySchool(sql, schoolId);
  const classMembers = await countMembersByClass(sql, schoolId);
  return { school, members, invites, classes, classMembers };
}

export interface SchoolIdInput {
  schoolId: number;
}

/** Super admin: membres, invitacions i classes de qualsevol centre. */
export const fetchSchoolPeopleAdminFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SchoolIdInput) => input)
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { getSql } = await import("./podcasts.server");
    const sql = getSql();
    try {
      return await loadSchoolPeople(sql, data.schoolId);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/* ------------------------------------------------------------------------ */
/* Gestió de membres: compartida entre el coordinador (la seva escola) i el  */
/* super admin (qualsevol escola).                                            */
/* ------------------------------------------------------------------------ */

export interface AssignRoleInput {
  email: string;
  role: MemberRole;
  /** Només el super admin l'envia; el coordinador sempre actua sobre la seva escola. */
  schoolId?: number;
}

export interface MemberRoleInput {
  authUserId: string;
  role: MemberRole;
  schoolId?: number;
}

export interface MemberIdInput {
  authUserId: string;
  schoolId?: number;
}

export interface InviteIdInput {
  inviteId: number;
  schoolId?: number;
}

export interface ImportMembersInput {
  rows: ImportRow[];
  schoolId?: number;
}

const IMPORT_MAX_ROWS = 2000;

/**
 * Resol sobre quina escola pot actuar qui fa la petició: el super admin sobre
 * la que indiqui; el coordinador només sobre la seva.
 */
async function resolveManagedSchool(
  sql: import("./podcasts.server").Sql,
  context: { userId: string; claims: Record<string, unknown> },
  requestedSchoolId: number | undefined,
): Promise<{ schoolId: number; userId: string }> {
  const { ensureSettingsSchema, getOrCreateProfile, isSuperAdminEmail } = await import("./settings.server");
  const { ensureSchoolsSchema } = await import("./schools.server");
  const { ensureClassesSchema } = await import("./classes.server");
  const email = (context.claims["email"] as string | undefined) ?? "";
  await ensureSettingsSchema(sql);
  await ensureSchoolsSchema(sql);
  await ensureClassesSchema(sql);
  const profile = await getOrCreateProfile(sql, context.userId, email);
  if (isSuperAdminEmail(email) && requestedSchoolId !== undefined) {
    return { schoolId: requestedSchoolId, userId: context.userId };
  }
  if (profile.role !== "coordinador") throw new Error(await msg("coordinadorOnly"));
  if (profile.school_id === null) throw new Error(await msg("noSchool"));
  return { schoolId: profile.school_id, userId: context.userId };
}

/** Dona un rol a un correu (si encara no ha entrat mai, queda com a invitació pendent). */
export const assignRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: AssignRoleInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { assignRoleByEmail, isMemberRole } = await import("./schools.server");
    const sql = getSql();
    try {
      const { schoolId, userId } = await resolveManagedSchool(sql, context, data.schoolId);
      const email = data.email.trim().toLowerCase();
      if (!email.includes("@")) throw new Error(await msg("emailInvalid"));
      if (!isMemberRole(data.role)) throw new Error(await msg("roleInvalid"));
      const own = ((context.claims["email"] as string | undefined) ?? "").toLowerCase();
      if (email === own) throw new Error(await msg("cannotChangeSelf"));
      const outcome = await assignRoleByEmail(sql, { schoolId, email, role: data.role, createdBy: userId });
      return { outcome };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/** Canvia el rol d'un membre existent (desplegable de la llista). */
export const setMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: MemberRoleInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { updateMemberRole, isMemberRole } = await import("./schools.server");
    const sql = getSql();
    try {
      const { schoolId } = await resolveManagedSchool(sql, context, data.schoolId);
      if (!isMemberRole(data.role)) throw new Error(await msg("roleInvalid"));
      if (data.authUserId === context.userId) throw new Error(await msg("cannotChangeSelf"));
      const ok = await updateMemberRole(sql, schoolId, data.authUserId, data.role);
      if (!ok) throw new Error(await msg("memberNotFound"));
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/** Treu un membre de l'escola (el compte i els pòdcasts es conserven). */
export const removeMemberFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: MemberIdInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { removeMember } = await import("./schools.server");
    const sql = getSql();
    try {
      const { schoolId } = await resolveManagedSchool(sql, context, data.schoolId);
      if (data.authUserId === context.userId) throw new Error(await msg("cannotChangeSelf"));
      const ok = await removeMember(sql, schoolId, data.authUserId);
      if (!ok) throw new Error(await msg("memberNotFound"));
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

export const deleteInviteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: InviteIdInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { deleteInvite } = await import("./schools.server");
    const sql = getSql();
    try {
      const { schoolId } = await resolveManagedSchool(sql, context, data.schoolId);
      const ok = await deleteInvite(sql, schoolId, data.inviteId);
      if (!ok) throw new Error(await msg("inviteNotFound"));
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/** Importació des d'un full de càlcul (nom, correu, rol, curs, aula). */
export const importMembersFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ImportMembersInput) => input)
  .handler(async ({ context, data }) => {
    const { getSql } = await import("./podcasts.server");
    const { importMembers } = await import("./schools.server");
    const sql = getSql();
    try {
      const { schoolId, userId } = await resolveManagedSchool(sql, context, data.schoolId);
      const own = ((context.claims["email"] as string | undefined) ?? "").toLowerCase();
      const rows = data.rows
        .map((r) => ({
          name: String(r.name ?? "").trim(),
          email: String(r.email ?? "").trim(),
          role: String(r.role ?? "").trim(),
          course: String(r.course ?? "").trim(),
          classroom: String(r.classroom ?? "").trim(),
        }))
        .filter((r) => r.email && r.email.toLowerCase() !== own);
      if (rows.length === 0) throw new Error(await msg("importEmpty"));
      if (rows.length > IMPORT_MAX_ROWS) throw new Error(await msg("importTooMany", { max: IMPORT_MAX_ROWS }));
      return await importMembers(sql, schoolId, rows, userId);
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });

/* ------------------------------------------------------------------------ */
/* Panell del coordinador                                                    */
/* ------------------------------------------------------------------------ */

async function requireCoordinadorSchoolId(context: { userId: string; claims: Record<string, unknown> }) {
  const { getSql } = await import("./podcasts.server");
  const sql = getSql();
  try {
    return (await resolveManagedSchool(sql, context, undefined)).schoolId;
  } finally {
    await sql.end();
  }
}

export const fetchMySchoolFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const schoolId = await requireCoordinadorSchoolId(context);
    const { getSql } = await import("./podcasts.server");
    const sql = getSql();
    try {
      return await loadSchoolPeople(sql, schoolId);
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
      if (!radioName) throw new Error(await msg("radioNameRequired"));
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

/** Compatibilitat: dona permís de docent a algú que ja ha iniciat sessió. Avui el panell fa servir assignRoleFn. */
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
      if (!email.includes("@")) throw new Error(await msg("emailInvalid"));
      const ok = await setMemberRole(sql, schoolId, email, "docent");
      if (!ok) throw new Error(await msg("notLoggedYet"));
      return { ok: true };
    } catch (err) {
      throw new Error(describePgError(err));
    } finally {
      await sql.end();
    }
  });
