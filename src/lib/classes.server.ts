/**
 * Classes amb codi d'invitació. Cada alumne pertany, com a màxim, a una
 * classe (profiles.class_id); un docent pot crear-ne diverses. Si el docent
 * pertany a una escola, la classe queda vinculada a aquesta escola i pot
 * triar compartir els seus pòdcasts al mur de l'escola.
 */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlInt, sqlBool } from "./sqlLiteral";

export interface ClassRow {
  id: number;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  school_id: number | null;
  share_to_school: boolean;
}

const CLASS_COLUMNS = `id, name, invite_code, created_by, created_at, school_id, share_to_school`;

export async function ensureClassesSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT NOT NULL UNIQUE,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await sql.unsafe(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id)`);
  await sql.unsafe(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS school_id INTEGER`);
  await sql.unsafe(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS share_to_school BOOLEAN NOT NULL DEFAULT FALSE`);
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sense lletres/números que es confonen

function randomCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export async function createClass(
  sql: Sql,
  ownerId: string,
  name: string,
  schoolId: number | null,
  shareToSchool: boolean,
): Promise<ClassRow> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      const [row] = await sql.unsafe(`
        INSERT INTO classes (name, invite_code, created_by, school_id, share_to_school)
        VALUES (${sqlText(name)}, ${sqlText(code)}, ${sqlText(ownerId)}, ${sqlInt(schoolId)}, ${sqlBool(schoolId !== null && shareToSchool)})
        RETURNING ${CLASS_COLUMNS}
      `);
      return row as unknown as ClassRow;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("invite_code")) throw err;
      // Codi duplicat (molt poc probable): torna-ho a provar amb un altre.
    }
  }
  throw new Error("No s'ha pogut generar un codi d'invitació únic. Torna-ho a provar.");
}

export async function listClassesByOwner(sql: Sql, ownerId: string): Promise<ClassRow[]> {
  const rows = await sql.unsafe(`
    SELECT ${CLASS_COLUMNS}
      FROM classes
     WHERE created_by = ${sqlText(ownerId)}
     ORDER BY created_at DESC
  `);
  return rows as unknown as ClassRow[];
}

export async function listClassesBySchool(sql: Sql, schoolId: number): Promise<ClassRow[]> {
  const rows = await sql.unsafe(`
    SELECT ${CLASS_COLUMNS}
      FROM classes
     WHERE school_id = ${sqlInt(schoolId)}
     ORDER BY created_at DESC
  `);
  return rows as unknown as ClassRow[];
}

export async function joinClassByCode(sql: Sql, userId: string, code: string): Promise<ClassRow | null> {
  const [cls] = await sql.unsafe(`
    SELECT ${CLASS_COLUMNS}
      FROM classes
     WHERE invite_code = ${sqlText(code.trim().toUpperCase())}
  `);
  if (!cls) return null;
  await sql.unsafe(
    `UPDATE profiles SET class_id = ${sqlInt((cls as unknown as ClassRow).id)} WHERE auth_user_id = ${sqlText(userId)}`,
  );
  return cls as unknown as ClassRow;
}

export async function getClassById(sql: Sql, id: number): Promise<ClassRow | null> {
  const [row] = await sql.unsafe(`SELECT ${CLASS_COLUMNS} FROM classes WHERE id = ${sqlInt(id)}`);
  return (row as unknown as ClassRow) ?? null;
}

export async function getClassByInviteCode(sql: Sql, code: string): Promise<ClassRow | null> {
  const [row] = await sql.unsafe(
    `SELECT ${CLASS_COLUMNS} FROM classes WHERE invite_code = ${sqlText(code.trim().toUpperCase())}`,
  );
  return (row as unknown as ClassRow) ?? null;
}
