import { createIsomorphicFn } from "@tanstack/react-start";
import { DEFAULT_LANG, readStoredLang, type Lang } from "./index";

/**
 * Llengua inicial per al loader de l'arrel: al servidor, la galeta de la
 * petició (perquè l'SSR ja surti en la llengua triada); al client, el que
 * hi ha desat al navegador. No passa per cap crida RPC ni per Supabase.
 */
export const fetchLangFn = createIsomorphicFn()
  .server(async (): Promise<{ lang: Lang }> => {
    const { getRequestLang } = await import("./server");
    return { lang: getRequestLang() };
  })
  .client(async (): Promise<{ lang: Lang }> => ({ lang: readStoredLang() ?? DEFAULT_LANG }));
