/** Textos del formulari de publicació d'un pòdcast (PublishPodcast). */
import { defineMessages } from "../index";

export const publishPodcastMessages = defineMessages({
  // Errors de validació
  coverNotImage: {
    ca: "La caràtula ha de ser una imatge (JPG o PNG).",
    es: "La carátula tiene que ser una imagen (JPG o PNG).",
    en: "The cover must be an image (JPG or PNG).",
  },
  coverTooBig: {
    ca: "La imatge és massa gran (màxim 3 MB).",
    es: "La imagen es demasiado grande (máximo 3 MB).",
    en: "The image is too large (3 MB maximum).",
  },
  noRecording: {
    ca: "Encara no hi ha cap gravació per publicar.",
    es: "Todavía no hay ninguna grabación para publicar.",
    en: "There is no recording to publish yet.",
  },
  titleRequired: {
    ca: "Posa-hi un títol abans de publicar.",
    es: "Ponle un título antes de publicar.",
    en: "Add a title before publishing.",
  },
  publishFailed: {
    ca: "No s'ha pogut publicar el pòdcast.",
    es: "No se ha podido publicar el pódcast.",
    en: "The podcast could not be published.",
  },

  // Confirmació
  sentTitle: {
    ca: "Enviat! Pòdcast #{id}",
    es: "¡Enviado! Pódcast #{id}",
    en: "Sent! Podcast #{id}",
  },
  scheduledInfo: {
    ca: "Quan el mestre l'aprovi, apareixerà al mur el {date}.",
    es: "Cuando el docente lo apruebe, aparecerá en el muro el {date}.",
    en: "Once your teacher approves it, it will appear on the wall on {date}.",
  },
  pendingInfo: {
    ca: "Queda pendent de revisió. Quan el mestre l'aprovi, sortirà al mur de la classe.",
    es: "Queda pendiente de revisión. Cuando el docente lo apruebe, saldrá en el muro de la clase.",
    en: "It is pending review. Once your teacher approves it, it will appear on the class wall.",
  },

  // Camps
  titleLabel: { ca: "Títol *", es: "Título *", en: "Title *" },
  titlePlaceholder: {
    ca: "El pòdcast de 5è B",
    es: "El pódcast de 5.º B",
    en: "The Year 5B podcast",
  },
  descLabel: { ca: "Descripció", es: "Descripción", en: "Description" },
  descPlaceholder: {
    ca: "De què parla el vostre pòdcast?",
    es: "¿De qué habla vuestro pódcast?",
    en: "What is your podcast about?",
  },
  authorLabel: { ca: "Qui el fa", es: "Quién lo hace", en: "Who made it" },
  authorPlaceholder: {
    ca: "Marta i Pau",
    es: "Marta y Pau",
    en: "Marta and Pau",
  },
  catLabel: { ca: "Categoria", es: "Categoría", en: "Category" },
  catPlaceholder: { ca: "Notícies", es: "Noticias", en: "News" },
  tagsLabel: {
    ca: "Etiquetes (separades per comes)",
    es: "Etiquetas (separadas por comas)",
    en: "Tags (comma-separated)",
  },
  tagsPlaceholder: {
    ca: "escola, natura, entrevista",
    es: "escuela, naturaleza, entrevista",
    en: "school, nature, interview",
  },

  // Caràtula
  coverTitle: { ca: "Caràtula", es: "Carátula", en: "Cover" },
  coverIntro: {
    ca: "Puja una foto o tria una icona per al mur.",
    es: "Sube una foto o elige un icono para el muro.",
    en: "Upload a photo or pick an icon for the wall.",
  },
  canvaLink: {
    ca: "Fes la caràtula amb la plantilla de Canva",
    es: "Haz la carátula con la plantilla de Canva",
    en: "Make the cover with the Canva template",
  },
  canvaHelp: {
    ca: "Obre la plantilla, personalitza-la amb el teu títol, descarrega-la com a imatge (PNG o JPG) i puja-la aquí baix.",
    es: "Abre la plantilla, personalízala con tu título, descárgala como imagen (PNG o JPG) y súbela aquí abajo.",
    en: "Open the template, customise it with your title, download it as an image (PNG or JPG) and upload it below.",
  },
  coverAlt: {
    ca: "Caràtula triada",
    es: "Carátula elegida",
    en: "Chosen cover",
  },
  removePhoto: {
    ca: "Treure la foto",
    es: "Quitar la foto",
    en: "Remove the photo",
  },
  uploadPhoto: {
    ca: "Pujar una foto",
    es: "Subir una foto",
    en: "Upload a photo",
  },
  pickIcon: {
    ca: "Triar la icona {emoji}",
    es: "Elegir el icono {emoji}",
    en: "Choose the {emoji} icon",
  },

  // Programació
  scheduleLabel: {
    ca: "Programar la publicació",
    es: "Programar la publicación",
    en: "Schedule the publication",
  },
  scheduleHelp: {
    ca: "Tria el dia i l'hora en què vols que aparegui al mur (un cop aprovat).",
    es: "Elige el día y la hora en que quieres que aparezca en el muro (una vez aprobado).",
    en: "Choose the day and time you want it to appear on the wall (once approved).",
  },

  // Botó d'enviament
  sending: { ca: "Enviant...", es: "Enviando...", en: "Sending..." },
  publish: {
    ca: "Publicar el pòdcast",
    es: "Publicar el pódcast",
    en: "Publish the podcast",
  },
});
