/**
 * Classes amb codi d'invitació. Cada alumne pertany, com a màxim, a una
 * classe (profiles.class_id); un docent pot crear-ne diverses.
 */
import type { Sql } from "./podcasts.server";

export interface ClassRow {
  id: number;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export async function ensureClassesSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT NOT NULL UNIQUE,
      created_by TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id)`;
}

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sense lletres/números que es confonen

function randomCode(length = 6): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
}

export async function createClass(sql: Sql, ownerId: string, name: string): Promise<ClassRow> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    try {
      const [row] = await sql`
        INSERT INTO classes (name, invite_code, created_by)
        VALUES (${name}::text, ${code}::text, ${ownerId}::text)
        RETURNING id, name, invite_code, created_by, created_at
      `;
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
  const rows = await sql`
    SELECT id, name, invite_code, created_by, created_at
      FROM classes
     WHERE created_by = ${ownerId}::text
     ORDER BY created_at DESC
  `;
  return rows as unknown as ClassRow[];
}

export async function joinClassByCode(sql: Sql, userId: string, code: string): Promise<ClassRow | null> {
  const [cls] = await sql`
    SELECT id, name, invite_code, created_by, created_at
      FROM classes
     WHERE invite_code = ${code.trim().toUpperCase()}::text
  `;
  if (!cls) return null;
  await sql`UPDATE profiles SET class_id = ${(cls as unknown as ClassRow).id}::int WHERE auth_user_id = ${userId}::text`;
  return cls as unknown as ClassRow;
}

export async function getClassById(sql: Sql, id: number): Promise<ClassRow | null> {
  const [row] = await sql`SELECT id, name, invite_code, created_by, created_at FROM classes WHERE id = ${id}::int`;
  return (row as unknown as ClassRow) ?? null;
}
