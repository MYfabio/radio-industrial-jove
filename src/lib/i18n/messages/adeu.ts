/** Pantalla que es veu en tancar la sessió (/adeu). */
import { defineMessages } from "../index";

export const adeuMessages = defineMessages({
  metaTitle: { ca: "Fins aviat!", es: "¡Hasta pronto!", en: "See you soon!" },
  eyebrow: {
    ca: "Sessió tancada",
    es: "Sesión cerrada",
    en: "Signed out",
  },
  title: { ca: "Fins aviat!", es: "¡Hasta pronto!", en: "See you soon!" },
  lead: {
    ca: "Has sortit del teu compte en aquest navegador. Els teus pòdcasts i les teves classes segueixen ben desats: hi tornaràs a ser quan entris un altre cop.",
    es: "Has salido de tu cuenta en este navegador. Tus pódcasts y tus clases siguen bien guardados: volverás a tenerlos cuando entres otra vez.",
    en: "You have signed out of this browser. Your podcasts and classes are safe: they will be right there when you sign in again.",
  },
  sharedDeviceTitle: {
    ca: "Ordinador compartit?",
    es: "¿Ordenador compartido?",
    en: "Shared computer?",
  },
  sharedDeviceText: {
    ca: "Si estàs a l'aula d'informàtica, tanca també la finestra del navegador perquè ningú entri amb el teu compte de Google.",
    es: "Si estás en el aula de informática, cierra también la ventana del navegador para que nadie entre con tu cuenta de Google.",
    en: "If you are in a computer room, close the browser window too so nobody can use your Google account.",
  },
  signIn: { ca: "Torna a entrar", es: "Volver a entrar", en: "Sign in again" },
  home: {
    ca: "Anar a la portada",
    es: "Ir a la portada",
    en: "Go to the home page",
  },
  wall: {
    ca: "Escoltar el mur",
    es: "Escuchar el muro",
    en: "Listen to the wall",
  },
});
