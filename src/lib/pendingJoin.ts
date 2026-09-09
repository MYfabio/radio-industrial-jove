/**
 * Quan un alumne obre l'enllaç d'una classe sense haver iniciat sessió,
 * recordem el codi abans d'enviar-lo a Google; en tornar, l'AuthProvider
 * el porta a /uneix/$code perquè s'hi afegeixi. Així no cal que la URL de
 * retorn de Google tingui cap camí especial (només l'origen).
 */
const KEY = "radio-pending-join";

export function setPendingJoin(code: string) {
  try {
    window.localStorage.setItem(KEY, code.trim().toUpperCase());
  } catch {
    // Sense localStorage l'alumne haurà de tornar a obrir l'enllaç: no passa res.
  }
}

/** Retorna el codi pendent (si n'hi ha) i l'esborra. */
export function takePendingJoin(): string | null {
  try {
    const code = window.localStorage.getItem(KEY);
    if (code) window.localStorage.removeItem(KEY);
    return code;
  } catch {
    return null;
  }
}
