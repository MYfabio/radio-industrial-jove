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
  schoolName: {
    ca: "Nom de l'escola",
    es: "Nombre del centro",
    en: "School name",
  },
  radioNameOptional: {
    ca: "Nom de la ràdio (opcional)",
    es: "Nombre de la radio (opcional)",
    en: "Radio name (optional)",
  },
  googleDomain: {
    ca: "Domini de Google (escola.org)",
    es: "Dominio de Google (escuela.org)",
    en: "Google domain (school.org)",
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
