/**
 * Escoles: un super admin les dona d'alta pel domini de Google Workspace del
 * centre; cada escola té la seva pròpia ràdio (nom + mur a /escola/$slug) i
 * un coordinador que en gestiona la configuració i els docents.
 */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlInt, sqlBool } from "./sqlLiteral";

export interface SchoolRow {
  id: number;
  name: string;
  radio_name: string;
  slug: string;
  google_domain: string | null;
  coordinador_email: string | null;
  allow_external_sharing: boolean;
  created_by: string;
  created_at: string;
}

export interface SchoolMemberRow {
  auth_user_id: string;
  email: string;
  role: string;
  display_name: string | null;
  class_id: number | null;
  class_name: string | null;
}

export interface SchoolInviteRow {
  id: number;
  school_id: number;
  email: string;
  role: string;
  class_id: number | null;
  class_name: string | null;
  display_name: string | null;
  created_at: string;
}

export type MemberRole = "alumne" | "docent" | "coordinador";

export function isMemberRole(value: unknown): value is MemberRole {
  return value === "alumne" || value === "docent" || value === "coordinador";
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "escola";
}

const SCHOOL_COLUMNS = `id, name, radio_name, slug, google_domain, coordinador_email, allow_external_sharing, created_by, created_at`;

export async function ensureSchoolsSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS schools (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      radio_name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      google_domain TEXT UNIQUE,
      coordinador_email TEXT,
      allow_external_sharing BOOLEAN NOT NULL DEFAULT FALSE,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function createSchool(
  sql: Sql,
  data: {
    name: string;
    radioName: string;
    googleDomain: string | null;
    coordinadorEmail: string | null;
    createdBy: string;
  },
): Promise<SchoolRow> {
  await ensureSchoolsSchema(sql);
  const domain = data.googleDomain?.trim().toLowerCase() || null;
  if (domain) {
    const [existing] = await sql.unsafe(`SELECT id FROM schools WHERE lower(google_domain) = ${sqlText(domain)}`);
    if (existing) throw new Error("DOMAIN_TAKEN");
  }
  const base = slugify(data.name);
  let slug = base;
  for (let attempt = 0; attempt < 30; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const [taken] = await sql.unsafe(`SELECT id FROM schools WHERE slug = ${sqlText(candidate)}`);
    if (!taken) {
      slug = candidate;
      break;
    }
  }
  const [row] = await sql.unsafe(`
    INSERT INTO schools (name, radio_name, slug, google_domain, coordinador_email, created_by)
    VALUES (
      ${sqlText(data.name)}, ${sqlText(data.radioName)}, ${sqlText(slug)},
      ${sqlText(domain)}, ${sqlText(data.coordinadorEmail?.trim().toLowerCase() || null)}, ${sqlText(data.createdBy)}
    )
    RETURNING ${SCHOOL_COLUMNS}
  `);
  return row as unknown as SchoolRow;
}

export async function listSchools(sql: Sql): Promise<SchoolRow[]> {
  await ensureSchoolsSchema(sql);
  const rows = await sql.unsafe(`SELECT ${SCHOOL_COLUMNS} FROM schools ORDER BY created_at DESC`);
  return rows as unknown as SchoolRow[];
}

export async function getSchoolByDomain(sql: Sql, domain: string): Promise<SchoolRow | null> {
  await ensureSchoolsSchema(sql);
  const [row] = await sql.unsafe(
    `SELECT ${SCHOOL_COLUMNS} FROM schools WHERE lower(google_domain) = ${sqlText(domain.toLowerCase())}`,
  );
  return (row as unknown as SchoolRow) ?? null;
}

export async function getSchoolBySlug(sql: Sql, slug: string): Promise<SchoolRow | null> {
  await ensureSchoolsSchema(sql);
  const [row] = await sql.unsafe(`SELECT ${SCHOOL_COLUMNS} FROM schools WHERE slug = ${sqlText(slug)}`);
  return (row as unknown as SchoolRow) ?? null;
}

export async function getSchoolById(sql: Sql, id: number): Promise<SchoolRow | null> {
  await ensureSchoolsSchema(sql);
  const [row] = await sql.unsafe(`SELECT ${SCHOOL_COLUMNS} FROM schools WHERE id = ${sqlInt(id)}`);
  return (row as unknown as SchoolRow) ?? null;
}

/**
 * Crea l'escola per defecte la primera vegada que algú d'aquest domini
 * inicia sessió, perquè el comportament d'abans (un únic centre) es
 * mantingui sense que ningú l'hagi de donar d'alta a mà.
 */
export async function getOrCreateSchoolForDomain(
  sql: Sql,
  domain: string,
  defaults: { name: string; radioName: string; coordinadorEmail: string; createdBy: string },
): Promise<SchoolRow> {
  const existing = await getSchoolByDomain(sql, domain);
  if (existing) return existing;
  try {
    return await createSchool(sql, {
      name: defaults.name,
      radioName: defaults.radioName,
      googleDomain: domain,
      coordinadorEmail: defaults.coordinadorEmail,
      createdBy: defaults.createdBy,
    });
  } catch (err) {
    // Dues sessions han arribat aquí alhora i totes dues han intentat crear-la: la que ha perdut la cursa la recupera.
    const race = await getSchoolByDomain(sql, domain);
    if (race) return race;
    throw err;
  }
}

export async function updateSchoolSettings(
  sql: Sql,
  id: number,
  data: { radioName: string; allowExternalSharing: boolean },
) {
  await ensureSchoolsSchema(sql);
  await sql.unsafe(`
    UPDATE schools
       SET radio_name = ${sqlText(data.radioName)}, allow_external_sharing = ${sqlBool(data.allowExternalSharing)}
     WHERE id = ${sqlInt(id)}
  `);
}

export async function listSchoolMembers(sql: Sql, schoolId: number): Promise<SchoolMemberRow[]> {
  const rows = await sql.unsafe(`
    SELECT p.auth_user_id, p.email, p.role, p.display_name, p.class_id, c.name AS class_name
      FROM profiles p
      LEFT JOIN classes c ON c.id = p.class_id
     WHERE p.school_id = ${sqlInt(schoolId)}
     ORDER BY CASE p.role WHEN 'coordinador' THEN 0 WHEN 'docent' THEN 1 ELSE 2 END, lower(p.email) ASC
  `);
  return rows as unknown as SchoolMemberRow[];
}

export async function listSchoolInvites(sql: Sql, schoolId: number): Promise<SchoolInviteRow[]> {
  const rows = await sql.unsafe(`
    SELECT i.id, i.school_id, i.email, i.role, i.class_id, c.name AS class_name, i.display_name, i.created_at
      FROM school_invites i
      LEFT JOIN classes c ON c.id = i.class_id
     WHERE i.school_id = ${sqlInt(schoolId)}
     ORDER BY CASE i.role WHEN 'coordinador' THEN 0 WHEN 'docent' THEN 1 ELSE 2 END, lower(i.email) ASC
  `);
  return rows as unknown as SchoolInviteRow[];
}

/** El coordinador dona permís de docent a algú del seu centre (ha d'haver iniciat sessió abans). */
export async function setMemberRole(
  sql: Sql,
  schoolId: number,
  email: string,
  role: "docent" | "alumne",
): Promise<boolean> {
  const rows = await sql.unsafe(`
    UPDATE profiles
       SET role = ${sqlText(role)}, school_id = ${sqlInt(schoolId)}
     WHERE lower(email) = ${sqlText(email.trim().toLowerCase())}
     RETURNING auth_user_id
  `);
  return rows.length > 0;
}

export type AssignOutcome = "updated" | "invited";

/**
 * Dona un rol (i, si cal, una classe) a un correu dins d'una escola. Si la
 * persona ja ha iniciat sessió, s'aplica al seu perfil ara mateix; si no,
 * queda com a invitació pendent que s'aplicarà el primer cop que entri.
 */
export async function assignRoleByEmail(
  sql: Sql,
  data: {
    schoolId: number;
    email: string;
    role: MemberRole;
    classId?: number | null;
    displayName?: string | null;
    createdBy: string;
  },
): Promise<AssignOutcome> {
  const email = data.email.trim().toLowerCase();
  const classId = data.classId ?? null;
  const displayName = data.displayName?.trim() || null;
  const [profile] = await sql.unsafe(
    `SELECT auth_user_id, display_name FROM profiles WHERE lower(email) = ${sqlText(email)} LIMIT 1`,
  );
  if (profile) {
    const userId = profile["auth_user_id"] as string;
    await sql.unsafe(`
      UPDATE profiles
         SET role = ${sqlText(data.role)},
             school_id = ${sqlInt(data.schoolId)}
             ${classId !== null ? `, class_id = ${sqlInt(classId)}` : ""}
             ${displayName && !profile["display_name"] ? `, display_name = ${sqlText(displayName)}` : ""}
       WHERE auth_user_id = ${sqlText(userId)}
    `);
    if (classId !== null) {
      await sql.unsafe(`
        INSERT INTO class_members (class_id, auth_user_id) VALUES (${sqlInt(classId)}, ${sqlText(userId)})
        ON CONFLICT DO NOTHING
      `);
    }
    // Si hi havia una invitació antiga per a aquest correu, ja no cal.
    await sql.unsafe(`DELETE FROM school_invites WHERE email = ${sqlText(email)}`);
    return "updated";
  }
  await sql.unsafe(`
    INSERT INTO school_invites (school_id, email, role, class_id, display_name, created_by)
    VALUES (${sqlInt(data.schoolId)}, ${sqlText(email)}, ${sqlText(data.role)}, ${sqlInt(classId)}, ${sqlText(displayName)}, ${sqlText(data.createdBy)})
    ON CONFLICT (email) DO UPDATE
       SET school_id = EXCLUDED.school_id,
           role = EXCLUDED.role,
           class_id = COALESCE(EXCLUDED.class_id, school_invites.class_id),
           display_name = COALESCE(EXCLUDED.display_name, school_invites.display_name),
           created_by = EXCLUDED.created_by
  `);
  return "invited";
}

/** Canvia el rol d'algú que ja és membre de l'escola. */
export async function updateMemberRole(sql: Sql, schoolId: number, userId: string, role: MemberRole): Promise<boolean> {
  const rows = await sql.unsafe(`
    UPDATE profiles SET role = ${sqlText(role)}
     WHERE auth_user_id = ${sqlText(userId)} AND school_id = ${sqlInt(schoolId)}
     RETURNING auth_user_id
  `);
  return rows.length > 0;
}

/**
 * Treu algú de l'escola: deixa de tenir escola, classe ni cap permís
 * (torna a ser alumne sense classe). No s'esborra el compte ni els pòdcasts.
 */
export async function removeMember(sql: Sql, schoolId: number, userId: string): Promise<boolean> {
  const rows = await sql.unsafe(`
    UPDATE profiles SET school_id = NULL, class_id = NULL, role = 'alumne'
     WHERE auth_user_id = ${sqlText(userId)} AND school_id = ${sqlInt(schoolId)}
     RETURNING auth_user_id
  `);
  if (rows.length === 0) return false;
  await sql.unsafe(`
    DELETE FROM class_members
     WHERE auth_user_id = ${sqlText(userId)}
       AND class_id IN (SELECT id FROM classes WHERE school_id = ${sqlInt(schoolId)})
  `);
  return true;
}

export async function deleteInvite(sql: Sql, schoolId: number, inviteId: number): Promise<boolean> {
  const rows = await sql.unsafe(
    `DELETE FROM school_invites WHERE id = ${sqlInt(inviteId)} AND school_id = ${sqlInt(schoolId)} RETURNING id`,
  );
  return rows.length > 0;
}

export async function updateSchool(
  sql: Sql,
  id: number,
  data: { name: string; radioName: string; googleDomain: string | null; coordinadorEmail: string | null },
) {
  await ensureSchoolsSchema(sql);
  const domain = data.googleDomain?.trim().toLowerCase() || null;
  if (domain) {
    const [clash] = await sql.unsafe(
      `SELECT id FROM schools WHERE lower(google_domain) = ${sqlText(domain)} AND id <> ${sqlInt(id)}`,
    );
    if (clash) throw new Error("DOMAIN_TAKEN");
  }
  await sql.unsafe(`
    UPDATE schools
       SET name = ${sqlText(data.name)},
           radio_name = ${sqlText(data.radioName)},
           google_domain = ${sqlText(domain)},
           coordinador_email = ${sqlText(data.coordinadorEmail?.trim().toLowerCase() || null)}
     WHERE id = ${sqlInt(id)}
  `);
}

/**
 * Esborra una escola. Les classes es queden (sense escola i sense compartir
 * al mur de l'escola) perquè els pòdcasts de l'alumnat no es perdin ni
 * passin a ser públics; el personal es queda com a docent sense escola i
 * l'alumnat com a alumne sense escola.
 */
export async function deleteSchool(sql: Sql, id: number) {
  await sql.unsafe(`DELETE FROM school_invites WHERE school_id = ${sqlInt(id)}`);
  await sql.unsafe(`
    UPDATE profiles
       SET school_id = NULL,
           role = CASE WHEN role = 'coordinador' THEN 'docent' ELSE role END
     WHERE school_id = ${sqlInt(id)}
  `);
  await sql.unsafe(`UPDATE classes SET school_id = NULL, share_to_school = FALSE WHERE school_id = ${sqlInt(id)}`);
  await sql.unsafe(`DELETE FROM schools WHERE id = ${sqlInt(id)}`);
}

export interface ImportRow {
  name: string;
  email: string;
  role: string;
  course: string;
  classroom: string;
}

export interface ImportResult {
  updated: number;
  invited: number;
  classesCreated: string[];
  errors: { row: number; email: string; reason: "email" | "role" }[];
}

/**
 * Importació massiva (full de càlcul): nom, correu, rol, curs, aula. Curs +
 * aula formen el nom de la classe ("1r ESO A"), que es crea si no existeix.
 */
export async function importMembers(
  sql: Sql,
  schoolId: number,
  rows: ImportRow[],
  createdBy: string,
): Promise<ImportResult> {
  const { findOrCreateClassByName, listClassesBySchool } = await import("./classes.server");
  const before = new Set((await listClassesBySchool(sql, schoolId)).map((c) => c.id));
  const result: ImportResult = { updated: 0, invited: 0, classesCreated: [], errors: [] };
  const classCache = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const email = row.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      result.errors.push({ row: i + 1, email: row.email, reason: "email" });
      continue;
    }
    const role = normalizeRole(row.role);
    if (!role) {
      result.errors.push({ row: i + 1, email, reason: "role" });
      continue;
    }
    const className = `${row.course.trim()} ${row.classroom.trim()}`.trim();
    let classId: number | null = null;
    if (className && role === "alumne") {
      const key = className.toLowerCase();
      let id = classCache.get(key);
      if (id === undefined) {
        const cls = await findOrCreateClassByName(sql, schoolId, className, createdBy);
        id = cls.id;
        classCache.set(key, id);
        if (!before.has(id)) result.classesCreated.push(cls.name);
      }
      classId = id;
    }
    const outcome = await assignRoleByEmail(sql, {
      schoolId,
      email,
      role,
      classId,
      displayName: row.name,
      createdBy,
    });
    if (outcome === "updated") result.updated++;
    else result.invited++;
  }
  return result;
}

/** Accepta el rol escrit en català, castellà o anglès; buit vol dir alumne. */
export function normalizeRole(value: string): MemberRole | null {
  const v = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!v) return "alumne";
  if (["alumne", "alumna", "alumno", "alumnat", "estudiant", "estudiante", "student", "pupil"].includes(v)) return "alumne";
  if (
    ["docent", "docente", "mestre", "mestra", "maestro", "maestra", "professor", "professora", "profesor", "profesora", "teacher", "prof"].includes(v)
  ) {
    return "docent";
  }
  if (["coordinador", "coordinadora", "coordinator", "coord"].includes(v)) return "coordinador";
  return null;
}
