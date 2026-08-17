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
    if (existing) throw new Error("Ja hi ha una escola donada d'alta amb aquest domini.");
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
    SELECT auth_user_id, email, role FROM profiles
     WHERE school_id = ${sqlInt(schoolId)}
     ORDER BY role DESC, email ASC
  `);
  return rows as unknown as SchoolMemberRow[];
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
