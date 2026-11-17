/**
 * Sol·licituds d'accés: algú que encara no és docent/coordinador demana
 * permís de docent o vol donar d'alta el seu centre. Es desen aquí perquè
 * el super admin les revisi des del seu panell — sense dependre de cap
 * enviament de correu.
 */
import type { Sql } from "./podcasts.server";
import { sqlText, sqlBool, sqlInt } from "./sqlLiteral";

export type AccessRequestKind = "docent" | "escola";

export interface AccessRequestRow {
  id: number;
  kind: AccessRequestKind;
  name: string;
  email: string;
  school_name: string | null;
  domain: string | null;
  message: string | null;
  resolved: boolean;
  created_at: string;
}

const COLUMNS = `id, kind, name, email, school_name, domain, message, resolved, created_at`;

export async function ensureAccessRequestsSchema(sql: Sql) {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS access_requests (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      school_name TEXT,
      domain TEXT,
      message TEXT,
      resolved BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function createAccessRequest(
  sql: Sql,
  data: {
    kind: AccessRequestKind;
    name: string;
    email: string;
    schoolName: string | null;
    domain: string | null;
    message: string | null;
  },
): Promise<AccessRequestRow> {
  await ensureAccessRequestsSchema(sql);
  const [row] = await sql.unsafe(`
    INSERT INTO access_requests (kind, name, email, school_name, domain, message)
    VALUES (${sqlText(data.kind)}, ${sqlText(data.name)}, ${sqlText(data.email)}, ${sqlText(data.schoolName)}, ${sqlText(data.domain)}, ${sqlText(data.message)})
    RETURNING ${COLUMNS}
  `);
  return row as unknown as AccessRequestRow;
}

export async function listAccessRequests(
  sql: Sql,
): Promise<AccessRequestRow[]> {
  await ensureAccessRequestsSchema(sql);
  const rows = await sql.unsafe(`
    SELECT ${COLUMNS} FROM access_requests
     ORDER BY resolved ASC, created_at DESC
     LIMIT 200
  `);
  return rows as unknown as AccessRequestRow[];
}

export async function setAccessRequestResolved(
  sql: Sql,
  id: number,
  resolved: boolean,
) {
  await ensureAccessRequestsSchema(sql);
  await sql.unsafe(
    `UPDATE access_requests SET resolved = ${sqlBool(resolved)} WHERE id = ${sqlInt(id)}`,
  );
}

export interface AccessGrant {
  email: string;
  name: string;
  /** Rol que té ara (o que tindrà quan entri, si és una invitació). */
  role: string | null;
  schoolName: string | null;
}

/**
 * Qui ha fet la sol·licitud i quin accés té de debò: el perfil si ja ha entrat
 * o, si no, la invitació pendent. Serveix per no avisar «ja tens accés» a qui
 * encara no en té.
 */
export async function getAccessGrant(
  sql: Sql,
  id: number,
): Promise<AccessGrant | null> {
  await ensureAccessRequestsSchema(sql);
  const [req] = await sql.unsafe(
    `SELECT email, name FROM access_requests WHERE id = ${sqlInt(id)}`,
  );
  if (!req) return null;
  const email = String(req["email"] ?? "")
    .trim()
    .toLowerCase();
  const name = String(req["name"] ?? "");
  const [row] = await sql.unsafe(`
    SELECT role, school_name FROM (
      SELECT p.role, s.name AS school_name, 0 AS ord
        FROM profiles p LEFT JOIN schools s ON s.id = p.school_id
       WHERE lower(p.email) = ${sqlText(email)}
      UNION ALL
      SELECT i.role, s.name AS school_name, 1 AS ord
        FROM school_invites i LEFT JOIN schools s ON s.id = i.school_id
       WHERE i.email = ${sqlText(email)}
    ) t
    ORDER BY ord
    LIMIT 1
  `);
  return {
    email,
    name,
    role: row ? ((row["role"] as string | null) ?? null) : null,
    schoolName: row ? ((row["school_name"] as string | null) ?? null) : null,
  };
}
