import { defineMessages } from "../index";

export const mestreMessages = defineMessages({
  metaTitle: {
    ca: "Panell del mestre — Revisar pòdcasts de la classe",
    es: "Panel del docente — Revisar pódcasts de la clase",
    en: "Teacher panel — Review the class podcasts",
  },
  metaDescription: {
    ca: "Escolta els pòdcasts pendents, deixa un comentari privat per a l'alumne i decideix quan surten al mur.",
    es: "Escucha los pódcasts pendientes, deja un comentario privado para el alumno y decide cuándo salen al muro.",
    en: "Listen to pending podcasts, leave a private note for the student and decide when they go on the wall.",
  },
  ogTitle: {
    ca: "Panell del mestre",
    es: "Panel del docente",
    en: "Teacher panel",
  },
  ogDescription: {
    ca: "Revisa, comenta i programa la publicació dels pòdcasts de la classe.",
    es: "Revisa, comenta y programa la publicación de los pódcasts de la clase.",
    en: "Review, comment on and schedule the class podcasts.",
  },
  title: {
    ca: "Panell del mestre",
    es: "Panel del docente",
    en: "Teacher panel",
  },
  subtitle: {
    ca: "Escolta, comenta i decideix quan surt cada pòdcast al mur.",
    es: "Escucha, comenta y decide cuándo sale cada pódcast al muro.",
    en: "Listen, comment and decide when each podcast goes on the wall.",
  },
  goStudio: {
    ca: "Anar a l'estudi",
    es: "Ir al estudio",
    en: "Go to the studio",
  },
  seeWall: { ca: "Veure el mur", es: "Ver el muro", en: "View the wall" },
  needLogin: {
    ca: "Cal iniciar sessió per veure aquest panell.",
    es: "Debes iniciar sesión para ver este panel.",
    en: "You need to sign in to see this panel.",
  },
  backToStudio: {
    ca: "Torna a l'estudi",
    es: "Volver al estudio",
    en: "Back to the studio",
  },
  restricted: {
    ca: "Accés restringit",
    es: "Acceso restringido",
    en: "Restricted access",
  },
  restrictedText: {
    ca: "Aquest panell només és per a docents o coordinadors.",
    es: "Este panel es solo para docentes o coordinadores.",
    en: "This panel is for teachers or coordinators only.",
  },
  loadingPodcasts: {
    ca: "Carregant els pòdcasts...",
    es: "Cargando los pódcasts...",
    en: "Loading podcasts...",
  },
  classFilter: { ca: "Classe:", es: "Clase:", en: "Class:" },
  allClasses: { ca: "Totes", es: "Todas", en: "All" },
  noClassFilter: { ca: "Sense classe", es: "Sin clase", en: "No class" },
  pendingTitle: {
    ca: "Pendents de revisar ({count})",
    es: "Pendientes de revisar ({count})",
    en: "Waiting for review ({count})",
  },
  nothingPending: {
    ca: "Cap pòdcast pendent. Tot revisat!",
    es: "Ningún pódcast pendiente. ¡Todo revisado!",
    en: "No pending podcasts. All reviewed!",
  },
  reviewedTitle: {
    ca: "Ja revisats ({count})",
    es: "Ya revisados ({count})",
    en: "Already reviewed ({count})",
  },
  showMore: {
    ca: "Mostra'n més ({count} restants)",
    es: "Mostrar más ({count} restantes)",
    en: "Show more ({count} left)",
  },

  // Fitxa d'un pòdcast
  anonymous: { ca: "Anònim", es: "Anónimo", en: "Anonymous" },
  statusPendent: { ca: "pendent", es: "pendiente", en: "pending" },
  statusAprovat: { ca: "aprovat", es: "aprobado", en: "approved" },
  statusRebutjat: { ca: "rebutjat", es: "rechazado", en: "rejected" },
  noteLabel: {
    ca: "Comentari privat per a l'alumne",
    es: "Comentario privado para el alumno",
    en: "Private note for the student",
  },
  notePlaceholder: {
    ca: "Molt bona entonació! La propera vegada allarga una mica la introducció.",
    es: "¡Muy buena entonación! La próxima vez alarga un poco la introducción.",
    en: "Great intonation! Next time make the introduction a little longer.",
  },
  publishAtLabel: {
    ca: "Sortir al mur el dia",
    es: "Salir al muro el día",
    en: "Publish on the wall on",
  },
  publishAtHint: {
    ca: "Deixa-ho buit per publicar-lo de seguida.",
    es: "Déjalo vacío para publicarlo enseguida.",
    en: "Leave empty to publish right away.",
  },
  approveUpdate: {
    ca: "Actualitzar al mur",
    es: "Actualizar en el muro",
    en: "Update on the wall",
  },
  approvePublish: {
    ca: "Aprovar i publicar al mur",
    es: "Aprobar y publicar en el muro",
    en: "Approve and publish on the wall",
  },
  saveNote: {
    ca: "Desar comentari",
    es: "Guardar comentario",
    en: "Save note",
  },
  removeFromWall: {
    ca: "Treure del mur",
    es: "Quitar del muro",
    en: "Remove from the wall",
  },
  savedApprovedLater: {
    ca: "Aprovat: sortirà al mur el dia indicat.",
    es: "Aprobado: saldrá al muro el día indicado.",
    en: "Approved: it will appear on the wall on the chosen day.",
  },
  savedApprovedNow: {
    ca: "Aprovat: ja es veu al mur de la classe.",
    es: "Aprobado: ya se ve en el muro de la clase.",
    en: "Approved: it is now on the class wall.",
  },
  savedRejected: {
    ca: "Rebutjat: no es veurà al mur.",
    es: "Rechazado: no se verá en el muro.",
    en: "Rejected: it will not appear on the wall.",
  },
  savedNote: {
    ca: "Comentari desat.",
    es: "Comentario guardado.",
    en: "Note saved.",
  },

  // Classes
  classesTitle: {
    ca: "Les teves classes",
    es: "Tus clases",
    en: "Your classes",
  },
  classesLoginHint: {
    ca: "Inicia sessió per crear classes i tenir-hi codis d'invitació per als alumnes.",
    es: "Inicia sesión para crear clases y tener códigos de invitación para los alumnos.",
    en: "Sign in to create classes and get invite codes for your students.",
  },
  createdBanner: {
    ca: "Classe «{name}» creada!",
    es: "¡Clase «{name}» creada!",
    en: 'Class "{name}" created!',
  },
  createdHint: {
    ca: "Comparteix l'enllaç a l'aula (o dona'ls el codi) perquè s'hi uneixin: no cal que siguin del centre.",
    es: "Comparte el enlace en el aula (o dales el código) para que se unan: no hace falta que sean del centro.",
    en: "Share the link in class (or give them the code) so they can join: they do not need to belong to the school.",
  },
  copyLink: { ca: "Copia l'enllaç", es: "Copiar el enlace", en: "Copy link" },
  linkCopied: {
    ca: "Enllaç copiat!",
    es: "¡Enlace copiado!",
    en: "Link copied!",
  },
  codeCopied: {
    ca: "Codi copiat!",
    es: "¡Código copiado!",
    en: "Code copied!",
  },
  copyCodeTitle: {
    ca: "Copia el codi",
    es: "Copiar el código",
    en: "Copy the code",
  },
  joinLinkTitle: {
    ca: "Enllaç per unir-s'hi",
    es: "Enlace para unirse",
    en: "Join link",
  },
  loadClassesError: {
    ca: "No s'han pogut carregar les teves classes:",
    es: "No se han podido cargar tus clases:",
    en: "Could not load your classes:",
  },
  unknownError: {
    ca: "error desconegut",
    es: "error desconocido",
    en: "unknown error",
  },
  schoolBadge: { ca: "Escola", es: "Centro", en: "School" },
  wall: { ca: "Mur", es: "Muro", en: "Wall" },
  noClassesYet: {
    ca: 'Encara no has creat cap classe. Posa-hi un nom i prem "Crea una classe" per obtenir un codi d\'invitació de 6 caràcters i un enllaç per compartir.',
    es: 'Aún no has creado ninguna clase. Escribe un nombre y pulsa "Crear una clase" para obtener un código de invitación de 6 caracteres y un enlace para compartir.',
    en: 'You have not created any class yet. Type a name and press "Create a class" to get a 6-character invite code and a link to share.',
  },
  classNamePlaceholder: {
    ca: "Nom de la classe (p. ex. 5è B)",
    es: "Nombre de la clase (p. ej. 5º B)",
    en: "Class name (e.g. Year 5 B)",
  },
  createClass: {
    ca: "Crea una classe",
    es: "Crear una clase",
    en: "Create a class",
  },
  createClassError: {
    ca: "No s'ha pogut crear la classe.",
    es: "No se ha podido crear la clase.",
    en: "Could not create the class.",
  },
  shareToSchool: {
    ca: "Comparteix els pòdcasts aprovats d'aquesta classe al mur de l'escola",
    es: "Comparte los pódcasts aprobados de esta clase en el muro del centro",
    en: "Share this class's approved podcasts on the school wall",
  },
  deleteClass: {
    ca: "Esborra la classe",
    es: "Eliminar la clase",
    en: "Delete class",
  },
  deleteClassTitle: {
    ca: "Esborrar la classe «{name}»?",
    es: "¿Eliminar la clase «{name}»?",
    en: 'Delete class "{name}"?',
  },
  deleteClassText: {
    ca: "Només es poden esborrar classes sense pòdcasts. L'alumnat en quedarà desvinculat i el codi i l'enllaç deixaran de funcionar.",
    es: "Solo se pueden eliminar clases sin pódcasts. El alumnado quedará desvinculado y el código y el enlace dejarán de funcionar.",
    en: "Only classes without podcasts can be deleted. Students will be unlinked and the code and link will stop working.",
  },
  deleteAction: { ca: "Esborra", es: "Eliminar", en: "Delete" },
  cancel: { ca: "Cancel·la", es: "Cancelar", en: "Cancel" },
  loading: { ca: "Carregant...", es: "Cargando...", en: "Loading..." },
  deletePodcast: { ca: "Elimina", es: "Eliminar", en: "Delete" },
  deletePodcastTitle: {
    ca: "Eliminar «{title}» del tot?",
    es: "¿Eliminar «{title}» del todo?",
    en: 'Delete "{title}" completely?',
  },
  deletePodcastText: {
    ca: "S'esborra el pòdcast amb el seu àudio i la caràtula, també de l'espai de l'alumne. No es pot desfer. Si només vols que no es vegi al mur, fes servir «Treure del mur».",
    es: "Se borra el pódcast con su audio y su carátula, también del espacio del alumno. No se puede deshacer. Si solo quieres que no se vea en el muro, usa «Quitar del muro».",
    en: 'The podcast is deleted with its audio and cover, also from the student\'s space. This cannot be undone. If you only want it off the wall, use "Remove from the wall".',
  },
  deleted: {
    ca: "Pòdcast eliminat.",
    es: "Pódcast eliminado.",
    en: "Podcast deleted.",
  },
});
