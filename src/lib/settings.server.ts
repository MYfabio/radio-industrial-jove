/**
 * Configuració del centre (rols i permís de compartir fora de l'escola),
 * desada a Railway Postgres igual que els pòdcasts.
 */
import type { Sql } from "./podcasts.server";

export type Role = "alumne" | "docent" | "coordinador";

/** Primer usuari que entra amb aquest email es converteix en coordinador automàticament. */
const SEED_COORDINADOR_EMAIL = "fabio.martinez@escolaindustrial.org";
const DEFAULT_ALLOWED_DOMAIN = "escolaindustrial.org";

export interface SiteSettingsRow {
  allow_external_sharing: boolean;
  allowed_email_domain: string;
}

export interface ProfileRow {
  auth_user_id: string;
  email: string;
  role: Role;
  class_id: number | null;
}

export async function ensureSettingsSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SMALLINT PRIMARY KEY DEFAULT 1,
      allow_external_sharing BOOLEAN NOT NULL DEFAULT FALSE,
      allowed_email_domain TEXT NOT NULL DEFAULT ${DEFAULT_ALLOWED_DOMAIN}::text
    );
  `;
  await sql`
    INSERT INTO site_settings (id, allow_external_sharing, allowed_email_domain)
    VALUES (1, FALSE, ${DEFAULT_ALLOWED_DOMAIN}::text)
    ON CONFLICT (id) DO NOTHING;
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      auth_user_id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'alumne',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function getSettings(sql: Sql): Promise<SiteSettingsRow> {
  const [row] = await sql`SELECT allow_external_sharing, allowed_email_domain FROM site_settings WHERE id = 1`;
  return row as unknown as SiteSettingsRow;
}

export async function updateSettings(
  sql: Sql,
  data: { allowExternalSharing: boolean; allowedEmailDomain: string },
) {
  await sql`
    UPDATE site_settings
       SET allow_external_sharing = ${data.allowExternalSharing}::boolean,
           allowed_email_domain = ${data.allowedEmailDomain}::text
     WHERE id = 1
  `;
}

export async function getOrCreateProfile(sql: Sql, userId: string, email: string): Promise<ProfileRow> {
  const [existing] = await sql`
    SELECT auth_user_id, email, role, class_id FROM profiles WHERE auth_user_id = ${userId}::text
  `;
  if (existing) return existing as unknown as ProfileRow;

  const role: Role = email.toLowerCase() === SEED_COORDINADOR_EMAIL ? "coordinador" : "alumne";
  const [created] = await sql`
    INSERT INTO profiles (auth_user_id, email, role)
    VALUES (${userId}::text, ${email}::text, ${role}::text)
    ON CONFLICT (auth_user_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING auth_user_id, email, role, class_id
  `;
  return created as unknown as ProfileRow;
}
