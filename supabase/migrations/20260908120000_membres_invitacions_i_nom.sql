-- Gestió de membres per centre, subgrups i importació massiva.
-- (La base de dades real és Railway Postgres; el codi crea aquestes taules
-- sol amb CREATE TABLE IF NOT EXISTS des de src/lib/settings.server.ts.
-- Aquest fitxer documenta el canvi d'esquema.)

-- Nom visible de la persona (arriba de la importació Excel o de la invitació).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Un alumne pot ser membre de més d'una classe (la seva i subgrups d'un docent).
-- profiles.class_id continua sent la classe activa (on van els pòdcasts que publica).
CREATE TABLE IF NOT EXISTS class_members (
  class_id INTEGER NOT NULL,
  auth_user_id TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (class_id, auth_user_id)
);

-- Persones donades d'alta (coordinador des del panell, super admin o importació
-- Excel) abans que hagin iniciat sessió mai. En entrar per primer cop amb aquest
-- correu se'ls aplica escola, rol i classe, i la fila s'esborra.
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
