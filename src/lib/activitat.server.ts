/**
 * Informe d'activitat cap a aulaia.cat (docs/informe-activitat.md d'aulaia-cat):
 * cada hora, quanta gent ha fet alguna cosa a Ràdio Escolar, per domini del
 * centre (o del correu). Les xifres surten de la base de pòdcasts de Railway:
 * esborranys, preferits, classes i membres de classe. Només recomptes: cap nom
 * ni correu. Sense AULAIA_ACTIVITAT_CLAU no fa res.
 * La connexió no admet paràmetres (pooler): els instants van com a literals ISO.
 */
import { getSql, type Sql } from "./podcasts.server";
import { construirDominis, dominiCentre, hiHaActivitat, horesTancades, type Domini, type FilaActius } from "./activitatXifres";

const URL_INFORME = process.env["AULAIA_ACTIVITAT_URL"] || "https://www.aulaia.cat/api/activitat";
const HORA_MS = 3_600_000;

/** Les 0:00 de Catalunya del dia de `inici`. */
export function iniciDia(inici: Date): Date {
  const local = new Date(inici.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const desfasament = local.getTime() - inici.getTime();
  local.setHours(0, 0, 0, 0);
  return new Date(local.getTime() - desfasament);
}

const lit = (d: Date) => `'${d.toISOString()}'::timestamptz`;

export function consultaActius(inici: Date): string {
  const h = lit(inici), d = lit(iniciDia(inici)), f = lit(new Date(inici.getTime() + HORA_MS));
  return `
    WITH accions AS (
      SELECT owner_user_id AS qui, updated_at AS quan FROM drafts WHERE updated_at >= ${d} AND updated_at < ${f}
      UNION ALL SELECT auth_user_id, created_at FROM favorites WHERE created_at >= ${d} AND created_at < ${f}
      UNION ALL SELECT auth_user_id, joined_at FROM class_members WHERE joined_at >= ${d} AND joined_at < ${f}
      UNION ALL SELECT created_by, created_at FROM classes WHERE created_at >= ${d} AND created_at < ${f}
    )
    SELECT coalesce(lower(s.google_domain), p.email) AS domini_o_correu,
           (count(DISTINCT a.qui) FILTER (WHERE a.quan >= ${h}))::int AS hora,
           count(DISTINCT a.qui)::int AS dia
    FROM accions a LEFT JOIN profiles p ON p.auth_user_id = a.qui LEFT JOIN schools s ON s.id = p.school_id
    GROUP BY 1`;
}

export async function xifresDeLHora(sql: Sql, inici: Date): Promise<Domini[]> {
  const files = (await sql.unsafe(consultaActius(inici))) as unknown as { domini_o_correu: string | null; hora: number; dia: number }[];
  const perDomini = new Map<string, FilaActius>();
  for (const r of files) {
    const v = String(r.domini_o_correu ?? "");
    const domini = dominiCentre(v.includes("@") ? v : `x@${v}`);
    const f = perDomini.get(domini) ?? { domini, actiusHora: 0, actiusDia: 0 };
    f.actiusHora += Number(r.hora);
    f.actiusDia += Number(r.dia);
    perDomini.set(domini, f);
  }
  return construirDominis([...perDomini.values()], []);
}

/** `inici`: inici d'una hora ja tancada. No llança mai. */
export async function enviarInformeActivitat(inici: Date): Promise<string> {
  const clau = process.env["AULAIA_ACTIVITAT_CLAU"];
  if (!clau) return "sense-clau";
  const sql = getSql();
  try {
    const dominis = await xifresDeLHora(sql, inici);
    if (!hiHaActivitat(dominis)) return "sense-activitat";
    const r = await fetch(URL_INFORME, {
      method: "POST",
      headers: { Authorization: `Bearer ${clau}`, "Content-Type": "application/json" },
      body: JSON.stringify({ versio: 1, app: "radio-escolar", hora: inici.toISOString(), dominis }),
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) console.warn("Informe d'activitat rebutjat:", r.status);
    return r.ok ? "enviat" : "rebutjat";
  } catch (e) {
    console.warn("Informe d'activitat no enviat:", e instanceof Error ? e.name : "error");
    return "error";
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

let engegat = false;

/** Cada 10 minuts mira les 3 darreres hores tancades. Reenviar una hora la substitueix. */
export function iniciarInformeActivitat(): void {
  if (engegat || !process.env["AULAIA_ACTIVITAT_CLAU"]) return;
  engegat = true;
  const fetes = new Set<number>();
  const tic = async () => {
    for (const hora of horesTancades(new Date(), 3)) {
      if (fetes.has(hora.getTime())) continue;
      if ((await enviarInformeActivitat(hora)) !== "error") fetes.add(hora.getTime());
    }
    for (const t of fetes) if (Date.now() - t > 6 * HORA_MS) fetes.delete(t);
  };
  setTimeout(() => void tic(), 60_000).unref?.();
  setInterval(() => void tic(), 10 * 60_000).unref?.();
}
