/**
 * Llengua de la petició actual al servidor: la galeta `radio-lang` que
 * escriu el client quan l'usuari canvia d'idioma. Serveix perquè els
 * missatges d'error de les funcions de servidor surtin en la llengua de
 * qui els veurà.
 */
import { getRequest } from "@tanstack/react-start/server";
import {
  DEFAULT_LANG,
  LANG_COOKIE,
  isLang,
  tr,
  type Lang,
  type Messages,
  type Params,
} from "./index";

export function langFromCookieHeader(
  cookieHeader: string | null | undefined,
): Lang {
  if (!cookieHeader) return DEFAULT_LANG;
  for (const part of cookieHeader.split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === LANG_COOKIE && isLang(value)) return value;
  }
  return DEFAULT_LANG;
}

export function getRequestLang(): Lang {
  try {
    return langFromCookieHeader(getRequest()?.headers?.get("cookie"));
  } catch {
    return DEFAULT_LANG;
  }
}

/** Traducció en la llengua de la petició actual. */
export function st<T extends Messages>(
  messages: T,
  key: keyof T & string,
  params?: Params,
): string {
  return tr(getRequestLang(), messages, key, params);
}
