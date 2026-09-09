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
  display_name: string | null;
}

const PROFILE_COLUMNS = `auth_user_id, email, role, class_id, school_id, terms_accepted_at, display_name`;

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
  await sql.unsafe(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT`);
  // Un alumne pot ser de més d'una classe (la seva classe i els subgrups
  // d'un docent): profiles.class_id és la classe activa, i aquí hi ha totes.
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS class_members (
      class_id INTEGER NOT NULL,
      auth_user_id TEXT NOT NULL,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (class_id, auth_user_id)
    );
  `);
  // Persones donades d'alta (coordinador, importació Excel) abans que hagin
  // iniciat sessió: en entrar per primer cop se'ls aplica rol, escola i classe.
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS school_invites (
      id SERIAL PRIMARY KEY,
      school_id INTEGER NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'alumne',
      class_id INTEGER,
      display_name TEXT,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
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
    display_name: (row["display_name"] as string | null) ?? null,
  };
}

const ROLE_RANK: Record<Role, number> = { alumne: 0, docent: 1, coordinador: 2 };

/**
 * Si algú ha donat d'alta aquest correu (coordinador des del panell o
 * importació Excel) abans que la persona iniciés sessió, li apliquem escola,
 * rol i classe ara, i esborrem la invitació. No rebaixa mai un rol que ja
 * tingui (un coordinador no passa a alumne perquè un full de càlcul ho digui).
 */
async function applyPendingInvite(sql: Sql, profile: ProfileRow): Promise<ProfileRow> {
  const [invite] = await sql.unsafe(
    `SELECT id, school_id, role, class_id, display_name FROM school_invites WHERE email = ${sqlText(profile.email.toLowerCase())}`,
  );
  if (!invite) return profile;
  const inviteRole = invite["role"] as Role;
  const role = ROLE_RANK[inviteRole] >= ROLE_RANK[profile.role] ? inviteRole : profile.role;
  const classId = (invite["class_id"] as number | null) ?? profile.class_id;
  const displayName = profile.display_name ?? ((invite["display_name"] as string | null) ?? null);
  const [updated] = await sql.unsafe(`
    UPDATE profiles
       SET school_id = ${sqlInt(invite["school_id"] as number)},
           role = ${sqlText(role)},
           class_id = ${sqlInt(classId)},
           display_name = ${sqlText(displayName)}
     WHERE auth_user_id = ${sqlText(profile.auth_user_id)}
     RETURNING ${PROFILE_COLUMNS}
  `);
  if (invite["class_id"] !== null && invite["class_id"] !== undefined) {
    await sql.unsafe(`
      INSERT INTO class_members (class_id, auth_user_id)
      VALUES (${sqlInt(invite["class_id"] as number)}, ${sqlText(profile.auth_user_id)})
      ON CONFLICT DO NOTHING
    `);
  }
  await sql.unsafe(`DELETE FROM school_invites WHERE id = ${sqlInt(invite["id"] as number)}`);
  return withComputed(updated as Record<string, unknown>);
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
    `SELECT ${PROFILE_COLUMNS} FROM profiles WHERE auth_user_id = ${sqlText(userId)}`,
  );
  if (existing) {
    const profile = await applyPendingInvite(sql, withComputed(existing as Record<string, unknown>));
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
           RETURNING ${PROFILE_COLUMNS}
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
    RETURNING ${PROFILE_COLUMNS}
  `);
  return applyPendingInvite(sql, withComputed(created as Record<string, unknown>));
}
