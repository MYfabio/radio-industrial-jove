/**
 * Correu d'identitat pel servei central d'aulaia.cat (POST /api/correu).
 *
 * Per què no Resend directe: radioescolar.cat no està verificat a Resend i
 * aulaia.cat sí; el servei central envia en nom de totes les apps amb
 * plantilles tancades (no hi ha assumpte ni cos lliures).
 *
 * Només s'ha de cridar des del servidor: la clau (CORREU_API_KEY) no pot
 * arribar mai al navegador. Mai llança: retorna { sent, error } perquè un
 * error de correu no trenqui el que l'ha provocat. No es registra ni el cos
 * ni el destinatari.
 */

const ENDPOINT = "https://www.aulaia.cat/api/correu";
/** Slug de l'app al catàleg d'aulaia.cat. */
const APP_SLUG = "radio-escolar";

export type CorreuError =
  | "sense-clau"
  | "no-autoritzat"
  | "dades"
  | "massa-enviaments"
  | "proveidor"
  | "servei-tancat"
  | "xarxa";

export interface CorreuResult {
  sent: boolean;
  error?: CorreuError;
}

export function correuEnabled() {
  return !!process.env["CORREU_API_KEY"];
}

async function enviar(
  tipus: string,
  per: string,
  dades: Record<string, string>,
): Promise<CorreuResult> {
  const key = process.env["CORREU_API_KEY"];
  if (!key) {
    console.warn(
      `Correu central: no s'ha enviat «${tipus}» (falta CORREU_API_KEY).`,
    );
    return { sent: false, error: "sense-clau" };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-correu-key": key },
      body: JSON.stringify({ tipus, per, app: APP_SLUG, dades }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { sent: true };
    const error: CorreuError =
      res.status === 401
        ? "no-autoritzat"
        : res.status === 400
          ? "dades"
          : res.status === 429
            ? "massa-enviaments"
            : res.status === 502
              ? "proveidor"
              : "servei-tancat";
    console.warn(`Correu central: «${tipus}» ha tornat ${res.status}.`);
    return { sent: false, error };
  } catch {
    console.warn(`Correu central: «${tipus}» no ha arribat al servei.`);
    return { sent: false, error: "xarxa" };
  }
}

/** Avisa un docent que ja té accés a la ràdio. */
export function enviaAccesConcedit(data: {
  per: string;
  nom: string | null;
  centre: string | null;
  idioma: "ca" | "es";
}) {
  return enviar("acces-concedit", data.per, {
    nom: data.nom ?? "",
    centre: data.centre ?? "",
    idioma: data.idioma,
  });
}
