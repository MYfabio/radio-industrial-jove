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
  throw new Error("CODE_UNIQUE");
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
  await addMember(sql, (cls as unknown as ClassRow).id, userId);
  return cls as unknown as ClassRow;
}

/** Afegeix l'alumne a la classe (pot ser de diverses) i la deixa com a classe activa. */
export async function addMember(sql: Sql, classId: number, userId: string) {
  await sql.unsafe(`
    INSERT INTO class_members (class_id, auth_user_id)
    VALUES (${sqlInt(classId)}, ${sqlText(userId)})
    ON CONFLICT DO NOTHING
  `);
  await sql.unsafe(`UPDATE profiles SET class_id = ${sqlInt(classId)} WHERE auth_user_id = ${sqlText(userId)}`);
}

/** Totes les classes de què és membre aquest usuari (la seva classe i els subgrups). */
export async function listMembershipsForUser(sql: Sql, userId: string): Promise<ClassRow[]> {
  const rows = await sql.unsafe(`
    SELECT ${CLASS_COLUMNS.split(", ").map((c) => `c.${c}`).join(", ")}
      FROM classes c
      JOIN class_members m ON m.class_id = c.id
     WHERE m.auth_user_id = ${sqlText(userId)}
     UNION
    SELECT ${CLASS_COLUMNS.split(", ").map((c) => `c.${c}`).join(", ")}
      FROM classes c
      JOIN profiles p ON p.class_id = c.id
     WHERE p.auth_user_id = ${sqlText(userId)}
     ORDER BY created_at DESC
  `);
  return rows as unknown as ClassRow[];
}

/** Tria quina de les seves classes és l'activa (on van els pòdcasts que publiqui). */
export async function setActiveClass(sql: Sql, userId: string, classId: number): Promise<boolean> {
  const [member] = await sql.unsafe(`
    SELECT 1 FROM class_members WHERE class_id = ${sqlInt(classId)} AND auth_user_id = ${sqlText(userId)}
    UNION SELECT 1 FROM profiles WHERE class_id = ${sqlInt(classId)} AND auth_user_id = ${sqlText(userId)}
  `);
  if (!member) return false;
  await sql.unsafe(`UPDATE profiles SET class_id = ${sqlInt(classId)} WHERE auth_user_id = ${sqlText(userId)}`);
  return true;
}

/** Nombre de pòdcasts vinculats a una classe (per no esborrar-ne cap que en tingui). */
export async function countPodcastsForClass(sql: Sql, classId: number): Promise<number> {
  const [row] = await sql.unsafe(`SELECT COUNT(*)::int AS n FROM podcasts WHERE class_id = ${sqlInt(classId)}`);
  return (row?.["n"] as number) ?? 0;
}

/** Esborra una classe buida i en desvincula l'alumnat. */
export async function deleteClass(sql: Sql, classId: number) {
  await sql.unsafe(`UPDATE profiles SET class_id = NULL WHERE class_id = ${sqlInt(classId)}`);
  await sql.unsafe(`DELETE FROM class_members WHERE class_id = ${sqlInt(classId)}`);
  await sql.unsafe(`UPDATE school_invites SET class_id = NULL WHERE class_id = ${sqlInt(classId)}`);
  await sql.unsafe(`DELETE FROM classes WHERE id = ${sqlInt(classId)}`);
}

/** Troba (o crea, en nom del coordinador) la classe d'una escola amb aquest nom: per a la importació. */
export async function findOrCreateClassByName(
  sql: Sql,
  schoolId: number,
  name: string,
  ownerId: string,
): Promise<ClassRow> {
  const [existing] = await sql.unsafe(`
    SELECT ${CLASS_COLUMNS} FROM classes
     WHERE school_id = ${sqlInt(schoolId)} AND lower(name) = ${sqlText(name.toLowerCase())}
     ORDER BY created_at ASC LIMIT 1
  `);
  if (existing) return existing as unknown as ClassRow;
  return createClass(sql, ownerId, name, schoolId, false);
}

export async function countMembersByClass(sql: Sql, schoolId: number): Promise<Record<number, number>> {
  const rows = await sql.unsafe(`
    SELECT c.id, COUNT(DISTINCT u.auth_user_id)::int AS n
      FROM classes c
      LEFT JOIN (
        SELECT class_id, auth_user_id FROM class_members
        UNION
        SELECT class_id, auth_user_id FROM profiles WHERE class_id IS NOT NULL
      ) u ON u.class_id = c.id
     WHERE c.school_id = ${sqlInt(schoolId)}
     GROUP BY c.id
  `);
  const out: Record<number, number> = {};
  for (const r of rows) out[r["id"] as number] = r["n"] as number;
  return out;
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
