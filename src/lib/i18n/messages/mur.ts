import { defineMessages } from "../index";

/** Mur obert (src/routes/mur.tsx). */
export const murMessages = defineMessages({
  metaTitle: {
    ca: "Mur obert — Pòdcasts aprovats de {site}",
    es: "Muro abierto — Pódcasts aprobados de {site}",
    en: "Open wall — Approved podcasts from {site}",
  },
  metaDescription: {
    ca: "Escolta pòdcasts gravats i aprovats a través d'aquest recurs obert, organitzats per categoria.",
    es: "Escucha pódcasts grabados y aprobados a través de este recurso abierto, organizados por categoría.",
    en: "Listen to podcasts recorded and approved through this open resource, organised by category.",
  },
  ogTitle: {
    ca: "Mur obert — {site}",
    es: "Muro abierto — {site}",
    en: "Open wall — {site}",
  },
  ogDescription: {
    ca: "Pòdcasts aprovats, llestos per escoltar.",
    es: "Pódcasts aprobados, listos para escuchar.",
    en: "Approved podcasts, ready to listen to.",
  },
  heading: { ca: "Mur obert", es: "Muro abierto", en: "Open wall" },
  countOne: {
    ca: "{count} pòdcast aprovat i publicat, sense classe associada.",
    es: "{count} pódcast aprobado y publicado, sin clase asociada.",
    en: "{count} podcast approved and published, with no class attached.",
  },
  countMany: {
    ca: "{count} pòdcasts aprovats i publicats, sense classe associada.",
    es: "{count} pódcasts aprobados y publicados, sin clase asociada.",
    en: "{count} podcasts approved and published, with no class attached.",
  },
  empty: {
    ca: "Encara no hi ha cap pòdcast aprovat. Grava'n un i demana que el revisin!",
    es: "Aún no hay ningún pódcast aprobado. ¡Graba uno y pide que lo revisen!",
    en: "No approved podcasts yet. Record one and ask for it to be reviewed!",
  },
  recordOne: { ca: "Gravar-ne un", es: "Grabar uno", en: "Record one" },
});
