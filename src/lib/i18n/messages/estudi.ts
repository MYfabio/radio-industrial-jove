/**
 * Textos de l'estudi de gravació (/estudi): capçalera i metadades, missatges
 * d'error, etiquetes dels efectes i de la música de fons, i el guió imprimible.
 * Les plantilles de pòdcast tenen el seu propi diccionari més avall.
 */
import { defineMessages } from "../index";

export const estudiMessages = defineMessages({
  // <head>
  metaTitle: {
    ca: "{site} — Grava el teu pòdcast amb ona i efectes",
    es: "{site} — Graba tu pódcast con onda y efectos",
    en: "{site} — Record your podcast with a live waveform and effects",
  },
  metaDescription: {
    ca: "Estudi de ràdio per a alumnes: grava la teva veu, mira l'ona en directe, llaça aplaudiments i efectes, i edita el pòdcast automàticament.",
    es: "Estudio de radio para alumnos: graba tu voz, mira la onda en directo, lanza aplausos y efectos, y edita el pódcast automáticamente.",
    en: "A radio studio for students: record your voice, watch the live waveform, fire off applause and sound effects, and edit the podcast automatically.",
  },
  ogTitle: {
    ca: "{site} — Estudi de pòdcast",
    es: "{site} — Estudio de pódcast",
    en: "{site} — Podcast studio",
  },
  ogDescription: {
    ca: "Grava pòdcast amb ona en directe, botons d'efectes i edició automàtica.",
    es: "Graba pódcast con onda en directo, botones de efectos y edición automática.",
    en: "Record podcasts with a live waveform, sound-effect buttons and automatic editing.",
  },

  // Capçalera
  tagline: {
    ca: "Grava el teu pòdcast, afegeix-hi efectes i edita amb un clic.",
    es: "Graba tu pódcast, añádele efectos y edítalo con un clic.",
    en: "Record your podcast, add effects and edit with one click.",
  },
  classWall: {
    ca: "Mur de la classe",
    es: "Muro de la clase",
    en: "Class wall",
  },
  teacher: { ca: "Mestre", es: "Docente", en: "Teacher" },
  statusRecording: { ca: "En antena", es: "En el aire", en: "On air" },
  statusPaused: { ca: "En pausa", es: "En pausa", en: "Paused" },
  statusDone: { ca: "Llest", es: "Listo", en: "Done" },
  statusIdle: { ca: "A punt", es: "A punto", en: "Ready" },

  // Columna 1: plantilla i guia
  step1Title: {
    ca: "1. Tria una plantilla",
    es: "1. Elige una plantilla",
    en: "1. Pick a template",
  },
  targetDuration: {
    ca: "Objectiu {time}",
    es: "Objetivo {time}",
    en: "Target {time}",
  },
  guideOf: { ca: "Guia de {name}", es: "Guía de {name}", en: "{name} guide" },
  introHeading: {
    ca: "Intro (llegeix-la tal qual)",
    es: "Intro (léela tal cual)",
    en: "Intro (read it word for word)",
  },
  outroHeading: {
    ca: "Outro (per acomiadar-te)",
    es: "Outro (para despedirte)",
    en: "Outro (to sign off)",
  },
  recommendedEffects: {
    ca: "Efectes recomanats",
    es: "Efectos recomendados",
    en: "Recommended effects",
  },
  resources: { ca: "Recursos", es: "Recursos", en: "Resources" },
  canvaTemplate: {
    ca: "Plantilla de caràtula (Canva)",
    es: "Plantilla de carátula (Canva)",
    en: "Cover template (Canva)",
  },
  freesoundLink: {
    ca: "Busca sons i efectes (Freesound)",
    es: "Busca sonidos y efectos (Freesound)",
    en: "Find sounds and effects (Freesound)",
  },
  freesoundHint: {
    ca: "A Freesound tria sons amb llicència CC0 (domini públic) o comprova que la llicència permeti el teu ús, i que el so sigui adequat per a classe.",
    es: "En Freesound elige sonidos con licencia CC0 (dominio público) o comprueba que la licencia permita tu uso, y que el sonido sea adecuado para clase.",
    en: "On Freesound, pick sounds with a CC0 (public domain) licence or check that the licence allows your use, and that the sound is suitable for class.",
  },
  resizeCol1: {
    ca: "Canvia l'amplada de la primera columna",
    es: "Cambia el ancho de la primera columna",
    en: "Resize the first column",
  },
  resizeCol3: {
    ca: "Canvia l'amplada de la tercera columna",
    es: "Cambia el ancho de la tercera columna",
    en: "Resize the third column",
  },

  // Columna 2: pista de gravació
  step2Title: {
    ca: "2. Pista de gravació",
    es: "2. Pista de grabación",
    en: "2. Recording track",
  },
  pauseRecording: {
    ca: "Pausar la gravació",
    es: "Pausar la grabación",
    en: "Pause the recording",
  },
  resumeRecording: {
    ca: "Continuar la gravació",
    es: "Continuar la grabación",
    en: "Resume the recording",
  },
  startRecording: {
    ca: "Començar a gravar",
    es: "Empezar a grabar",
    en: "Start recording",
  },
  btnPause: { ca: "Pausa", es: "Pausa", en: "Pause" },
  btnResume: { ca: "Segueix", es: "Sigue", en: "Resume" },
  btnRecord: { ca: "Gravar", es: "Grabar", en: "Record" },
  recordHint: {
    ca: "Prem el botó gran per gravar i torna a prémer-lo per aturar-te un moment.",
    es: "Pulsa el botón grande para grabar y vuelve a pulsarlo para parar un momento.",
    en: "Press the big button to record and press it again to pause for a moment.",
  },
  finishRecording: {
    ca: "Acabar la gravació",
    es: "Terminar la grabación",
    en: "Finish the recording",
  },
  fewerOptions: {
    ca: "Menys opcions",
    es: "Menos opciones",
    en: "Fewer options",
  },
  moreOptions: { ca: "Més opcions", es: "Más opciones", en: "More options" },
  bgMusic: {
    ca: "Música de fons",
    es: "Música de fondo",
    en: "Background music",
  },
  stop: { ca: "Atura", es: "Detener", en: "Stop" },
  bgVolume: {
    ca: "Volum de la música",
    es: "Volumen de la música",
    en: "Music volume",
  },
  collabMode: {
    ca: "Mode col·laboratiu",
    es: "Modo colaborativo",
    en: "Collaborative mode",
  },
  twoMics: {
    ca: "Gravar amb dos micròfons",
    es: "Grabar con dos micrófonos",
    en: "Record with two microphones",
  },
  micA: { ca: "Micròfon A", es: "Micrófono A", en: "Microphone A" },
  micB: { ca: "Micròfon B", es: "Micrófono B", en: "Microphone B" },
  micDefault: { ca: "Per defecte", es: "Por defecto", en: "Default" },
  micN: { ca: "Micròfon {n}", es: "Micrófono {n}", en: "Microphone {n}" },

  // Efectes de so
  step3Title: {
    ca: "3. Efectes de so",
    es: "3. Efectos de sonido",
    en: "3. Sound effects",
  },
  fxVolume: {
    ca: "Volum dels efectes",
    es: "Volumen de los efectos",
    en: "Effects volume",
  },
  fxFade: {
    ca: "Entrada i sortida suau",
    es: "Entrada y salida suaves",
    en: "Fade in and out",
  },
  fxFadeDry: { ca: "sec", es: "seco", en: "dry" },
  playSound: {
    ca: "Reproduir {name}",
    es: "Reproducir {name}",
    en: "Play {name}",
  },
  deleteSound: {
    ca: "Esborrar {name}",
    es: "Borrar {name}",
    en: "Delete {name}",
  },
  fxAplausos: { ca: "Aplaudiments", es: "Aplausos", en: "Applause" },
  fxRisa: { ca: "Rialles", es: "Risas", en: "Laughter" },
  fxCampana: { ca: "Campana", es: "Campana", en: "Bell" },
  fxTada: { ca: "Tatxan!", es: "¡Tachán!", en: "Ta-da!" },
  fxPedo: { ca: "Bufa", es: "Pedorreta", en: "Toot" },
  fxTambor: { ca: "Timbal", es: "Tambor", en: "Drum" },
  fxWhoosh: { ca: "Transició", es: "Transición", en: "Whoosh" },
  bgCalma: { ca: "Calma", es: "Calma", en: "Calm" },
  bgCalmaDesc: {
    ca: "Acords suaus per llegir o explicar contes.",
    es: "Acordes suaves para leer o contar cuentos.",
    en: "Soft chords for reading or storytelling.",
  },
  bgNoticies: { ca: "Notícies", es: "Noticias", en: "News" },
  bgNoticiesDesc: {
    ca: "Pols rítmic discret per informatius i entrevistes.",
    es: "Pulso rítmico discreto para informativos y entrevistas.",
    en: "A subtle rhythmic pulse for news and interviews.",
  },

  // Sons de la classe (galeria compartida)
  classSounds: {
    ca: "Sons de la classe",
    es: "Sonidos de la clase",
    en: "Class sounds",
  },
  uploadSounds: { ca: "Pujar sons", es: "Subir sonidos", en: "Upload sounds" },
  galleryShared: {
    ca: "Galeria compartida: tothom de l'escola pot fer servir els sons que hi puja la classe.",
    es: "Galería compartida: todo el mundo de la escuela puede usar los sonidos que sube la clase.",
    en: "Shared gallery: everyone at school can use the sounds the class uploads.",
  },
  galleryLoginHint: {
    ca: "Inicia sessió per afegir-ne de nous.",
    es: "Inicia sesión para añadir nuevos.",
    en: "Sign in to add new ones.",
  },
  uploadKindEffect: {
    ca: "Efecte de so",
    es: "Efecto de sonido",
    en: "Sound effect",
  },
  dropMusic: {
    ca: "Arrossega aquí una pista de música (es reproduirà en bucle a la secció de música de fons).",
    es: "Arrastra aquí una pista de música (se reproducirá en bucle en la sección de música de fondo).",
    en: "Drop a music track here (it will loop in the background music section).",
  },
  dropSounds: {
    ca: "Arrossega aquí diversos sons alhora (o fes clic per triar-los).",
    es: "Arrastra aquí varios sonidos a la vez (o haz clic para elegirlos).",
    en: "Drop several sounds here at once (or click to choose them).",
  },
  loginToUpload: {
    ca: "Inicia sessió amb Google per afegir sons a la galeria compartida de la classe.",
    es: "Inicia sesión con Google para añadir sonidos a la galería compartida de la clase.",
    en: "Sign in with Google to add sounds to the class's shared gallery.",
  },
  uploadingOne: {
    ca: "Pujant {count} so...",
    es: "Subiendo {count} sonido...",
    en: "Uploading {count} sound...",
  },
  uploadingMany: {
    ca: "Pujant {count} sons...",
    es: "Subiendo {count} sonidos...",
    en: "Uploading {count} sounds...",
  },
  rejectedNotAudio: {
    ca: "{name} (no és àudio)",
    es: "{name} (no es audio)",
    en: "{name} (not an audio file)",
  },
  rejectedTooBig: {
    ca: "{name} (més de 8 MB)",
    es: "{name} (más de 8 MB)",
    en: "{name} (over 8 MB)",
  },
  rejectedUploadFailed: {
    ca: "{name} (no s'ha pogut pujar)",
    es: "{name} (no se ha podido subir)",
    en: "{name} (could not be uploaded)",
  },
  defaultSoundName: { ca: "El meu so", es: "Mi sonido", en: "My sound" },
  uploadedOne: {
    ca: "Fet! S'han afegit {count} so a la galeria.",
    es: "¡Hecho! Se ha añadido {count} sonido a la galería.",
    en: "Done! {count} sound was added to the gallery.",
  },
  uploadedMany: {
    ca: "Fet! S'han afegit {count} sons a la galeria.",
    es: "¡Hecho! Se han añadido {count} sonidos a la galería.",
    en: "Done! {count} sounds were added to the gallery.",
  },
  rejectedSummary: {
    ca: "No s'han pogut afegir: {list}.",
    es: "No se han podido añadir: {list}.",
    en: "Could not add: {list}.",
  },

  // Errors
  playFailed: {
    ca: 'No s\'ha pogut reproduir "{name}".',
    es: 'No se ha podido reproducir "{name}".',
    en: 'Could not play "{name}".',
  },
  deleteFailed: {
    ca: "No s'ha pogut esborrar el so.",
    es: "No se ha podido borrar el sonido.",
    en: "Could not delete the sound.",
  },
  micsFailed: {
    ca: "No s'han pogut llegir els micròfons. Dóna permís al navegador.",
    es: "No se han podido leer los micrófonos. Da permiso al navegador.",
    en: "Could not read the microphones. Allow access in your browser.",
  },
  bgFailed: {
    ca: "No s'ha pogut reproduir aquesta música.",
    es: "No se ha podido reproducir esta música.",
    en: "Could not play this music.",
  },
  micAccessFailed: {
    ca: "No s'ha pogut accedir al micròfon. Dóna permís al navegador i torna-ho a provar.",
    es: "No se ha podido acceder al micrófono. Da permiso al navegador y vuelve a intentarlo.",
    en: "Could not access the microphone. Allow access in your browser and try again.",
  },
  aiBusy: {
    ca: "La IA està molt ocupada ara mateix. Torna-ho a provar d'aquí a un minut.",
    es: "La IA está muy ocupada ahora mismo. Vuelve a intentarlo dentro de un minuto.",
    en: "The AI is very busy right now. Try again in a minute.",
  },
  aiNoCredits: {
    ca: "S'han esgotat els crèdits d'IA de l'espai de treball.",
    es: "Se han agotado los créditos de IA del espacio de trabajo.",
    en: "The workspace has run out of AI credits.",
  },
  aiFailed: {
    ca: "La IA no ha pogut editar el pòdcast: {body}",
    es: "La IA no ha podido editar el pódcast: {body}",
    en: "The AI could not edit the podcast: {body}",
  },
  autoEditFailed: {
    ca: "No s'ha pogut editar l'àudio automàticament. Prova de gravar-ho de nou.",
    es: "No se ha podido editar el audio automáticamente. Prueba a grabarlo de nuevo.",
    en: "Could not edit the audio automatically. Try recording it again.",
  },
  mp3Failed: {
    ca: "No s'ha pogut convertir a MP3. Prova de tornar a gravar.",
    es: "No se ha podido convertir a MP3. Prueba a grabar de nuevo.",
    en: "Could not convert to MP3. Try recording again.",
  },
  albumDefault: {
    ca: "Pòdcasts de classe",
    es: "Pódcasts de clase",
    en: "Class podcasts",
  },

  // Columna 3: el teu pòdcast
  step4Title: {
    ca: "4. El teu pòdcast",
    es: "4. Tu pódcast",
    en: "4. Your podcast",
  },
  finishedBanner: {
    ca: "Gravació acabada! Escolta-la aquí sota.",
    es: "¡Grabación terminada! Escúchala aquí abajo.",
    en: "Recording finished! Listen to it below.",
  },
  emptyHint: {
    ca: "Quan acabis la gravació, aquí la podràs escoltar, editar i descarregar.",
    es: "Cuando termines la grabación, aquí podrás escucharla, editarla y descargarla.",
    en: "When you finish recording, you'll be able to listen to it, edit it and download it here.",
  },
  originalRecording: {
    ca: "Gravació original",
    es: "Grabación original",
    en: "Original recording",
  },
  aiEditing: {
    ca: "La IA està editant...",
    es: "La IA está editando...",
    en: "The AI is editing...",
  },
  editing: { ca: "Editant...", es: "Editando...", en: "Editing..." },
  editWithAi: { ca: "Editar amb IA", es: "Editar con IA", en: "Edit with AI" },
  downloadOriginal: {
    ca: "Descarregar l'original",
    es: "Descargar el original",
    en: "Download the original",
  },
  editedVersion: {
    ca: "Versió editada · {time} (abans {before})",
    es: "Versión editada · {time} (antes {before})",
    en: "Edited version · {time} (was {before})",
  },
  downloadEdited: {
    ca: "Descarregar el pòdcast editat",
    es: "Descargar el pódcast editado",
    en: "Download the edited podcast",
  },
  aiListening: {
    ca: "La IA està escoltant el teu pòdcast...",
    es: "La IA está escuchando tu pódcast...",
    en: "The AI is listening to your podcast...",
  },
  aiSuggested: {
    ca: "Muntatge suggerit per la IA",
    es: "Montaje sugerido por la IA",
    en: "AI-suggested edit",
  },
  chapters: { ca: "Capítols", es: "Capítulos", en: "Chapters" },
  tipsNext: {
    ca: "Consells per a la pròxima",
    es: "Consejos para la próxima",
    en: "Tips for next time",
  },
  viewTranscript: {
    ca: "Veure la transcripció",
    es: "Ver la transcripción",
    en: "View the transcript",
  },
  step5Title: {
    ca: "5. Pre-escolta i exporta",
    es: "5. Preescucha y exporta",
    en: "5. Preview and export",
  },
  convertingMp3: {
    ca: "Convertint a MP3...",
    es: "Convirtiendo a MP3...",
    en: "Converting to MP3...",
  },
  exportMp3: {
    ca: "Exportar en MP3",
    es: "Exportar en MP3",
    en: "Export as MP3",
  },
  downloadFile: {
    ca: "Descarregar {name}",
    es: "Descargar {name}",
    en: "Download {name}",
  },
  step6Title: {
    ca: "6. Publica el pòdcast",
    es: "6. Publica el pódcast",
    en: "6. Publish the podcast",
  },
  publishIntro: {
    ca: "Omple la fitxa i envia'l a la ràdio de l'escola. El mestre el revisarà abans que surti al",
    es: "Rellena la ficha y envíalo a la radio de la escuela. El docente lo revisará antes de que salga en el",
    en: "Fill in the details and send it to the school radio. The teacher will review it before it appears on the",
  },
  publishIntroLink: {
    ca: "mur de la classe",
    es: "muro de la clase",
    en: "class wall",
  },

  // Guió imprimible (src/lib/printTemplate.ts)
  printScript: { ca: "Guió", es: "Guion", en: "Script" },
  printButton: {
    ca: "Imprimeix / Desa en PDF",
    es: "Imprimir / Guardar en PDF",
    en: "Print / Save as PDF",
  },
  printTarget: { ca: "objectiu", es: "objetivo", en: "target" },
  printSteps: {
    ca: "Guió pas a pas",
    es: "Guion paso a paso",
    en: "Step-by-step script",
  },
  printEffects: {
    ca: "Efectes de so recomanats",
    es: "Efectos de sonido recomendados",
    en: "Recommended sound effects",
  },
});

