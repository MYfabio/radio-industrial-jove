import { defineMessages } from "../index";

/** Mur d'una escola (src/routes/escola.$slug.tsx). */
export const escolaWallMessages = defineMessages({
  metaTitle: {
    ca: "Mur de l'escola — {site}",
    es: "Muro de la escuela — {site}",
    en: "School wall — {site}",
  },
  metaDescription: {
    ca: "Escolta els pòdcasts aprovats de les classes d'aquesta escola que han triat compartir-los.",
    es: "Escucha los pódcasts aprobados de las clases de esta escuela que han decidido compartirlos.",
    en: "Listen to the approved podcasts from this school's classes that chose to share them.",
  },
  privateWall: {
    ca: "Mur privat de l'escola.",
    es: "Muro privado de la escuela.",
    en: "Private school wall.",
  },
  countOne: {
    ca: "{count} pòdcast compartit per les classes d'aquesta escola.",
    es: "{count} pódcast compartido por las clases de esta escuela.",
    en: "{count} podcast shared by this school's classes.",
  },
  countMany: {
    ca: "{count} pòdcasts compartits per les classes d'aquesta escola.",
    es: "{count} pódcasts compartidos por las clases de esta escuela.",
    en: "{count} podcasts shared by this school's classes.",
  },
  lockedDomain: {
    ca: "Inicia sessió amb un compte de Google d'aquesta escola (@{domain}) per veure'l.",
    es: "Inicia sesión con una cuenta de Google de esta escuela (@{domain}) para verlo.",
    en: "Sign in with a Google account from this school (@{domain}) to see it.",
  },
  lockedGeneric: {
    ca: "Aquest mur és privat.",
    es: "Este muro es privado.",
    en: "This wall is private.",
  },
  empty: {
    ca: "Encara no hi ha cap pòdcast compartit al mur de l'escola.",
    es: "Aún no hay ningún pódcast compartido en el muro de la escuela.",
    en: "Nothing has been shared to the school wall yet.",
  },
  recordOne: { ca: "Gravar-ne un", es: "Grabar uno", en: "Record one" },
});
