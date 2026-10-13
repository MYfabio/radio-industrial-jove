/** Quadre de comandament d'una classe, al panell del mestre. */
import { defineMessages } from "../index";

export const dashboardMessages = defineMessages({
  title: {
    ca: "Quadre de la classe",
    es: "Cuadro de la clase",
    en: "Class dashboard",
  },
  intro: {
    ca: "Qui hi ha a la classe, quants pòdcasts ha publicat cadascú i quantes escoltes reals té cada pòdcast al mur.",
    es: "Quién está en la clase, cuántos pódcasts ha publicado cada uno y cuántas escuchas reales tiene cada pódcast en el muro.",
    en: "Who is in the class, how many podcasts each one has published and how many real plays each podcast has on the wall.",
  },
  classLabel: { ca: "Classe", es: "Clase", en: "Class" },
  loading: {
    ca: "Carregant el quadre...",
    es: "Cargando el cuadro...",
    en: "Loading the dashboard...",
  },
  loadError: {
    ca: "No s'ha pogut carregar:",
    es: "No se ha podido cargar:",
    en: "Could not load:",
  },

  kpiStudents: { ca: "Alumnes", es: "Alumnos", en: "Students" },
  kpiPodcasts: {
    ca: "Pòdcasts publicats",
    es: "Pódcasts publicados",
    en: "Podcasts published",
  },
  kpiApproved: { ca: "Al mur", es: "En el muro", en: "On the wall" },
  kpiPlays: {
    ca: "Escoltes totals",
    es: "Escuchas totales",
    en: "Total plays",
  },

  studentsTitle: { ca: "Alumnat", es: "Alumnado", en: "Students" },
  noStudents: {
    ca: "Encara no hi ha cap alumne en aquesta classe. Comparteix-los l'enllaç o el codi.",
    es: "Aún no hay ningún alumno en esta clase. Compárteles el enlace o el código.",
    en: "No students in this class yet. Share the link or the code with them.",
  },
  colStudent: { ca: "Alumne", es: "Alumno", en: "Student" },
  colPodcasts: { ca: "Pòdcasts", es: "Pódcasts", en: "Podcasts" },
  colApproved: { ca: "Al mur", es: "En el muro", en: "On the wall" },
  colPlays: { ca: "Escoltes", es: "Escuchas", en: "Plays" },
  noneYet: { ca: "cap encara", es: "ninguno aún", en: "none yet" },

  podcastsTitle: {
    ca: "Pòdcasts de la classe",
    es: "Pódcasts de la clase",
    en: "Class podcasts",
  },
  noPodcasts: {
    ca: "Encara no s'ha publicat cap pòdcast en aquesta classe.",
    es: "Aún no se ha publicado ningún pódcast en esta clase.",
    en: "No podcast has been published in this class yet.",
  },
  colPodcast: { ca: "Pòdcast", es: "Pódcast", en: "Podcast" },
  colAuthor: { ca: "Autor", es: "Autor", en: "Author" },
  colStatus: { ca: "Estat", es: "Estado", en: "Status" },
  colDate: { ca: "Data", es: "Fecha", en: "Date" },
  anonymous: { ca: "Anònim", es: "Anónimo", en: "Anonymous" },
  statusPendent: { ca: "pendent", es: "pendiente", en: "pending" },
  statusAprovat: { ca: "aprovat", es: "aprobado", en: "approved" },
  statusRebutjat: { ca: "rebutjat", es: "rechazado", en: "rejected" },
  playsNote: {
    ca: "Les escoltes es compten des que es va activar el comptador; només el recompte, mai qui escolta.",
    es: "Las escuchas se cuentan desde que se activó el contador; solo el recuento, nunca quién escucha.",
    en: "Plays are counted since the counter went live; only the count, never who listened.",
  },
});
