import { defineMessages } from "../index";

/** Portada (src/routes/index.tsx). */
export const homeMessages = defineMessages({
  // <head>
  metaTitle: {
    ca: "{site} — Recurs educatiu de ràdio i pòdcast per a escoles",
    es: "{site} — Recurso educativo de radio y pódcast para escuelas",
    en: "{site} — Educational radio and podcast resource for schools",
  },
  metaDescription: {
    ca: "Estudi de pòdcast escolar en línia: alumnes graven amb efectes de so, editen amb IA i publiquen al mur de la classe amb supervisió del professorat. Gratuït i fàcil per a qualsevol escola.",
    es: "Estudio de pódcast escolar en línea: el alumnado graba con efectos de sonido, edita con IA y publica en el muro de la clase con la supervisión del profesorado. Gratuito y fácil para cualquier escuela.",
    en: "Online school podcast studio: students record with sound effects, edit with AI and publish to the class wall under teacher supervision. Free and easy for any school.",
  },
  ogTitle: {
    ca: "{site} — Ràdio i pòdcast escolar",
    es: "{site} — Radio y pódcast escolar",
    en: "{site} — School radio and podcasts",
  },
  ogDescription: {
    ca: "Recurs educatiu perquè l'alumnat gravi, editi amb IA i publiqui pòdcasts de classe, amb supervisió del professorat.",
    es: "Recurso educativo para que el alumnado grabe, edite con IA y publique pódcasts de clase, con la supervisión del profesorado.",
    en: "An educational resource for students to record, edit with AI and publish class podcasts, under teacher supervision.",
  },
  jsonLdDescription: {
    ca: "Estudi de ràdio i pòdcast escolar en línia, obert a qualsevol centre educatiu: gravació amb efectes, edició amb IA i mur de pòdcasts de classe.",
    es: "Estudio de radio y pódcast escolar en línea, abierto a cualquier centro educativo: grabación con efectos, edición con IA y muro de pódcasts de clase.",
    en: "Online school radio and podcast studio, open to any school: recording with effects, AI editing and a class podcast wall.",
  },

  // Capçalera
  classWallLink: {
    ca: "Mur de la classe",
    es: "Muro de la clase",
    en: "Class wall",
  },

  // Hero
  heroBadge: {
    ca: "Recurs educatiu gratuït per a escoles",
    es: "Recurso educativo gratuito para escuelas",
    en: "Free educational resource for schools",
  },
  heroTitle: {
    ca: "La ràdio escolar de la teva classe, sense instal·lar res",
    es: "La radio escolar de tu clase, sin instalar nada",
    en: "Your class's school radio, nothing to install",
  },
  heroLead: {
    ca: "{tagline}: grava amb efectes de so, edita amb IA i publica pòdcasts al mur de la classe, amb supervisió del professorat en tot moment.",
    es: "{tagline}: graba con efectos de sonido, edita con IA y publica pódcasts en el muro de la clase, con la supervisión del profesorado en todo momento.",
    en: "{tagline}: record with sound effects, edit with AI and publish podcasts to the class wall, with teacher supervision at every step.",
  },
  enterStudio: {
    ca: "Entra a l'estudi",
    es: "Entra en el estudio",
    en: "Enter the studio",
  },
  listenWall: {
    ca: "Escolta el mur",
    es: "Escucha el muro",
    en: "Listen to the wall",
  },
  heroNote: {
    ca: 'No cal compte per gravar i publicar. Inicia sessió amb Google només si vols la teva pròpia classe o "El meu espai".',
    es: 'No hace falta cuenta para grabar y publicar. Inicia sesión con Google solo si quieres tu propia clase o "Mi espacio".',
    en: 'No account needed to record and publish. Sign in with Google only if you want your own class or "My space".',
  },

  // Com funciona
  howItWorks: { ca: "Com funciona", es: "Cómo funciona", en: "How it works" },
  step1Title: { ca: "1. Grava", es: "1. Graba", en: "1. Record" },
  step1Desc: {
    ca: "Tria una plantilla (entrevista, notícies, ficció...), segueix la guia pas a pas i grava amb efectes de so en directe.",
    es: "Elige una plantilla (entrevista, noticias, ficción...), sigue la guía paso a paso y graba con efectos de sonido en directo.",
    en: "Pick a template (interview, news, fiction...), follow the step-by-step guide and record with live sound effects.",
  },
  step2Title: {
    ca: "2. Edita amb IA",
    es: "2. Edita con IA",
    en: "2. Edit with AI",
  },
  step2Desc: {
    ca: "Un clic i la IA retalla silencis, transcriu la veu i proposa un títol, un resum i capítols.",
    es: "Un clic y la IA recorta los silencios, transcribe la voz y propone un título, un resumen y capítulos.",
    en: "One click and the AI trims silences, transcribes the audio and suggests a title, a summary and chapters.",
  },
  step3Title: {
    ca: "3. El mestre revisa",
    es: "3. El docente revisa",
    en: "3. The teacher reviews",
  },
  step3Desc: {
    ca: "El professorat escolta, deixa un comentari privat i decideix quan surt publicat.",
    es: "El profesorado escucha, deja un comentario privado y decide cuándo se publica.",
    en: "Teachers listen, leave a private comment and decide when it goes live.",
  },
  step4Title: {
    ca: "4. Surt al mur",
    es: "4. Sale en el muro",
    en: "4. It goes on the wall",
  },
  step4Desc: {
    ca: "El pòdcast es publica al mur de la classe, amb caràtula pròpia i llest per escoltar.",
    es: "El pódcast se publica en el muro de la clase, con su propia carátula y listo para escuchar.",
    en: "The podcast is published on the class wall, with its own cover art and ready to listen to.",
  },

  // Per a qui
  studentsTitle: {
    ca: "Per a l'alumnat",
    es: "Para el alumnado",
    en: "For students",
  },
  studentsPoint1: {
    ca: "Grava sense necessitat de crear cap compte.",
    es: "Graba sin necesidad de crear ninguna cuenta.",
    en: "Record without creating an account.",
  },
  studentsPoint2: {
    ca: "Plantilles i guions perquè cap alumne es quedi en blanc.",
    es: "Plantillas y guiones para que ningún alumno se quede en blanco.",
    en: "Templates and scripts so no student is left staring at a blank page.",
  },
  studentsPoint3: {
    ca: "Galeria de sons compartida amb tota la classe.",
    es: "Galería de sonidos compartida con toda la clase.",
    en: "A sound gallery shared with the whole class.",
  },
  studentsPoint4: {
    ca: 'Amb Google: "El meu espai" per gestionar els teus pòdcasts i preferits.',
    es: 'Con Google: "Mi espacio" para gestionar tus pódcasts y favoritos.',
    en: 'With Google: "My space" to manage your podcasts and favourites.',
  },
  teachersTitle: {
    ca: "Per al professorat",
    es: "Para el profesorado",
    en: "For teachers",
  },
  teachersPoint1: {
    ca: "Panell de revisió: escolta, comenta i aprova abans de publicar.",
    es: "Panel de revisión: escucha, comenta y aprueba antes de publicar.",
    en: "Review panel: listen, comment and approve before publishing.",
  },
  teachersPoint2: {
    ca: "Classes amb codi d'invitació: cada pòdcast queda etiquetat amb el grup.",
    es: "Clases con código de invitación: cada pódcast queda etiquetado con el grupo.",
    en: "Classes with an invite code: every podcast is tagged with its group.",
  },
  teachersPoint3: {
    ca: "Control total de qui pot veure el mur (només l'escola o obert a fora).",
    es: "Control total de quién puede ver el muro (solo la escuela o abierto al exterior).",
    en: "Full control over who can see the wall (school only or open to everyone).",
  },
  teachersPoint4: {
    ca: "Cap eina externa a instal·lar: funciona directament al navegador.",
    es: "Ninguna herramienta externa que instalar: funciona directamente en el navegador.",
    en: "Nothing to install: it runs right in the browser.",
  },

  // Extres
  featureAi: {
    ca: "Edició automàtica amb IA",
    es: "Edición automática con IA",
    en: "Automatic AI editing",
  },
  featureCovers: {
    ca: "Caràtules amb plantilla de Canva",
    es: "Carátulas con plantilla de Canva",
    en: "Cover art from a Canva template",
  },
  featureSounds: {
    ca: "Galeria de sons compartida",
    es: "Galería de sonidos compartida",
    en: "Shared sound gallery",
  },
  featurePrivate: {
    ca: "Mur privat de l'escola per defecte",
    es: "Muro privado de la escuela por defecto",
    en: "Private school wall by default",
  },

  // CTA final
  ctaTitle: {
    ca: "Fem ràdio a la teva escola?",
    es: "¿Hacemos radio en tu escuela?",
    en: "Shall we make radio at your school?",
  },
  ctaText: {
    ca: "Comença a gravar ara mateix, sense registrar-te. Si ets docent, inicia sessió amb Google per crear la teva classe i tenir un codi d'invitació per als alumnes.",
    es: "Empieza a grabar ahora mismo, sin registrarte. Si eres docente, inicia sesión con Google para crear tu clase y tener un código de invitación para el alumnado.",
    en: "Start recording right now, no sign-up needed. If you are a teacher, sign in with Google to create your class and get an invite code for your students.",
  },
  ctaSchoolQuestion: {
    ca: "Voleu que hi entri el centre sencer?",
    es: "¿Queréis que entre todo el centro?",
    en: "Want to bring the whole school on board?",
  },
  ctaSchoolLink: {
    ca: "Demaneu l'alta del vostre centre",
    es: "Solicitad el alta de vuestro centro",
    en: "Request access for your school",
  },

  // Peu
  footerOpen: {
    ca: "Recurs educatiu obert",
    es: "Recurso educativo abierto",
    en: "Open educational resource",
  },
  footerTeacherSignup: {
    ca: "Ets docent? Registra't",
    es: "¿Eres docente? Regístrate",
    en: "Are you a teacher? Sign up",
  },
  footerHelp: { ca: "Ajuda", es: "Ayuda", en: "Help" },
  footerPrivacy: { ca: "Privacitat", es: "Privacidad", en: "Privacy" },
  footerTerms: {
    ca: "Condicions d'ús",
    es: "Condiciones de uso",
    en: "Terms of use",
  },
  footerTeacherPanel: {
    ca: "Panell del mestre",
    es: "Panel del docente",
    en: "Teacher panel",
  },
});
