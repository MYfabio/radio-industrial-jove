import { defineMessages } from "../index";

export const superadminMessages = defineMessages({
  metaTitle: {
    ca: "Panell de super admin",
    es: "Panel de superadministración",
    en: "Super admin panel",
  },
  title: {
    ca: "Panell de super admin",
    es: "Panel de superadministración",
    en: "Super admin panel",
  },
  subtitle: {
    ca: "Dona d'alta escoles, gestiona'n els coordinadors i les persones.",
    es: "Da de alta centros y gestiona sus coordinadores y personas.",
    en: "Register schools and manage their coordinators and people.",
  },
  restrictedText: {
    ca: "Aquest panell només és per al super admin.",
    es: "Este panel es solo para el superadministrador.",
    en: "This panel is for the super admin only.",
  },
  pendingRequests: {
    ca: "Sol·licituds pendents ({count})",
    es: "Solicitudes pendientes ({count})",
    en: "Pending requests ({count})",
  },
  noPending: {
    ca: "Cap sol·licitud pendent.",
    es: "Ninguna solicitud pendiente.",
    en: "No pending requests.",
  },
  wantsDocent: {
    ca: "Vol ser docent",
    es: "Quiere ser docente",
    en: "Wants to be a teacher",
  },
  wantsSchool: {
    ca: "Vol donar d'alta un centre",
    es: "Quiere dar de alta un centro",
    en: "Wants to register a school",
  },
  resolved: { ca: "Resolta", es: "Resuelta", en: "Resolved" },
  newSchool: { ca: "Nova escola", es: "Nuevo centro", en: "New school" },
  notifyAndResolve: {
    ca: "Avisa i resol",
    es: "Avisa y resuelve",
    en: "Notify and resolve",
  },
  notifyHint: {
    ca: "Envia un correu «Ja tens accés» des d'aulaia.cat i marca-la com a resolta. Abans dona-li el rol de docent.",
    es: "Envía un correo «Ya tienes acceso» desde aulaia.cat y la marca como resuelta. Antes dale el rol de docente.",
    en: "Sends a “You now have access” email from aulaia.cat and marks it resolved. Give the teacher role first.",
  },
  notifyNoAccess: {
    ca: "Encara no té rol de docent: dona-l'hi a l'escola abans d'avisar.",
    es: "Todavía no tiene rol de docente: dáselo en su centro antes de avisar.",
    en: "They don't have the teacher role yet: give it at their school before notifying.",
  },
  notifyNotConfigured: {
    ca: "El correu no està configurat (falta CORREU_API_KEY o el servei d'aulaia.cat no l'accepta).",
    es: "El correo no está configurado (falta CORREU_API_KEY o el servicio de aulaia.cat no la acepta).",
    en: "Email is not set up (CORREU_API_KEY missing or rejected by aulaia.cat).",
  },
  notifyTooMany: {
    ca: "Massa correus a aquesta adreça en l'última hora. Torna-ho a provar més tard.",
    es: "Demasiados correos a esta dirección en la última hora. Vuelve a probar más tarde.",
    en: "Too many emails to this address in the last hour. Try again later.",
  },
  notifyFailed: {
    ca: "No s'ha pogut enviar el correu. No s'ha marcat com a resolta.",
    es: "No se ha podido enviar el correo. No se ha marcado como resuelta.",
    en: "The email could not be sent. It has not been marked resolved.",
  },
  tabSchools: { ca: "Escoles", es: "Centros", en: "Schools" },
  tabRequests: { ca: "Sol·licituds", es: "Solicitudes", en: "Requests" },
  tabPlays: { ca: "Escoltes", es: "Escuchas", en: "Plays" },
  schoolName: {
    ca: "Nom de l'escola",
    es: "Nombre del centro",
    en: "School name",
  },
  wallAddress: {
    ca: "Adreça del mur de l'escola",
    es: "Dirección del muro del centro",
    en: "School wall address",
  },
  wallAddressHint: {
    ca: "Només lletres, números i guions. Si la canvies, l'adreça antiga continua funcionant i porta a la nova.",
    es: "Solo letras, números y guiones. Si la cambias, la dirección antigua sigue funcionando y lleva a la nueva.",
    en: "Letters, numbers and hyphens only. If you change it, the old address keeps working and leads to the new one.",
  },
  radioNameOptional: {
    ca: "Nom de la ràdio (opcional)",
    es: "Nombre de la radio (opcional)",
    en: "Radio name (optional)",
  },
  googleDomain: {
    ca: "Domini de Google de l'escola (opcional; no xtec.cat)",
    es: "Dominio de Google de la escuela (opcional; no xtec.cat)",
    en: "School Google domain (optional; not xtec.cat)",
  },
  coordinadorEmail: {
    ca: "Correu del coordinador",
    es: "Correo de la persona coordinadora",
    en: "Coordinator email",
  },
  fillAll: {
    ca: "Omple el nom, el domini i el correu del coordinador.",
    es: "Rellena el nombre, el dominio y el correo de la persona coordinadora.",
    en: "Fill in the name, the domain and the coordinator email.",
  },
  createSchool: {
    ca: "Crea l'escola",
    es: "Crear el centro",
    en: "Create school",
  },
  createError: {
    ca: "No s'ha pogut crear l'escola.",
    es: "No se ha podido crear el centro.",
    en: "Could not create the school.",
  },
  schoolsTitle: {
    ca: "Escoles donades d'alta",
    es: "Centros dados de alta",
    en: "Registered schools",
  },
  loadError: {
    ca: "No s'han pogut carregar les escoles.",
    es: "No se han podido cargar los centros.",
    en: "Could not load the schools.",
  },
  noSchools: {
    ca: "Encara no hi ha cap escola donada d'alta.",
    es: "Aún no hay ningún centro dado de alta.",
    en: "No schools registered yet.",
  },
  coordinatorLabel: {
    ca: "coordinador:",
    es: "coordinación:",
    en: "coordinator:",
  },
  noDomain: { ca: "sense domini", es: "sin dominio", en: "no domain" },
  manage: { ca: "Gestiona", es: "Gestionar", en: "Manage" },
  hide: { ca: "Amaga", es: "Ocultar", en: "Hide" },
  editSchool: {
    ca: "Dades del centre",
    es: "Datos del centro",
    en: "School details",
  },
  deleteSchool: {
    ca: "Elimina el centre",
    es: "Eliminar el centro",
    en: "Delete school",
  },
  deleteSchoolTitle: {
    ca: "Eliminar «{name}»?",
    es: "¿Eliminar «{name}»?",
    en: 'Delete "{name}"?',
  },
  deleteSchoolText: {
    ca: "S'esborra l'escola i el seu mur. Les classes i els pòdcasts es conserven (sense escola i sense compartir-se al mur de l'escola); els coordinadors passen a docents sense escola i la resta de persones queden sense escola. No es pot desfer.",
    es: "Se borra el centro y su muro. Las clases y los pódcasts se conservan (sin centro y sin compartirse en el muro del centro); los coordinadores pasan a docentes sin centro y el resto de personas quedan sin centro. No se puede deshacer.",
    en: "The school and its wall are deleted. Classes and podcasts are kept (without a school and no longer shared on the school wall); coordinators become teachers without a school and everyone else loses their school. This cannot be undone.",
  },
  loadingPeople: {
    ca: "Carregant les persones del centre...",
    es: "Cargando las personas del centro...",
    en: "Loading the school's people...",
  },
});
