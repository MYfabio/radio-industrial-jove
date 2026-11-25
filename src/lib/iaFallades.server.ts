import { enviarAvis } from "./avisos";

/**
 * Fallades de la IA (Gemini): quin tipus de problema és i l'avís a n8n
 * (contracte comú d'aulaia.cat, tipus «error» amb { on: "ia" }). Si es
 * repeteix, aulaia.cat envia un correu. Mai hi va l'àudio, la transcripció,
 * cap nom ni el missatge sencer de l'error: només el motiu i el model.
 */
export type MotiuFallada = "cupo-dia" | "cupo-minut" | "model" | "temps" | "buida" | "format" | "servei";

/** 429 de Gemini: si s'ha acabat la quota del dia, cal esperar a demà. */
export function motiuDeResposta(status: number, cos: string): MotiuFallada {
  if (status === 429) return /per ?day|perday|daily/i.test(cos) ? "cupo-dia" : "cupo-minut";
  if (status === 404) return "model";
  if (status === 408 || status === 504) return "temps";
  return "servei";
}

export function motiuDeExcepcio(e: unknown): MotiuFallada {
  const nom = e instanceof Error ? e.name : "";
  return nom === "TimeoutError" || nom === "AbortError" ? "temps" : "servei";
}

const darrer = new Map<MotiuFallada, number>();

export function calAvisar(motiu: MotiuFallada, ara = Date.now()): boolean {
  if (ara - (darrer.get(motiu) ?? 0) < 60_000) return false;
  darrer.set(motiu, ara);
  return true;
}

/** No llança mai ni fa esperar ningú: l'avís surt en segon pla. Un per motiu i minut. */
export function avisarFallada(motiu: MotiuFallada, model: string | null): void {
  if (!calAvisar(motiu)) return;
  void enviarAvis({ tipus: "error", centre: null, datos: { on: "ia", motiu, proveidor: "gemini", model } }).catch(() => false);
}

/**
 * Límit per connexió: l'edició amb IA no demana sessió (el plató es pot fer
 * servir sense entrar), així que sense això algú podria gastar tota la quota.
 * Memòria del procés: es buida en reiniciar, i n'hi ha prou per frenar abusos.
 */
const usos = new Map<string, number[]>();
export const MAX_PER_HORA = Number(process.env["AI_EDIT_MAX_PER_HOUR"]) || 20;

export function dinsDelLimit(clau: string, ara = Date.now()): boolean {
  const recents = (usos.get(clau) ?? []).filter((t) => ara - t < 3_600_000);
  if (recents.length >= MAX_PER_HORA) {
    usos.set(clau, recents);
    return false;
  }
  recents.push(ara);
  usos.set(clau, recents);
  if (usos.size > 5000) for (const [k, v] of usos) if (!v.some((t) => ara - t < 3_600_000)) usos.delete(k);
  return true;
}
