/**
 * Missatges que les funcions de servidor retornen a la interfície (errors de
 * validació i de permisos). Es tradueixen amb la llengua de la galeta de la
 * petició (vegeu src/lib/i18n/server.ts).
 */
import { defineMessages } from "../index";

export const serverMessages = defineMessages({
  superAdminOnly: {
    ca: "Aquest panell només és per al super admin.",
    es: "Este panel es solo para el superadministrador.",
    en: "This panel is for the super admin only.",
  },
  coordinadorOnly: {
    ca: "Aquest panell només és per al coordinador o coordinadora.",
    es: "Este panel es solo para la persona coordinadora.",
    en: "This panel is for the coordinator only.",
  },
  docentOnly: {
    ca: "Aquest panell només és per a docents o coordinadors.",
    es: "Este panel es solo para docentes o coordinadores.",
    en: "This panel is for teachers or coordinators only.",
  },
  noSchool: {
    ca: "El teu compte no està vinculat a cap escola.",
    es: "Tu cuenta no está vinculada a ningún centro.",
    en: "Your account is not linked to any school.",
  },
  schoolGone: {
    ca: "Aquesta escola ja no existeix.",
    es: "Este centro ya no existe.",
    en: "This school no longer exists.",
  },
  schoolNameRequired: {
    ca: "Posa-hi un nom per al centre.",
    es: "Escribe un nombre para el centro.",
    en: "Enter a name for the school.",
  },
  domainInvalid: {
    ca: "Posa-hi un domini de Google vàlid (p. ex. escola.org).",
    es: "Escribe un dominio de Google válido (p. ej. escuela.org).",
    en: "Enter a valid Google domain (e.g. school.org).",
  },
  domainTaken: {
    ca: "Ja hi ha una escola donada d'alta amb aquest domini.",
    es: "Ya hay un centro dado de alta con este dominio.",
    en: "A school with this domain already exists.",
  },
  coordinadorEmailRequired: {
    ca: "Posa-hi el correu del coordinador o coordinadora.",
    es: "Escribe el correo de la persona coordinadora.",
    en: "Enter the coordinator's email address.",
  },
  emailInvalid: {
    ca: "Posa-hi un correu vàlid.",
    es: "Escribe un correo válido.",
    en: "Enter a valid email address.",
  },
  radioNameRequired: {
    ca: "Posa-hi un nom per a la ràdio.",
    es: "Escribe un nombre para la radio.",
    en: "Enter a name for the radio.",
  },
  roleInvalid: {
    ca: "Aquest rol no existeix.",
    es: "Este rol no existe.",
    en: "This role does not exist.",
  },
  notLoggedYet: {
    ca: "Aquesta persona encara no ha iniciat sessió a la plataforma. Demana-li que ho faci un cop amb Google i torna-ho a provar.",
    es: "Esta persona aún no ha iniciado sesión en la plataforma. Pídele que entre una vez con Google y vuelve a intentarlo.",
    en: "This person has not signed in yet. Ask them to sign in once with Google and try again.",
  },
  cannotChangeSelf: {
    ca: "No pots canviar el teu propi rol ni treure't de l'escola.",
    es: "No puedes cambiar tu propio rol ni quitarte del centro.",
    en: "You cannot change your own role or remove yourself from the school.",
  },
  memberNotFound: {
    ca: "Aquesta persona no és membre de l'escola.",
    es: "Esta persona no es miembro del centro.",
    en: "This person is not a member of the school.",
  },
  inviteNotFound: {
    ca: "Aquesta invitació ja no existeix.",
    es: "Esta invitación ya no existe.",
    en: "This invitation no longer exists.",
  },
  importEmpty: {
    ca: "El fitxer no té cap fila amb correu.",
    es: "El archivo no tiene ninguna fila con correo.",
    en: "The file has no rows with an email address.",
  },
  importTooMany: {
    ca: "Massa files: importa com a màxim {max} persones de cop.",
    es: "Demasiadas filas: importa como máximo {max} personas a la vez.",
    en: "Too many rows: import at most {max} people at a time.",
  },
  classCreateForbidden: {
    ca: "Només un docent o coordinador pot crear una classe.",
    es: "Solo un docente o coordinador puede crear una clase.",
    en: "Only a teacher or coordinator can create a class.",
  },
  classNameRequired: {
    ca: "Posa-hi un nom per a la classe.",
    es: "Escribe un nombre para la clase.",
    en: "Enter a name for the class.",
  },
  classCodeUnknown: {
    ca: "Aquest codi no correspon a cap classe.",
    es: "Este código no corresponde a ninguna clase.",
    en: "This code does not match any class.",
  },
  classNotYours: {
    ca: "Només qui l'ha creada (o el coordinador del centre) pot esborrar aquesta classe.",
    es: "Solo quien la ha creado (o la persona coordinadora del centro) puede eliminar esta clase.",
    en: "Only its creator (or the school coordinator) can delete this class.",
  },
  classHasPodcasts: {
    ca: "Aquesta classe té {count} pòdcast(s): no es pot esborrar. Treu-los primer des del panell del mestre.",
    es: "Esta clase tiene {count} pódcast(s): no se puede eliminar. Quítalos antes desde el panel del docente.",
    en: "This class has {count} podcast(s) and cannot be deleted. Remove them first from the teacher panel.",
  },
  notMemberOfClass: {
    ca: "No ets membre d'aquesta classe.",
    es: "No eres miembro de esta clase.",
    en: "You are not a member of this class.",
  },
  codeUnique: {
    ca: "No s'ha pogut generar un codi d'invitació únic. Torna-ho a provar.",
    es: "No se ha podido generar un código de invitación único. Vuelve a intentarlo.",
    en: "Could not generate a unique invite code. Please try again.",
  },
});
