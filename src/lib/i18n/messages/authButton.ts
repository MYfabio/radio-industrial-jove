import { defineMessages } from "../index";

export const authButtonMessages = defineMessages({
  signIn: {
    ca: "Entra amb Google",
    es: "Entrar con Google",
    en: "Sign in with Google",
  },
  signInShort: { ca: "Entra", es: "Entrar", en: "Sign in" },
  mySpace: { ca: "El meu espai", es: "Mi espacio", en: "My space" },
  coordinadorPanel: {
    ca: "Panell de coordinador",
    es: "Panel de coordinación",
    en: "Coordinator panel",
  },
  superAdminPanel: {
    ca: "Panell de super admin",
    es: "Panel de superadministración",
    en: "Super admin panel",
  },
  teacherPanel: {
    ca: "Panell del mestre",
    es: "Panel del docente",
    en: "Teacher panel",
  },
  joinClass: {
    ca: "Uneix-te a una classe",
    es: "Unirse a una clase",
    en: "Join a class",
  },
  myClasses: { ca: "Les meves classes", es: "Mis clases", en: "My classes" },
  wantDocent: {
    ca: "Vull ser docent",
    es: "Quiero ser docente",
    en: "I want to be a teacher",
  },
  wantSchool: {
    ca: "Vull donar d'alta un centre",
    es: "Quiero dar de alta un centro",
    en: "I want to register a school",
  },
  signOut: { ca: "Surt", es: "Salir", en: "Sign out" },
});

export const joinClassMessages = defineMessages({
  title: {
    ca: "Uneix-te a una classe",
    es: "Unirse a una clase",
    en: "Join a class",
  },
  titleWithClasses: {
    ca: "Les meves classes",
    es: "Mis clases",
    en: "My classes",
  },
  description: {
    ca: "Demana al teu mestre el codi de la classe.",
    es: "Pide a tu docente el código de la clase.",
    en: "Ask your teacher for the class code.",
  },
  descriptionWithClasses: {
    ca: "Els pòdcasts que publiquis van a la classe activa. Pots ser de més d'una classe: afegeix-ne una altra amb el seu codi.",
    es: "Los pódcasts que publiques van a la clase activa. Puedes estar en más de una clase: añade otra con su código.",
    en: "Podcasts you publish go to the active class. You can be in more than one class: add another with its code.",
  },
  active: { ca: "Activa", es: "Activa", en: "Active" },
  makeActive: { ca: "Fes-la activa", es: "Activar", en: "Make active" },
  codePlaceholder: {
    ca: "Codi de 6 caràcters",
    es: "Código de 6 caracteres",
    en: "6-character code",
  },
  join: { ca: "Uneix-te", es: "Unirse", en: "Join" },
  joined: {
    ca: "T'has unit a «{name}»!",
    es: "¡Te has unido a «{name}»!",
    en: 'You joined "{name}"!',
  },
  joinError: {
    ca: "No s'ha pogut unir a la classe.",
    es: "No se ha podido unir a la clase.",
    en: "Could not join the class.",
  },
  loading: { ca: "Carregant...", es: "Cargando...", en: "Loading..." },
});
