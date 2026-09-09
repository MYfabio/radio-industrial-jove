import { defineMessages } from "../index";

export const privacitatMessages = defineMessages({
  metaTitle: {
    ca: "Política de privacitat — {siteName}",
    es: "Política de privacidad — {siteName}",
    en: "Privacy policy — {siteName}",
  },
  title: {
    ca: "Política de privacitat",
    es: "Política de privacidad",
    en: "Privacy policy",
  },
  updated: {
    ca: "Darrera actualització: agost de 2026",
    es: "Última actualización: agosto de 2026",
    en: "Last updated: August 2026",
  },

  s1Title: {
    ca: "Qui és el responsable de les dades",
    es: "Quién es el responsable de los datos",
    en: "Who is responsible for the data",
  },
  s1P1: {
    ca: "{siteName} és un recurs educatiu obert: el centre educatiu que fa servir aquesta eina amb la seva classe n'és el responsable de les dades del seu alumnat. Per a qualsevol dubte tècnic sobre aquesta instal·lació pots escriure a",
    es: "{siteName} es un recurso educativo abierto: el centro educativo que usa esta herramienta con su clase es el responsable de los datos de su alumnado. Para cualquier duda técnica sobre esta instalación puedes escribir a",
    en: "{siteName} is an open educational resource: the school that uses this tool with its class is the controller of its students' data. For any technical questions about this installation you can write to",
  },

  s2Title: {
    ca: "Quines dades recollim",
    es: "Qué datos recogemos",
    en: "What data we collect",
  },
  s2Li1: {
    ca: "Nom, correu electrònic i foto de perfil del teu compte de Google, quan inicies sessió.",
    es: "Nombre, correo electrónico y foto de perfil de tu cuenta de Google, cuando inicias sesión.",
    en: "Name, email address and profile picture from your Google account, when you sign in.",
  },
  s2Li2: {
    ca: "El teu rol (alumne, docent o coordinador/a) i la classe a la qual pertanys, si t'hi has unit.",
    es: "Tu rol (alumno, docente o coordinador/a) y la clase a la que perteneces, si te has unido a ella.",
    en: "Your role (student, teacher or coordinator) and the class you belong to, if you have joined one.",
  },
  s2Li3: {
    ca: "Els pòdcasts que graves i publiques: àudio, títol, descripció, categoria i caràtula.",
    es: "Los pódcasts que grabas y publicas: audio, título, descripción, categoría y carátula.",
    en: "The podcasts you record and publish: audio, title, description, category and cover art.",
  },
  s2Li4: {
    ca: "Els sons que puges a la galeria compartida de la classe.",
    es: "Los sonidos que subes a la galería compartida de la clase.",
    en: "The sounds you upload to the class's shared gallery.",
  },
  s2Li5: {
    ca: "Els pòdcasts que marques com a preferits.",
    es: "Los pódcasts que marcas como favoritos.",
    en: "The podcasts you mark as favourites.",
  },
  s2Note: {
    ca: "Pots fer servir l'estudi de gravació i escoltar el mur sense iniciar sessió: no cal donar cap dada personal per gravar i publicar un pòdcast de manera anònima.",
    es: "Puedes usar el estudio de grabación y escuchar el muro sin iniciar sesión: no hace falta dar ningún dato personal para grabar y publicar un pódcast de manera anónima.",
    en: "You can use the recording studio and listen to the wall without signing in: no personal data is needed to record and publish a podcast anonymously.",
  },

  s3Title: {
    ca: "Per què les fem servir",
    es: "Para qué los usamos",
    en: "Why we use it",
  },
  s3P1: {
    ca: 'Únicament per al funcionament del projecte educatiu: identificar-te, mostrar el teu rol i classe, deixar que revisis i gestionis els teus propis pòdcasts a "El meu espai", i perquè el professorat pugui revisar i publicar els pòdcasts de la classe abans que surtin al mur.',
    es: 'Únicamente para el funcionamiento del proyecto educativo: identificarte, mostrar tu rol y clase, dejar que revises y gestiones tus propios pódcasts en "Mi espacio", y para que el profesorado pueda revisar y publicar los pódcasts de la clase antes de que salgan en el muro.',
    en: 'Solely for the operation of the educational project: to identify you, show your role and class, let you review and manage your own podcasts in "My space", and so that teachers can review and publish the class\'s podcasts before they appear on the wall.',
  },

  s4Title: {
    ca: "On es desen",
    es: "Dónde se guardan",
    en: "Where it is stored",
  },
  s4P1: {
    ca: "Les dades es desen en una base de dades Postgres allotjada a Railway i la identificació es fa amb Supabase Auth (inici de sessió amb Google). No es venen ni es cedeixen a cap altra empresa amb finalitats comercials o publicitàries.",
    es: "Los datos se guardan en una base de datos Postgres alojada en Railway y la identificación se hace con Supabase Auth (inicio de sesión con Google). No se venden ni se ceden a ninguna otra empresa con fines comerciales o publicitarios.",
    en: "Data is stored in a Postgres database hosted on Railway and authentication is handled by Supabase Auth (sign in with Google). It is not sold or transferred to any other company for commercial or advertising purposes.",
  },

  s5Title: {
    ca: "Qui pot veure els pòdcasts",
    es: "Quién puede ver los pódcasts",
    en: "Who can see the podcasts",
  },
  s5P1: {
    ca: "Per defecte, el mur només és visible per a comptes del domini de l'escola. El coordinador o coordinadora del centre pot activar que el mur sigui públic per compartir els pòdcasts fora de l'escola; en aquest cas, els pòdcasts aprovats (àudio, títol, descripció i caràtula) esdevenen visibles per a qualsevol persona amb l'enllaç.",
    es: "Por defecto, el muro solo es visible para cuentas del dominio de la escuela. El coordinador o coordinadora del centro puede activar que el muro sea público para compartir los pódcasts fuera de la escuela; en ese caso, los pódcasts aprobados (audio, título, descripción y carátula) pasan a ser visibles para cualquier persona con el enlace.",
    en: "By default, the wall is only visible to accounts on the school's domain. The school's coordinator can make the wall public to share podcasts outside the school; in that case, approved podcasts (audio, title, description and cover art) become visible to anyone with the link.",
  },

  s6Title: { ca: "Els teus drets", es: "Tus derechos", en: "Your rights" },
  s6P1: {
    ca: 'Pots demanar en qualsevol moment veure, corregir o esborrar les teves dades i els teus pòdcasts. Des de "El meu espai" pots editar o esborrar els teus pòdcasts tu mateix/a. Per a qualsevol altra petició (per exemple, esborrar el teu compte per complet), demana-ho al teu centre educatiu o escriu-nos a',
    es: 'Puedes pedir en cualquier momento ver, corregir o borrar tus datos y tus pódcasts. Desde "Mi espacio" puedes editar o borrar tus pódcasts tú mismo/a. Para cualquier otra petición (por ejemplo, borrar tu cuenta por completo), pídelo a tu centro educativo o escríbenos a',
    en: 'You can ask at any time to see, correct or delete your data and your podcasts. From "My space" you can edit or delete your podcasts yourself. For any other request (for example, deleting your account completely), ask your school or write to us at',
  },

  s7Title: {
    ca: "Alumnat menor d'edat",
    es: "Alumnado menor de edad",
    en: "Underage students",
  },
  s7P1: {
    ca: "L'ús d'aquesta eina a classe es fa sota la supervisió del professorat, dins del marc de consentiment que cada centre educatiu gestiona amb les famílies per a les seves eines digitals.",
    es: "El uso de esta herramienta en clase se hace bajo la supervisión del profesorado, dentro del marco de consentimiento que cada centro educativo gestiona con las familias para sus herramientas digitales.",
    en: "This tool is used in class under the supervision of teachers, within the consent framework that each school manages with families for its digital tools.",
  },

  backHome: {
    ca: "← Torna a l'inici",
    es: "← Volver al inicio",
    en: "← Back to home",
  },
});