/**
 * Textos de les plantilles de pòdcast (src/lib/podcastTemplates.ts). Les claus
 * segueixen el patró `<id>Name`, `<id>Desc`, `<id>Intro`, `<id>Outro`,
 * `<id>Step<n>Title` i `<id>Step<n>Script` (n comença a 1), perquè l'estudi
 * les pugui resoldre a partir de l'identificador de la plantilla. Si s'afegeix
 * una plantilla nova, cal afegir-hi també les seves claus.
 */
export const estudiTemplateMessages = defineMessages({
  // Notícies de classe
  noticiesName: {
    ca: "Notícies de classe",
    es: "Noticias de clase",
    en: "Class news",
  },
  noticiesDesc: {
    ca: "Tres notícies curtes de l'escola amb entradeta i comiat.",
    es: "Tres noticias cortas de la escuela con entradilla y despedida.",
    en: "Three short school news items with an intro and a sign-off.",
  },
  noticiesIntro: {
    ca: "Hola! Benvinguts i benvingudes a la Ràdio Escolar. Sóc [el teu nom] i avui et porto les notícies de la nostra classe.",
    es: "¡Hola! Bienvenidos y bienvenidas a la Radio Escolar. Soy [tu nombre] y hoy te traigo las noticias de nuestra clase.",
    en: "Hello! Welcome to School Radio. I'm [your name] and today I bring you the news from our class.",
  },
  noticiesOutro: {
    ca: "I això ha estat tot per avui. Ens escoltem al pròxim programa!",
    es: "Y esto ha sido todo por hoy. ¡Nos escuchamos en el próximo programa!",
    en: "And that's all for today. See you on the next show!",
  },
  noticiesStep1Title: {
    ca: "Sintonia i salutació",
    es: "Sintonía y saludo",
    en: "Theme tune and greeting",
  },
  noticiesStep1Script: {
    ca: "Fes sonar la campana i digues la intro.",
    es: "Haz sonar la campana y di la intro.",
    en: "Ring the bell and read the intro.",
  },
  noticiesStep2Title: { ca: "Notícia 1", es: "Noticia 1", en: "News item 1" },
  noticiesStep2Script: {
    ca: "Què va passar, qui, quan i on.",
    es: "Qué pasó, quién, cuándo y dónde.",
    en: "What happened, who, when and where.",
  },
  noticiesStep3Title: { ca: "Notícia 2", es: "Noticia 2", en: "News item 2" },
  noticiesStep3Script: {
    ca: "Una altra notícia diferent, amb una dada curiosa.",
    es: "Otra noticia diferente, con un dato curioso.",
    en: "A different story, with a fun fact.",
  },
  noticiesStep4Title: { ca: "Notícia 3", es: "Noticia 3", en: "News item 3" },
  noticiesStep4Script: {
    ca: "La més divertida, per acabar amb energia.",
    es: "La más divertida, para acabar con energía.",
    en: "The funniest one, to finish with energy.",
  },
  noticiesStep5Title: { ca: "Comiat", es: "Despedida", en: "Sign-off" },
  noticiesStep5Script: {
    ca: "Fes un resum i digues l'outro amb aplaudiments.",
    es: "Haz un resumen y di el outro con aplausos.",
    en: "Sum up and read the outro with applause.",
  },

  // Entrevista
  entrevistaName: { ca: "Entrevista", es: "Entrevista", en: "Interview" },
  entrevistaDesc: {
    ca: "Parla amb un company, un mestre o un familiar amb 4 preguntes.",
    es: "Habla con un compañero, un profe o un familiar con 4 preguntas.",
    en: "Talk to a classmate, a teacher or a relative with 4 questions.",
  },
  entrevistaIntro: {
    ca: "Benvinguts a la Ràdio Escolar. Avui tinc un convidat molt especial: [nom del convidat]. Hola, gràcies per venir!",
    es: "Bienvenidos a la Radio Escolar. Hoy tengo un invitado muy especial: [nombre del invitado]. ¡Hola, gracias por venir!",
    en: "Welcome to School Radio. Today I have a very special guest: [guest's name]. Hello, thanks for coming!",
  },
  entrevistaOutro: {
    ca: "Moltíssimes gràcies per acompanyar-nos. Fins a la pròxima entrevista!",
    es: "Muchísimas gracias por acompañarnos. ¡Hasta la próxima entrevista!",
    en: "Thank you so much for joining us. Until the next interview!",
  },
  entrevistaStep1Title: {
    ca: "Presentació",
    es: "Presentación",
    en: "Introduction",
  },
  entrevistaStep1Script: {
    ca: "Digues qui és el convidat i per què l'entrevistes.",
    es: "Di quién es el invitado y por qué lo entrevistas.",
    en: "Say who the guest is and why you're interviewing them.",
  },
  entrevistaStep2Title: {
    ca: "Pregunta 1",
    es: "Pregunta 1",
    en: "Question 1",
  },
  entrevistaStep2Script: {
    ca: "Qui ets i a què et dediques?",
    es: "¿Quién eres y a qué te dedicas?",
    en: "Who are you and what do you do?",
  },
  entrevistaStep3Title: {
    ca: "Pregunta 2",
    es: "Pregunta 2",
    en: "Question 2",
  },
  entrevistaStep3Script: {
    ca: "Què és el que més t'agrada del que fas?",
    es: "¿Qué es lo que más te gusta de lo que haces?",
    en: "What do you like most about what you do?",
  },
  entrevistaStep4Title: {
    ca: "Pregunta 3",
    es: "Pregunta 3",
    en: "Question 3",
  },
  entrevistaStep4Script: {
    ca: "Explica'ns una anècdota divertida.",
    es: "Cuéntanos una anécdota divertida.",
    en: "Tell us a funny story.",
  },
  entrevistaStep5Title: {
    ca: "Pregunta 4",
    es: "Pregunta 4",
    en: "Question 4",
  },
  entrevistaStep5Script: {
    ca: "Quin consell ens dónes?",
    es: "¿Qué consejo nos das?",
    en: "What advice would you give us?",
  },
  entrevistaStep6Title: { ca: "Tancament", es: "Cierre", en: "Closing" },
  entrevistaStep6Script: {
    ca: "Dóna les gràcies i llança els aplaudiments.",
    es: "Da las gracias y lanza los aplausos.",
    en: "Say thank you and fire off the applause.",
  },

  // Conte sonor
  conteName: { ca: "Conte sonor", es: "Cuento sonoro", en: "Sound story" },
  conteDesc: {
    ca: "Narra una història curta fent servir efectes per ambientar.",
    es: "Narra una historia corta usando efectos para ambientar.",
    en: "Tell a short story using sound effects to set the scene.",
  },
  conteIntro: {
    ca: "Hi havia una vegada... Benvinguts al conte d'avui a la Ràdio Escolar.",
    es: "Había una vez... Bienvenidos al cuento de hoy en la Radio Escolar.",
    en: "Once upon a time... Welcome to today's story on School Radio.",
  },
  conteOutro: {
    ca: "I conte contat, aquest conte s'ha acabat. Fins al pròxim!",
    es: "Y colorín colorado, este cuento se ha acabado. ¡Hasta el próximo!",
    en: "And that's the end of the tale. Until the next one!",
  },
  conteStep1Title: {
    ca: "Presentació del conte",
    es: "Presentación del cuento",
    en: "Introducing the story",
  },
  conteStep1Script: {
    ca: "Títol i personatges.",
    es: "Título y personajes.",
    en: "Title and characters.",
  },
  conteStep2Title: { ca: "Plantejament", es: "Planteamiento", en: "Setup" },
  conteStep2Script: {
    ca: "On passa i què passa al principi.",
    es: "Dónde pasa y qué pasa al principio.",
    en: "Where it happens and what happens at the start.",
  },
  conteStep3Title: { ca: "Nus", es: "Nudo", en: "Conflict" },
  conteStep3Script: {
    ca: "El problema. Fes servir efectes per donar emoció.",
    es: "El problema. Usa efectos para dar emoción.",
    en: "The problem. Use effects to add excitement.",
  },
  conteStep4Title: { ca: "Desenllaç", es: "Desenlace", en: "Resolution" },
  conteStep4Script: {
    ca: "Com es resol tot.",
    es: "Cómo se resuelve todo.",
    en: "How it all gets resolved.",
  },
  conteStep5Title: {
    ca: "Moralitat i comiat",
    es: "Moraleja y despedida",
    en: "Moral and sign-off",
  },
  conteStep5Script: {
    ca: "Què n'aprenem, del conte.",
    es: "Qué aprendemos del cuento.",
    en: "What the story teaches us.",
  },

  // Recomanació exprés
  recomanacioName: {
    ca: "Recomanació exprés",
    es: "Recomendación exprés",
    en: "Quick recommendation",
  },
  recomanacioDesc: {
    ca: "Un pòdcast rapidíssim per recomanar un llibre, una peli o un joc.",
    es: "Un pódcast rapidísimo para recomendar un libro, una peli o un juego.",
    en: "A super-quick podcast to recommend a book, a film or a game.",
  },
  recomanacioIntro: {
    ca: "Hola! En un minut t'explico per què has de provar això.",
    es: "¡Hola! En un minuto te explico por qué tienes que probar esto.",
    en: "Hi! In one minute I'll tell you why you have to try this.",
  },
  recomanacioOutro: {
    ca: "Ja ho saps: prova-ho i m'ho expliques. Adéu!",
    es: "Ya lo sabes: pruébalo y me cuentas. ¡Adiós!",
    en: "Now you know: try it and let me know. Bye!",
  },
  recomanacioStep1Title: { ca: "Salutació", es: "Saludo", en: "Greeting" },
  recomanacioStep1Script: {
    ca: "Digues el teu nom i què recomanaràs.",
    es: "Di tu nombre y qué vas a recomendar.",
    en: "Say your name and what you're going to recommend.",
  },
  recomanacioStep2Title: {
    ca: "De què va",
    es: "De qué va",
    en: "What it's about",
  },
  recomanacioStep2Script: {
    ca: "Explica-ho sense revelar el final.",
    es: "Explícalo sin revelar el final.",
    en: "Explain it without giving away the ending.",
  },
  recomanacioStep3Title: {
    ca: "Per què mola",
    es: "Por qué mola",
    en: "Why it's cool",
  },
  recomanacioStep3Script: {
    ca: "Dues raons per provar-ho.",
    es: "Dos razones para probarlo.",
    en: "Two reasons to try it.",
  },
  recomanacioStep4Title: {
    ca: "Nota i comiat",
    es: "Nota y despedida",
    en: "Rating and sign-off",
  },
  recomanacioStep4Script: {
    ca: "Posa-hi nota de l'1 al 10 i acomiada't.",
    es: "Ponle nota del 1 al 10 y despídete.",
    en: "Give it a score from 1 to 10 and say goodbye.",
  },
});
