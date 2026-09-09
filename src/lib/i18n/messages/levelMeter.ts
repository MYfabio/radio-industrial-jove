/** Textos del mesurador de veu en directe (LevelMeter). */
import { defineMessages } from "../index";

export const levelMeterMessages = defineMessages({
  // Avisos segons el nivell
  silence: {
    ca: "No et sento — parla més a prop del micròfon",
    es: "No te oigo — habla más cerca del micrófono",
    en: "I can't hear you — speak closer to the microphone",
  },
  tooQuiet: {
    ca: "Massa fluix — acosta't o parla més alt",
    es: "Demasiado bajo — acércate o habla más alto",
    en: "Too quiet — come closer or speak up",
  },
  perfect: {
    ca: "Volum perfecte! Continua així",
    es: "¡Volumen perfecto! Sigue así",
    en: "Perfect volume! Keep it up",
  },
  tooLoud: {
    ca: "Massa fort — allunya't una mica del micròfon",
    es: "Demasiado alto — aléjate un poco del micrófono",
    en: "Too loud — move a little away from the microphone",
  },

  // Etiquetes de la barra
  voiceLevel: { ca: "Nivell de veu", es: "Nivel de voz", en: "Voice level" },
  scaleQuiet: { ca: "Fluix", es: "Bajo", en: "Quiet" },
  scaleGood: { ca: "Bé", es: "Bien", en: "Good" },
  scaleLoud: { ca: "Massa fort", es: "Demasiado alto", en: "Too loud" },
});
