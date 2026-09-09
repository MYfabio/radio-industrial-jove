/** Textos de la pantalla d'acceptació de les condicions d'ús (AcceptTermsGate). */
import { defineMessages } from "../index";

export const acceptTermsGateMessages = defineMessages({
  title: {
    ca: "Abans de continuar",
    es: "Antes de continuar",
    en: "Before you continue",
  },
  // El paràgraf d'introducció va en tres trossos perquè l'enllaç a les condicions és al mig.
  introBefore: {
    ca: "Aquest panell et permet aprovar i publicar contingut de l'alumnat. Com a docent o coordinador/a, ets tu qui en supervisa i n'és responsable — llegeix les",
    es: "Este panel te permite aprobar y publicar contenido del alumnado. Como docente o coordinador/a, eres tú quien lo supervisa y responde de él — lee las",
    en: "This panel lets you approve and publish student content. As a teacher or coordinator, you are the one who supervises it and is responsible for it — read the",
  },
  termsLink: {
    ca: "condicions d'ús",
    es: "condiciones de uso",
    en: "terms of use",
  },
  introAfter: {
    ca: "abans de fer-ho servir.",
    es: "antes de usarlo.",
    en: "before using it.",
  },
  checkboxLabel: {
    ca: "He llegit i accepto les condicions d'ús, i entenc que la supervisió i responsabilitat del contingut que aprovi és meva.",
    es: "He leído y acepto las condiciones de uso, y entiendo que la supervisión y la responsabilidad del contenido que apruebe son mías.",
    en: "I have read and accept the terms of use, and I understand that I am responsible for supervising the content I approve.",
  },
  accept: {
    ca: "Accepto i continuo",
    es: "Acepto y continúo",
    en: "Accept and continue",
  },
});
