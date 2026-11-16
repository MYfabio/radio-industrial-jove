/** Textos del botó de compartir un pòdcast (SharePodcast) i de la seva pàgina pròpia (/podcast/$id). */
import { defineMessages } from "../index";

export const sharePodcastMessages = defineMessages({
  share: { ca: "Compartir", es: "Compartir", en: "Share" },
  shareTitle: {
    ca: "Comparteix {title}",
    es: "Compartir {title}",
    en: "Share {title}",
  },
  linkLabel: {
    ca: "Enllaç del pòdcast",
    es: "Enlace del pódcast",
    en: "Podcast link",
  },
  linkHelp: {
    ca: "Copia l'enllaç i enganxa'l on vulguis: en un article de La Claqueta, en un correu o al blog de la classe.",
    es: "Copia el enlace y pégalo donde quieras: en un artículo de La Claqueta, en un correo o en el blog de la clase.",
    en: "Copy the link and paste it anywhere: in a La Claqueta article, an email or the class blog.",
  },
  wallLinkHelp: {
    ca: "Aquest pòdcast només es pot escoltar des del mur de la classe, amb aquest enllaç.",
    es: "Este pódcast solo se puede escuchar desde el muro de la clase, con este enlace.",
    en: "This podcast can only be played from the class wall, using this link.",
  },
  copy: { ca: "Copiar", es: "Copiar", en: "Copy" },
  copied: { ca: "Copiat!", es: "¡Copiado!", en: "Copied!" },
  shareWith: {
    ca: "Compartir amb…",
    es: "Compartir con…",
    en: "Share via…",
  },
  open: { ca: "Obrir", es: "Abrir", en: "Open" },

  // Pàgina pròpia
  anonymous: { ca: "Anònim", es: "Anónimo", en: "Anonymous" },
  otherCategory: { ca: "Altres", es: "Otros", en: "Other" },
  moreFrom: {
    ca: "Més pòdcasts de {radio}",
    es: "Más pódcasts de {radio}",
    en: "More podcasts from {radio}",
  },
  recordOne: { ca: "Grava'n un", es: "Graba uno", en: "Record one" },
  notFoundTitle: {
    ca: "Aquest pòdcast no està disponible",
    es: "Este pódcast no está disponible",
    en: "This podcast isn't available",
  },
  notFoundText: {
    ca: "Potser encara no s'ha publicat, s'ha retirat o només es pot escoltar des del mur de l'escola.",
    es: "Quizá aún no se ha publicado, se ha retirado o solo se puede escuchar desde el muro de la escuela.",
    en: "It may not be published yet, it may have been removed, or it can only be heard on the school wall.",
  },
  metaDescription: {
    ca: "Escolta aquest pòdcast gravat a {site}.",
    es: "Escucha este pódcast grabado en {site}.",
    en: "Listen to this podcast recorded on {site}.",
  },
});
