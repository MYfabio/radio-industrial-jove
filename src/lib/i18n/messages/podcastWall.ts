/** Textos del mur de pòdcasts (PodcastWall): pòsters, diàleg de detall, cerca i preferits. */
import { defineMessages } from "../index";

export const podcastWallMessages = defineMessages({
  openPodcast: { ca: "Obre {title}", es: "Abrir {title}", en: "Open {title}" },
  otherCategory: { ca: "Altres", es: "Otros", en: "Other" },
  anonymous: { ca: "Anònim", es: "Anónimo", en: "Anonymous" },
  addFavorite: {
    ca: "Afegir als preferits",
    es: "Añadir a favoritos",
    en: "Add to favourites",
  },
  removeFavorite: {
    ca: "Treure dels preferits",
    es: "Quitar de favoritos",
    en: "Remove from favourites",
  },
  favorite: { ca: "Preferit", es: "Favorito", en: "Favourite" },
  inFavorites: { ca: "Als preferits", es: "En favoritos", en: "In favourites" },
  share: { ca: "Compartir", es: "Compartir", en: "Share" },
  linkCopied: {
    ca: "Enllaç copiat!",
    es: "¡Enlace copiado!",
    en: "Link copied!",
  },
  teacherNote: {
    ca: "Comentari del mestre:",
    es: "Comentario del docente:",
    en: "Teacher's comment:",
  },
  emptyDefault: {
    ca: "Encara no hi ha cap pòdcast aprovat.",
    es: "Todavía no hay ningún pódcast aprobado.",
    en: "There are no approved podcasts yet.",
  },
  privateWall: {
    ca: "Aquest mur és privat",
    es: "Este muro es privado",
    en: "This wall is private",
  },
  checkingSession: {
    ca: "Comprovant la sessió...",
    es: "Comprobando la sesión...",
    en: "Checking your session...",
  },
  searchPlaceholder: {
    ca: "Cerca per títol, autor o etiqueta…",
    es: "Busca por título, autor o etiqueta…",
    en: "Search by title, author or tag…",
  },
  searchLabel: {
    ca: "Cerca pòdcasts",
    es: "Buscar pódcasts",
    en: "Search podcasts",
  },
  noMatch: {
    ca: "Cap pòdcast coincideix amb «{query}».",
    es: "Ningún pódcast coincide con «{query}».",
    en: "No podcast matches “{query}”.",
  },
});
