/**
 * Internacionalització mínima (català, castellà, anglès) sense dependències.
 *
 * Cada pantalla defineix el seu propi diccionari amb `defineMessages` (les
 * tres traduccions de cada text viuen juntes) i el consumeix amb `useT(m)`:
 *
 *   const m = defineMessages({ hello: { ca: "Hola {name}", es: "Hola {name}", en: "Hi {name}" } });
 *   const t = useT(m);  t("hello", { name })
 *
 * La llengua es desa a localStorage i a una galeta (`radio-lang`) perquè el
 * servidor la pugui llegir (missatges d'error de les funcions de servidor) i
 * perquè el primer render SSR ja surti en la llengua triada.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type Lang = "ca" | "es" | "en";
export const LANGS: readonly Lang[] = ["ca", "es", "en"] as const;
export const DEFAULT_LANG: Lang = "ca";
export const LANG_COOKIE = "radio-lang";
const STORAGE_KEY = "radio-lang";

export const LANG_LABELS: Record<Lang, string> = {
  ca: "Català",
  es: "Castellano",
  en: "English",
};

export type Message = { ca: string; es: string; en: string };
export type Messages = Record<string, Message>;
export type Params = Record<string, string | number>;

export function isLang(value: unknown): value is Lang {
  return value === "ca" || value === "es" || value === "en";
}

/** Locale per a dates i números (toLocaleDateString, Intl). */
export function localeOf(lang: Lang): string {
  return lang === "ca" ? "ca-ES" : lang === "es" ? "es-ES" : "en-GB";
}

/**
 * Llengua per a `head()` d'una ruta: la ruta arrel la carrega (loader) i
 * queda a `matches[0].loaderData.lang`.
 *
 *   head: ({ matches }) => { const lang = langFromMatches(matches); return { meta: [{ title: tr(lang, m, "title") }] } }
 */
export function langFromMatches(
  matches: ReadonlyArray<{ loaderData?: unknown }>,
): Lang {
  const data = matches[0]?.loaderData as { lang?: unknown } | undefined;
  return isLang(data?.lang) ? data.lang : DEFAULT_LANG;
}

/** Identitat tipada: només serveix perquè les claus quedin inferides. */
export function defineMessages<T extends Messages>(messages: T): T {
  return messages;
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
    const value = params[key];
    return value === undefined || value === null ? whole : String(value);
  });
}

/** Traducció pura (sense React): útil al servidor i fora de components. */
export function tr<T extends Messages>(
  lang: Lang,
  messages: T,
  key: keyof T & string,
  params?: Params,
): string {
  const entry = messages[key];
  if (!entry) return key;
  return interpolate(entry[lang] ?? entry.ca, params);
}

export type Translate<T extends Messages> = (
  key: keyof T & string,
  params?: Params,
) => string;

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangState>({
  lang: DEFAULT_LANG,
  setLang: () => {},
});

/** Llegeix la llengua desada al navegador (localStorage → galeta → idioma del navegador). */
export function readStoredLang(): Lang | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // localStorage pot no ser accessible (mode privat estricte, etc.)
  }
  const fromCookie = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LANG_COOKIE}=`))
    ?.split("=")[1];
  if (isLang(fromCookie)) return fromCookie;
  return null;
}

export function persistLang(lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Sense localStorage ens quedem amb la galeta.
  }
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = lang;
}

export function LangProvider({
  initialLang,
  onChange,
  children,
}: {
  initialLang: Lang;
  onChange?: (lang: Lang) => void;
  children: ReactNode;
}) {
  // La llengua inicial ve del servidor (galeta) perquè SSR i hidratació coincideixin.
  const setLang = useCallback(
    (next: Lang) => {
      persistLang(next);
      onChange?.(next);
    },
    [onChange],
  );
  const value = useMemo(
    () => ({ lang: initialLang, setLang }),
    [initialLang, setLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangState {
  return useContext(LangContext);
}

/** Retorna la funció de traducció per a un diccionari concret, en la llengua actual. */
export function useT<T extends Messages>(messages: T): Translate<T> {
  const { lang } = useLang();
  return useCallback(
    (key: keyof T & string, params?: Params) => tr(lang, messages, key, params),
    [lang, messages],
  );
}
