/**
 * Configuració global (compatibilitat amb instal·lacions antigues) i perfils
 * d'usuari. Des de la introducció de les escoles, cada perfil pot pertànyer
 * a una escola (profiles.school_id) i el rol de coordinador és per escola.
 */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlInt } from "./sqlLiteral";
import { SITE_NAME } from "./siteConfig";

export type Role = "alumne" | "docent" | "coordinador";

/**
 * Aquest correu és el "super admin" de la instal·lació: dona d'alta escoles
 * noves. També és, per compatibilitat amb el comportament anterior a les
 * escoles, el coordinador de l'escola per defecte que es crea per al domini
 * històric del projecte.
 */
const SUPER_ADMIN_EMAIL = "fabio.martinez@escolaindustrial.org";
const DEFAULT_ALLOWED_DOMAIN = "escolaindustrial.org";

export interface ProfileRow {
  auth_user_id: string;
  email: string;
  role: Role;
  class_id: number | null;
  school_id: number | null;
  is_super_admin: boolean;
  terms_accepted_at: string | null;
  /** Què va dir que era en el primer accés ("alumne" | "docent"); null = encara no ho ha triat. */
  declared_role: string | null;
}

export function isSuperAdminEmail(email: string): boolean {
  return email.toLowerCase() === SUPER_ADMIN_EMAIL;
}

export async function ensureSettingsSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS profiles (
      auth_user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'alumne',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await sql.unsafe(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_id INTEGER`);
  await sql.unsafe(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ`);
  await sql.unsafe(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS declared_role TEXT`);
}

function withComputed(row: Record<string, unknown>): ProfileRow {
  const email = row["email"] as string;
  return {
    auth_user_id: row["auth_user_id"] as string,
    email,
    role: row["role"] as Role,
    class_id: (row["class_id"] as number | null) ?? null,
    school_id: (row["school_id"] as number | null) ?? null,
    is_super_admin: isSuperAdminEmail(email),
    terms_accepted_at: (row["terms_accepted_at"] as string | null) ?? null,
    declared_role: (row["declared_role"] as string | null) ?? null,
  };
}

/** Desa què ha dit que és en el primer accés (alumne o docent). */
export async function setDeclaredRole(sql: Sql, userId: string, choice: "alumne" | "docent") {
  await sql.unsafe(
    `UPDATE profiles SET declared_role = ${sqlText(choice)} WHERE auth_user_id = ${sqlText(userId)}`,
  );
}

/** Docents i coordinadors han d'acceptar les condicions d'ús abans d'accedir als seus panells. */
export async function acceptTerms(sql: Sql, userId: string): Promise<void> {
  await sql.unsafe(
    `UPDATE profiles SET terms_accepted_at = now() WHERE auth_user_id = ${sqlText(userId)}`,
  );
}

/** Troba (creant-la si cal, per al domini històric) l'escola d'aquest correu i si n'és el coordinador. */
async function resolveSchool(
  sql: Sql,
  email: string,
): Promise<{ schoolId: number | null; isCoordinador: boolean }> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return { schoolId: null, isCoordinador: false };

  if (domain === DEFAULT_ALLOWED_DOMAIN) {
    // Compatibilitat: el domini històric del projecte sempre té una escola,
    // encara que ningú l'hagi donada d'alta explícitament des del panell de
    // super admin.
    const { getOrCreateSchoolForDomain } = await import("./schools.server");
    const school = await getOrCreateSchoolForDomain(sql, domain, {
      name: SITE_NAME,
      radioName: SITE_NAME,
      coordinadorEmail: SUPER_ADMIN_EMAIL,
      createdBy: SUPER_ADMIN_EMAIL,
    });
    return { schoolId: school.id, isCoordinador: email.toLowerCase() === (school.coordinador_email ?? "").toLowerCase() };
  }

  const { getSchoolByDomain } = await import("./schools.server");
  const school = await getSchoolByDomain(sql, domain);
  if (!school) return { schoolId: null, isCoordinador: false };
  return { schoolId: school.id, isCoordinador: email.toLowerCase() === (school.coordinador_email ?? "").toLowerCase() };
}

export async function getOrCreateProfile(sql: Sql, userId: string, email: string): Promise<ProfileRow> {
  const [existing] = await sql.unsafe(
    `SELECT auth_user_id, email, role, class_id, school_id, terms_accepted_at, declared_role FROM profiles WHERE auth_user_id = ${sqlText(userId)}`,
  );
  if (existing) {
    const profile = withComputed(existing as Record<string, unknown>);
    // Perfils creats abans d'existir les escoles es van quedar amb school_id
    // buit per sempre: aquí els l'omplim en la primera petició que arribi.
    if (profile.school_id === null) {
      const { schoolId, isCoordinador } = await resolveSchool(sql, email);
      if (schoolId !== null) {
        const promote = isCoordinador && profile.role !== "coordinador";
        const [updated] = await sql.unsafe(`
          UPDATE profiles
             SET school_id = ${sqlInt(schoolId)}${promote ? `, role = ${sqlText("coordinador")}` : ""}
           WHERE auth_user_id = ${sqlText(userId)}
           RETURNING auth_user_id, email, role, class_id, school_id, terms_accepted_at, declared_role
        `);
        return withComputed(updated as Record<string, unknown>);
      }
    }
    return profile;
  }

  const { schoolId, isCoordinador } = await resolveSchool(sql, email);
  const role: Role = isSuperAdminEmail(email) || isCoordinador ? "coordinador" : "alumne";

  const [created] = await sql.unsafe(`
    INSERT INTO profiles (auth_user_id, email, role, school_id)
    VALUES (${sqlText(userId)}, ${sqlText(email)}, ${sqlText(role)}, ${sqlInt(schoolId)})
    ON CONFLICT (auth_user_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING auth_user_id, email, role, class_id, school_id, terms_accepted_at, declared_role
  `);
  return withComputed(created as Record<string, unknown>);
}
