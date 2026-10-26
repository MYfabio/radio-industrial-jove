/** Taula de mescles de l'estudi: micros, sortides i retorn d'auriculars. */
import { defineMessages } from "../index";

export const mixerMessages = defineMessages({
  howTo: {
    ca: "Com es fa? Guia per gravar amb dos cascos",
    es: "¿Cómo se hace? Guía para grabar con dos cascos",
    en: "How does it work? Guide to recording with two headsets",
  },
  multiMode: {
    ca: "Diversos micròfons",
    es: "Varios micrófonos",
    en: "Several microphones",
  },
  headphonesWarning: {
    ca: "Feu servir auriculars tancats, mai altaveus oberts: el retorn de veu per altaveus fa acoblament (xiulet).",
    es: "Usad auriculares cerrados, nunca altavoces abiertos: el retorno de voz por altavoces provoca acople (pitido).",
    en: "Use closed-back headphones, never open speakers: voice monitoring through speakers causes feedback (howling).",
  },

  micsTitle: { ca: "Micròfons", es: "Micrófonos", en: "Microphones" },
  micN: { ca: "Micro {n}", es: "Micro {n}", en: "Mic {n}" },
  micDefault: {
    ca: "Per defecte del sistema",
    es: "Predeterminado del sistema",
    en: "System default",
  },
  deviceN: { ca: "Dispositiu {n}", es: "Dispositivo {n}", en: "Device {n}" },
  inputChannel: { ca: "Entrada", es: "Entrada", en: "Input" },
  inputMix: { ca: "Barreja (1+2)", es: "Mezcla (1+2)", en: "Mix (1+2)" },
  inputLeft: {
    ca: "Només entrada 1",
    es: "Solo entrada 1",
    en: "Input 1 only",
  },
  inputRight: {
    ca: "Només entrada 2",
    es: "Solo entrada 2",
    en: "Input 2 only",
  },
  inputHint: {
    ca: "Si fas servir una interfície i la veu només entra per un canal, tria l'entrada on hi ha el micro.",
    es: "Si usas una interfaz y la voz solo entra por un canal, elige la entrada donde está el micro.",
    en: "If you use an interface and the voice only comes in on one channel, pick the input the mic is on.",
  },
  volume: { ca: "Volum", es: "Volumen", en: "Volume" },
  pan: { ca: "Panorama", es: "Panorama", en: "Pan" },
  panCenter: { ca: "Centre", es: "Centro", en: "Centre" },
  panLeft: { ca: "E", es: "I", en: "L" },
  panRight: { ca: "D", es: "D", en: "R" },
  addMic: { ca: "Afegeix un micro", es: "Añadir un micro", en: "Add a mic" },
  removeMic: {
    ca: "Treu aquest micro",
    es: "Quitar este micro",
    en: "Remove this mic",
  },
  disconnected: { ca: "Desconnectat", es: "Desconectado", en: "Disconnected" },
  monoSource: { ca: "mono", es: "mono", en: "mono" },
  processing: {
    ca: "Processament de veu (cancel·lació d'eco, soroll i guany automàtic)",
    es: "Procesado de voz (cancelación de eco, ruido y ganancia automática)",
    en: "Voice processing (echo cancellation, noise suppression, auto gain)",
  },
  processingHint: {
    ca: "Desactivat per defecte: a l'estudi amb auriculars sona millor i no retalla la veu.",
    es: "Desactivado por defecto: en el estudio con auriculares suena mejor y no recorta la voz.",
    en: "Off by default: in the studio with headphones it sounds better and does not clip the voice.",
  },

  outputsTitle: {
    ca: "Sortides d'auriculars",
    es: "Salidas de auriculares",
    en: "Headphone outputs",
  },
  outputsHint: {
    ca: "Pots marcar-ne més d'una: totes reben la mateixa mescla de retorn.",
    es: "Puedes marcar más de una: todas reciben la misma mezcla de retorno.",
    en: "You can tick more than one: all get the same monitor mix.",
  },
  outputDefault: {
    ca: "Sortida per defecte del sistema",
    es: "Salida predeterminada del sistema",
    en: "System default output",
  },
  outputUnsupported: {
    ca: "Aquest navegador no deixa triar la sortida d'àudio: el so sortirà per la sortida per defecte del sistema. Canvia-la a la configuració de so de l'ordinador, o fes servir Chrome o Edge per triar-ne una o més.",
    es: "Este navegador no permite elegir la salida de audio: el sonido saldrá por la salida predeterminada del sistema. Cámbiala en la configuración de sonido del ordenador, o usa Chrome o Edge para elegir una o varias.",
    en: "This browser cannot choose the audio output: sound will play on the system default output. Change it in the computer's sound settings, or use Chrome or Edge to choose one or more.",
  },
  outputElementOnly: {
    ca: "En aquest navegador les sortides funcionen, però amb una mica més de retard que a Chrome o Edge.",
    es: "En este navegador las salidas funcionan, pero con algo más de retardo que en Chrome o Edge.",
    en: "Outputs work in this browser, but with slightly more delay than in Chrome or Edge.",
  },
  noOutputsListed: {
    ca: "El navegador no mostra cap sortida. Prova els micros un cop (dona permís) i torna-ho a mirar.",
    es: "El navegador no muestra ninguna salida. Prueba los micros una vez (da permiso) y vuelve a mirarlo.",
    en: "The browser lists no outputs. Test the mics once (grant permission) and look again.",
  },
  outputFailed: {
    ca: "No s'ha pogut fer servir: {list}",
    es: "No se ha podido usar: {list}",
    en: "Could not use: {list}",
  },
  pairLabel: {
    ca: "Canals de la interfície",
    es: "Canales de la interfaz",
    en: "Interface channels",
  },
  pairOption: {
    ca: "Canals {a} i {b}",
    es: "Canales {a} y {b}",
    en: "Channels {a} and {b}",
  },
  pairHint: {
    ca: "La sortida principal té {n} canals: tria a quin parell va el retorn.",
    es: "La salida principal tiene {n} canales: elige a qué par va el retorno.",
    en: "The main output has {n} channels: choose which pair gets the monitor mix.",
  },

  monitorTitle: {
    ca: "Retorn als auriculars",
    es: "Retorno a los auriculares",
    en: "Headphone monitor",
  },
  monitorHint: {
    ca: "Només canvia el que se sent pels auriculars: no toca la gravació.",
    es: "Solo cambia lo que se oye por los auriculares: no toca la grabación.",
    en: "Only changes what you hear in the headphones: it does not affect the recording.",
  },
  monitorMicsOn: {
    ca: "Sentir la veu dels micros",
    es: "Oír la voz de los micros",
    en: "Hear the mics",
  },
  monitorMaster: {
    ca: "Volum general del retorn",
    es: "Volumen general del retorno",
    en: "Overall monitor volume",
  },
  monitorMics: {
    ca: "Veu dels micros",
    es: "Voz de los micros",
    en: "Mic voices",
  },
  monitorFx: {
    ca: "Música de fons i efectes",
    es: "Música de fondo y efectos",
    en: "Background music and effects",
  },

  testStart: {
    ca: "Prova els micros",
    es: "Probar los micros",
    en: "Test the mics",
  },
  testStop: {
    ca: "Atura la prova",
    es: "Parar la prueba",
    en: "Stop the test",
  },
  testHint: {
    ca: "Obre els micros i el retorn sense gravar, per ajustar volums abans de començar.",
    es: "Abre los micros y el retorno sin grabar, para ajustar volúmenes antes de empezar.",
    en: "Opens the mics and monitor without recording, to set levels before you start.",
  },
  micsFailed: {
    ca: "No s'han pogut obrir els micròfons. Revisa els permisos del navegador.",
    es: "No se han podido abrir los micrófonos. Revisa los permisos del navegador.",
    en: "Could not open the microphones. Check the browser permissions.",
  },
  pairIntro: {
    ca: "De qui és cada casc? Així cadascú sent els altres però no la seva pròpia veu (que tornaria amb retard, com un eco).",
    es: "¿De quién es cada casco? Así cada uno oye a los demás pero no su propia voz (que volvería con retardo, como un eco).",
    en: "Whose headset is each one? Then everyone hears the others but not their own voice (which would come back delayed, like an echo).",
  },
  pairAutoMic: {
    ca: "Automàtic: Micro {n}",
    es: "Automático: Micro {n}",
    en: "Automatic: Mic {n}",
  },
  pairAutoNone: {
    ca: "Automàtic: cap",
    es: "Automático: ninguno",
    en: "Automatic: none",
  },
  pairMic: {
    ca: "És del Micro {n}",
    es: "Es del Micro {n}",
    en: "Belongs to Mic {n}",
  },
  pairNone: {
    ca: "No és de cap micro",
    es: "No es de ningún micro",
    en: "Not paired with any mic",
  },
  selfMonitor: {
    ca: "Sentir-me a mi mateix",
    es: "Oírme a mí mismo",
    en: "Hear myself",
  },
  selfMonitorHint: {
    ca: "Desactivat, el teu casc no et retorna la teva veu i no hi ha eco. Activa-ho només si la vols sentir.",
    es: "Desactivado, tu casco no te devuelve tu voz y no hay eco. Actívalo solo si la quieres oír.",
    en: "When off, your headset does not play your own voice back, so there is no echo. Turn it on only if you want to hear it.",
  },
  latency: {
    ca: "Retard del retorn: ~{ms} ms",
    es: "Retardo del retorno: ~{ms} ms",
    en: "Monitor delay: ~{ms} ms",
  },
});
