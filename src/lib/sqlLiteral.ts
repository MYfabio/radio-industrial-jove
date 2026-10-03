/**
 * Incrusta valors com a literals SQL ja escapats, en lloc de fer-los servir
 * com a paràmetres ($1, $2...). Railway connecta a través d'un pooler que
 * no permet a Postgres determinar el tipus dels paràmetres ("could not
 * determine data type of parameter", SQLSTATE 42P18) — amb un literal
 * incrustat no hi ha cap paràmetre que hagi d'inferir, així que el
 * problema desapareix. Fes-lo servir sempre amb `sql.unsafe(text)` SENSE
 * passar-hi cap array de paràmetres, perquè postgres.js faci servir el
 * protocol "simple" (sense parse/bind).
 */
export function sqlText(value: string | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value !== "string") throw new Error("Valor de text invàlid per a una consulta SQL.");
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlInt(value: number | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (!Number.isFinite(value)) throw new Error("Valor numèric invàlid per a una consulta SQL.");
  return String(Math.trunc(value));
}

export function sqlBool(value: boolean): string {
  return value ? "TRUE" : "FALSE";
}

export function sqlTextArray(values: string[] | null | undefined): string {
  if (values === null || values === undefined) return "'{}'::text[]";
  // Les dades venen del client: cal comprovar que de veritat és una llista de textos.
  if (!Array.isArray(values) || values.some((v) => typeof v !== "string")) {
    throw new Error("Llista de textos invàlida per a una consulta SQL.");
  }
  if (values.length === 0) return "'{}'::text[]";
  const items = values.map((v) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",");
  // El literal d'array va dins de cometes simples: també s'han de doblar, o s'hi pot injectar SQL.
  return `'{${items.replace(/'/g, "''")}}'::text[]`;
}

export function sqlBytea(value: Buffer | Uint8Array | null | undefined): string {
  if (!value) return "NULL";
  return `'\\x${Buffer.from(value).toString("hex")}'::bytea`;
}
