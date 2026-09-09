/**
 * Compta una escolta quan algú posa un pòdcast del mur.
 *
 * Només una vegada per pòdcast i sessió del navegador: si l'alumne para i
 * torna a donar-li al play, o se'l torna a escoltar, no infla el comptador.
 * Si el servidor falla, no passa res: el pòdcast se segueix escoltant igual.
 */
import { registerPlayFn } from "./plays.functions";

const KEY = "radio-escoltes";

function alreadyCounted(id: number): boolean {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const ids: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(ids) || !ids.includes(id)) {
      window.sessionStorage.setItem(
        KEY,
        JSON.stringify([...(Array.isArray(ids) ? ids : []), id]),
      );
      return false;
    }
    return true;
  } catch {
    // Sense sessionStorage comptem l'escolta igualment (com a molt, dues vegades).
    return false;
  }
}

export function trackPlay(id: number): void {
  if (typeof window === "undefined" || alreadyCounted(id)) return;
  void registerPlayFn({ data: { id } }).catch(() => {
    // Un comptador no pot trencar la reproducció.
  });
}
