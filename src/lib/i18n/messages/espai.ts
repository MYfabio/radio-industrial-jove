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
    ca: "Els teus pòdcasts i els que t'agraden.",
    es: "Tus pódcasts y los que te gustan.",
    en: "Your podcasts and the ones you like.",
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
});
