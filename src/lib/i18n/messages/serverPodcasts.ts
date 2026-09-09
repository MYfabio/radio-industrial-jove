/**
 * Missatges que retornen a la interfície les funcions de servidor de pòdcasts,
 * sol·licituds d'accés i l'edició amb IA. Es tradueixen amb la llengua de la
 * galeta de la petició (vegeu src/lib/i18n/server.ts).
 */
import { defineMessages } from "../index";

export const serverPodcastsMessages = defineMessages({
  // podcasts.functions.ts
  schoolNotFound: {
    ca: "Aquesta escola no existeix.",
    es: "Este centro no existe.",
    en: "This school does not exist.",
  },
  classCodeUnknown: {
    ca: "Aquest codi no correspon a cap classe.",
    es: "Este código no corresponde a ninguna clase.",
    en: "This code does not match any class.",
  },
  docentOnly: {
    ca: "Aquest panell només és per a docents o coordinadors.",
    es: "Este panel es solo para docentes o coordinadores.",
    en: "This panel is for teachers or coordinators only.",
  },

  // accessRequests.functions.ts
  nameRequired: {
    ca: "Posa-hi el teu nom.",
    es: "Escribe tu nombre.",
    en: "Enter your name.",
  },
  emailInvalid: {
    ca: "Posa-hi un correu vàlid.",
    es: "Escribe un correo válido.",
    en: "Enter a valid email address.",
  },
  schoolNameRequired: {
    ca: "Posa-hi el nom del centre.",
    es: "Escribe el nombre del centro.",
    en: "Enter the name of the school.",
  },
  superAdminOnly: {
    ca: "Aquest panell només és per al super admin.",
    es: "Este panel es solo para el superadministrador.",
    en: "This panel is for the super admin only.",
  },

  // routes/api/ai-edit.ts
  aiMissingAudio: {
    ca: "Falta l'àudio",
    es: "Falta el audio",
    en: "The audio is missing",
  },
  aiDefaultTitle: { ca: "El meu pòdcast", es: "Mi pódcast", en: "My podcast" },
  aiNoVoiceTitle: {
    ca: "Gravació sense veu detectada",
    es: "Grabación sin voz detectada",
    en: "Recording with no voice detected",
  },
  /** Última línia de la instrucció a la IA: la llengua en què ha d'escriure. */
  aiWriteIn: {
    ca: "Escriu sempre en català.",
    es: "Escribe siempre en castellano.",
    en: "Always write in English.",
  },
});
