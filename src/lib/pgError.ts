/**
 * Embolcalla un error de Postgres (postgres.js) amb tots els detalls
 * disponibles (codi SQLSTATE, detall, pista, rutina) perquè es puguin veure
 * a la interfície mentre diagnostiquem un problema, en lloc del missatge
 * genèric sol.
 */
export function describePgError(err: unknown): string {
  if (err && typeof err === "object" && (err as { name?: string }).name === "PostgresError") {
    const e = err as {
      message: string;
      code?: string;
      detail?: string;
      hint?: string;
      routine?: string;
      table_name?: string;
      column_name?: string;
    };
    const parts = [e.message];
    if (e.code) parts.push(`codi=${e.code}`);
    if (e.detail) parts.push(`detall=${e.detail}`);
    if (e.hint) parts.push(`pista=${e.hint}`);
    if (e.routine) parts.push(`rutina=${e.routine}`);
    if (e.table_name) parts.push(`taula=${e.table_name}`);
    if (e.column_name) parts.push(`columna=${e.column_name}`);
    return parts.join(" | ");
  }
  return err instanceof Error ? err.message : String(err);
}
