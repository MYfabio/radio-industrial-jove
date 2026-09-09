-- Comptador d'escoltes dels pòdcasts, per a les gràfiques dels panells de
-- coordinador i super admin. (La base de dades real és Railway Postgres; el
-- codi crea la taula sol amb CREATE TABLE IF NOT EXISTS des de
-- src/lib/plays.server.ts. Aquest fitxer documenta el canvi d'esquema.)
--
-- Només s'hi desa un recompte agregat per pòdcast i dia: cap identificador de
-- qui escolta, cap IP, cap hora exacta. Qui escolta el mur és alumnat menor
-- d'edat, així que el panell pot dir "aquest pòdcast s'ha escoltat 12 vegades"
-- i mai "aquest alumne ha escoltat aquest pòdcast".
CREATE TABLE IF NOT EXISTS podcast_plays (
  podcast_id INTEGER NOT NULL,
  day DATE NOT NULL,
  plays INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (podcast_id, day)
);
