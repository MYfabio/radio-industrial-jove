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
  };
}

export async function getOrCreateProfile(sql: Sql, userId: string, email: string): Promise<ProfileRow> {
  const [existing] = await sql.unsafe(
    `SELECT auth_user_id, email, role, class_id, school_id FROM profiles WHERE auth_user_id = ${sqlText(userId)}`,
  );
  if (existing) return withComputed(existing as Record<string, unknown>);

  const { getOrCreateSchoolForDomain } = await import("./schools.server");
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  let schoolId: number | null = null;
  let role: Role = "alumne";

  if (isSuperAdminEmail(email)) {
    role = "coordinador";
  }

  if (domain === DEFAULT_ALLOWED_DOMAIN) {
    // Compatibilitat: el domini històric del projecte sempre té una escola,
    // encara que ningú l'hagi donada d'alta explícitament des del panell de
    // super admin.
    const school = await getOrCreateSchoolForDomain(sql, domain, {
      name: SITE_NAME,
      radioName: SITE_NAME,
      coordinadorEmail: SUPER_ADMIN_EMAIL,
      createdBy: SUPER_ADMIN_EMAIL,
    });
    schoolId = school.id;
    if (email.toLowerCase() === (school.coordinador_email ?? "").toLowerCase()) role = "coordinador";
  } else if (domain) {
    const { getSchoolByDomain } = await import("./schools.server");
    const school = await getSchoolByDomain(sql, domain);
    if (school) {
      schoolId = school.id;
      if (email.toLowerCase() === (school.coordinador_email ?? "").toLowerCase()) role = "coordinador";
    }
  }

  const [created] = await sql.unsafe(`
    INSERT INTO profiles (auth_user_id, email, role, school_id)
    VALUES (${sqlText(userId)}, ${sqlText(email)}, ${sqlText(role)}, ${sqlInt(schoolId)})
    ON CONFLICT (auth_user_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING auth_user_id, email, role, class_id, school_id
  `);
  return withComputed(created as Record<string, unknown>);
}
