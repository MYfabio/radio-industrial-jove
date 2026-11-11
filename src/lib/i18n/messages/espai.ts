import { defineMessages } from "../index";

/** El meu espai (src/routes/espai.tsx). */
export const espaiMessages = defineMessages({
  metaTitle: {
    ca: "El meu espai — {site}",
    es: "Mi espacio — {site}",
    en: "My space — {site}",
  },

  // Errors
  titleRequired: {
    ca: "El títol no pot quedar buit.",
    es: "El título no puede quedar vacío.",
    en: "The title cannot be empty.",
  },
  saveFailed: {
    ca: "No s'ha pogut desar.",
    es: "No se ha podido guardar.",
    en: "Could not save.",
  },
  deleteFailed: {
    ca: "No s'ha pogut esborrar.",
    es: "No se ha podido eliminar.",
    en: "Could not delete.",
  },

  // Estat del pòdcast (es mostra en majúscules via CSS)
  statusPending: { ca: "pendent", es: "pendiente", en: "pending" },
  statusApproved: { ca: "aprovat", es: "aprobado", en: "approved" },
  statusRejected: { ca: "rebutjat", es: "rechazado", en: "rejected" },

  // Targeta d'un pòdcast propi
  teacherNote: {
    ca: "Comentari del mestre:",
    es: "Comentario del docente:",
    en: "Teacher's comment:",
  },
  titlePlaceholder: { ca: "Títol", es: "Título", en: "Title" },
  descPlaceholder: { ca: "Descripció", es: "Descripción", en: "Description" },
  catPlaceholder: { ca: "Categoria", es: "Categoría", en: "Category" },
  tagsPlaceholder: {
    ca: "Etiquetes (separades per comes)",
    es: "Etiquetas (separadas por comas)",
    en: "Tags (comma-separated)",
  },
  save: { ca: "Desa", es: "Guardar", en: "Save" },
  cancel: { ca: "Cancel·la", es: "Cancelar", en: "Cancel" },
  edit: { ca: "Edita", es: "Editar", en: "Edit" },
  confirmQuestion: { ca: "Segur?", es: "¿Seguro?", en: "Are you sure?" },
  confirmDelete: { ca: "Sí, esborra", es: "Sí, eliminar", en: "Yes, delete" },
  delete: { ca: "Esborra", es: "Eliminar", en: "Delete" },

  // Targeta d'un preferit
  anonymous: { ca: "Anònim", es: "Anónimo", en: "Anonymous" },
  removeFavorite: {
    ca: "Treure dels preferits",
    es: "Quitar de favoritos",
    en: "Remove from favourites",
  },

  // Pàgina
  signInPrompt: {
    ca: "Inicia sessió per veure el teu espai.",
    es: "Inicia sesión para ver tu espacio.",
    en: "Sign in to see your space.",
  },
  title: { ca: "El meu espai", es: "Mi espacio", en: "My space" },
  subtitle: {
    ca: "Els teus pòdcasts, projectes i sons, i els pòdcasts que t'agraden.",
    es: "Tus pódcasts, proyectos y sonidos, y los pódcasts que te gustan.",
    en: "Your podcasts, projects and sounds, and the podcasts you like.",
  },
  goToStudio: {
    ca: "Anar a l'estudi",
    es: "Ir al estudio",
    en: "Go to the studio",
  },
  tabMine: { ca: "Els meus pòdcasts", es: "Mis pódcasts", en: "My podcasts" },
  tabFavorites: { ca: "Preferits", es: "Favoritos", en: "Favourites" },
  loading: { ca: "Carregant...", es: "Cargando...", en: "Loading..." },
  emptyMineTitle: {
    ca: "Encara no has gravat cap pòdcast",
    es: "Aún no has grabado ningún pódcast",
    en: "You haven't recorded a podcast yet",
  },
  emptyMineText: {
    ca: "L'estudi t'espera: tria una plantilla, prem el botó vermell i explica el que vulguis.",
    es: "El estudio te espera: elige una plantilla, pulsa el botón rojo y cuenta lo que quieras.",
    en: "The studio is waiting: pick a template, press the red button and tell your story.",
  },
  recordFirst: {
    ca: "Grava el teu primer pòdcast",
    es: "Graba tu primer pódcast",
    en: "Record your first podcast",
  },
  emptyFavorites: {
    ca: "Encara no has marcat cap pòdcast com a preferit. Fes-ho des del mur!",
    es: "Aún no has marcado ningún pódcast como favorito. ¡Hazlo desde el muro!",
    en: "You haven't marked any podcast as a favourite yet. Do it from the wall!",
  },

  // Projectes a mig fer (els mateixos que surten a l'estudi)
  tabDrafts: { ca: "Els meus projectes", es: "Mis proyectos", en: "My projects" },
  emptyDrafts: {
    ca: "No tens cap projecte a mig fer. Quan en desis un a l'estudi, el trobaràs aquí.",
    es: "No tienes ningún proyecto a medias. Cuando guardes uno en el estudio, lo encontrarás aquí.",
    en: "You have no unfinished projects. When you save one in the studio, you'll find it here.",
  },
  draftSaved: {
    ca: "Desat el {date}",
    es: "Guardado el {date}",
    en: "Saved on {date}",
  },
  continueInStudio: {
    ca: "Continua'l a l'estudi",
    es: "Continuar en el estudio",
    en: "Continue in the studio",
  },

  // Sons propis (la galeria personal de l'estudi)
  tabSounds: { ca: "Els meus sons", es: "Mis sonidos", en: "My sounds" },
  emptySounds: {
    ca: "Encara no has pujat cap so. Puja'n des de l'estudi i els trobaràs aquí.",
    es: "Aún no has subido ningún sonido. Súbelos desde el estudio y los encontrarás aquí.",
    en: "You haven't uploaded any sounds yet. Upload them from the studio and you'll find them here.",
  },
  soundsHint: {
    ca: "Els sons nous es pugen des de l'estudi.",
    es: "Los sonidos nuevos se suben desde el estudio.",
    en: "New sounds are uploaded from the studio.",
  },
  kindEffect: { ca: "Efecte", es: "Efecto", en: "Effect" },
  kindMusic: { ca: "Música", es: "Música", en: "Music" },
  listen: { ca: "Escolta", es: "Escuchar", en: "Listen" },
  playFailed: {
    ca: "No s'ha pogut carregar el so.",
    es: "No se ha podido cargar el sonido.",
    en: "Could not load the sound.",
  },
});
