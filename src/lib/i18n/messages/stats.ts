/** Textos de les gràfiques d'escoltes dels panells de coordinador i super admin. */
import { defineMessages } from "../index";

export const statsMessages = defineMessages({
  title: {
    ca: "Escoltes dels pòdcasts",
    es: "Escuchas de los pódcasts",
    en: "Podcast plays",
  },
  intro: {
    ca: "Quantes vegades s'han posat els pòdcasts al mur. Es compta el recompte del dia, mai qui els escolta.",
    es: "Cuántas veces se han reproducido los pódcasts en el muro. Se cuenta el total del día, nunca quién los escucha.",
    en: "How many times podcasts were played on the wall. Only the daily count is stored, never who listened.",
  },
  range7: { ca: "7 dies", es: "7 días", en: "7 days" },
  range30: { ca: "30 dies", es: "30 días", en: "30 days" },
  range90: { ca: "90 dies", es: "90 días", en: "90 days" },
  allSchools: {
    ca: "Tots els centres",
    es: "Todos los centros",
    en: "All schools",
  },
  schoolLabel: { ca: "Centre", es: "Centro", en: "School" },
  rangeLabel: { ca: "Període", es: "Periodo", en: "Period" },

  // Xifres destacades
  kpiTotal: {
    ca: "Escoltes al període",
    es: "Escuchas en el periodo",
    en: "Plays in the period",
  },
  kpiLast7: {
    ca: "Els últims 7 dies",
    es: "Los últimos 7 días",
    en: "Last 7 days",
  },
  kpiPlayed: {
    ca: "Pòdcasts escoltats",
    es: "Pódcasts escuchados",
    en: "Podcasts played",
  },
  kpiPublished: {
    ca: "Pòdcasts al mur",
    es: "Pódcasts en el muro",
    en: "Podcasts on the wall",
  },

  chartDailyTitle: {
    ca: "Escoltes per dia",
    es: "Escuchas por día",
    en: "Plays per day",
  },
  chartTopTitle: {
    ca: "Els més escoltats",
    es: "Los más escuchados",
    en: "Most played",
  },
  playsUnit: { ca: "escoltes", es: "escuchas", en: "plays" },
  playsUnitOne: { ca: "escolta", es: "escucha", en: "play" },
  noClass: { ca: "Sense classe", es: "Sin clase", en: "No class" },

  empty: {
    ca: "Encara no hi ha cap escolta en aquest període. Apareixeran aquí quan algú posi un pòdcast del mur.",
    es: "Aún no hay ninguna escucha en este periodo. Aparecerán aquí cuando alguien reproduzca un pódcast del muro.",
    en: "No plays in this period yet. They will show up here once someone plays a podcast from the wall.",
  },
  loading: {
    ca: "Carregant les escoltes...",
    es: "Cargando las escuchas...",
    en: "Loading plays...",
  },
  loadError: {
    ca: "No s'han pogut carregar les escoltes:",
    es: "No se han podido cargar las escuchas:",
    en: "Could not load the plays:",
  },

  showTable: {
    ca: "Veure les dades en una taula",
    es: "Ver los datos en una tabla",
    en: "View the data as a table",
  },
  hideTable: {
    ca: "Amaga la taula",
    es: "Ocultar la tabla",
    en: "Hide the table",
  },
  colDay: { ca: "Dia", es: "Día", en: "Day" },
  colPlays: { ca: "Escoltes", es: "Escuchas", en: "Plays" },
  colPodcast: { ca: "Pòdcast", es: "Pódcast", en: "Podcast" },
  colClass: { ca: "Classe", es: "Clase", en: "Class" },
});
