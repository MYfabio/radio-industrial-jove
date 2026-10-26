/** Guia «Gravar en parella amb dos cascos USB» (pàgina d'ajuda i full imprimible). */
import { defineMessages } from "../index";

export const guideMessages = defineMessages({
  title: {
    ca: "Gravar en parella amb dos cascos USB",
    es: "Grabar en pareja con dos cascos USB",
    en: "Recording in pairs with two USB headsets",
  },
  intro: {
    ca: "Guia ràpida per gravar dues persones alhora, cadascuna amb el seu casc, i sentir-vos tots dos mentre parleu.",
    es: "Guía rápida para grabar a dos personas a la vez, cada una con su casco, y oíros los dos mientras habláis.",
    en: "Quick guide to record two people at once, each with their own headset, hearing each other while you talk.",
  },
  print: {
    ca: "Imprimeix o desa en PDF",
    es: "Imprimir o guardar en PDF",
    en: "Print or save as PDF",
  },

  needTitle: { ca: "Què necessites", es: "Qué necesitas", en: "What you need" },
  need1: {
    ca: "Dos cascos USB amb micròfon (millor tancats, que tapin l'orella).",
    es: "Dos cascos USB con micrófono (mejor cerrados, que tapen la oreja).",
    en: "Two USB headsets with a microphone (closed-back ones are best).",
  },
  need2: {
    ca: "Un ordinador amb Chrome o Edge. A Safari no es pot triar per on surt el so.",
    es: "Un ordenador con Chrome o Edge. En Safari no se puede elegir por dónde sale el sonido.",
    en: "A computer with Chrome or Edge. Safari cannot choose where sound comes out.",
  },
  need3: {
    ca: "Un lloc tranquil: tanqueu la porta i allunyeu-vos de finestres i ventiladors.",
    es: "Un sitio tranquilo: cerrad la puerta y alejaos de ventanas y ventiladores.",
    en: "A quiet place: close the door and move away from windows and fans.",
  },

  setupTitle: {
    ca: "Muntatge en 6 passos",
    es: "Montaje en 6 pasos",
    en: "Setup in 6 steps",
  },
  setup1: {
    ca: "Connecta el primer casc i entra a l'estudi. Si els dos cascos són iguals, connecta el segon més tard (pas 4).",
    es: "Conecta el primer casco y entra en el estudio. Si los dos cascos son iguales, conecta el segundo más tarde (paso 4).",
    en: "Plug in the first headset and open the studio. If both headsets are the same model, plug the second one in later (step 4).",
  },
  setup2: {
    ca: "Prem «Més opcions» i activa «Diversos micròfons». Quan el navegador ho demani, dona permís al micròfon.",
    es: "Pulsa «Més opcions» y activa «Diversos micròfons». Cuando el navegador lo pida, da permiso al micrófono.",
    en: 'Press "Més opcions" and turn on "Diversos micròfons". When the browser asks, allow the microphone.',
  },
  setup3: {
    ca: "A «Micro 1», tria el primer casc.",
    es: "En «Micro 1», elige el primer casco.",
    en: 'In "Micro 1", choose the first headset.',
  },
  setup4: {
    ca: "Connecta el segon casc i, a «Micro 2», tria el que acaba d'aparèixer. Si tenen el mateix nom, l'estudi els numera: (1) i (2).",
    es: "Conecta el segundo casco y, en «Micro 2», elige el que acaba de aparecer. Si tienen el mismo nombre, el estudio los numera: (1) y (2).",
    en: 'Plug in the second headset and pick the one that just appeared in "Micro 2". If both have the same name, the studio numbers them: (1) and (2).',
  },
  setup5: {
    ca: "A «Sortides d'auriculars», marca els dos cascos perquè tots dos sentiu el mateix.",
    es: "En «Sortides d'auriculars», marca los dos cascos para que los dos oigáis lo mismo.",
    en: 'In "Sortides d\'auriculars", tick both headsets so you both hear the same thing.',
  },
  setup6: {
    ca: "Prem «Prova els micros» i parleu per torns. Ajusteu el volum de cada micro fins que soneu igual de forts.",
    es: "Pulsa «Prova els micros» y hablad por turnos. Ajustad el volumen de cada micro hasta que sonéis igual de fuertes.",
    en: 'Press "Prova els micros" and take turns speaking. Adjust each mic\'s volume until you sound equally loud.',
  },

  tipsTitle: {
    ca: "Per gravar bé",
    es: "Para grabar bien",
    en: "To record well",
  },
  tip1: {
    ca: "Micro a dos dits de la boca i una mica de costat, perquè les «p» i les «b» no peten.",
    es: "Micro a dos dedos de la boca y un poco de lado, para que las «p» y las «b» no peten.",
    en: 'Keep the mic two fingers from your mouth and slightly to the side, so "p" and "b" sounds don\'t pop.',
  },
  tip2: {
    ca: "Parleu per torns i deixeu acabar l'altre: si parleu alhora, no s'entén res.",
    es: "Hablad por turnos y dejad terminar al otro: si habláis a la vez, no se entiende nada.",
    en: "Take turns and let the other person finish: talking over each other is hard to follow.",
  },
  tip3: {
    ca: "Ajusteu els volums durant la prova, no mentre graveu.",
    es: "Ajustad los volúmenes durante la prueba, no mientras grabáis.",
    en: "Set levels during the test, not while recording.",
  },
  tip4: {
    ca: "La música de fons, fluixa: s'ha de sentir la veu per sobre.",
    es: "La música de fondo, flojita: la voz se tiene que oír por encima.",
    en: "Keep background music low: the voice must sit on top.",
  },

  fixTitle: {
    ca: "Si alguna cosa falla",
    es: "Si algo falla",
    en: "If something goes wrong",
  },
  fix1Q: {
    ca: "Només se sent per una orella.",
    es: "Solo se oye por una oreja.",
    en: "I only hear it in one ear.",
  },
  fix1A: {
    ca: "Al micro afectat, canvia «Entrada» a «Només entrada 1» (o 2). El panorama ha d'estar a «Centre».",
    es: "En el micro afectado, cambia «Entrada» a «Només entrada 1» (o 2). El panorama tiene que estar en «Centre».",
    en: 'On that mic, set "Entrada" to "Només entrada 1" (or 2). Pan should be on "Centre".',
  },
  fix2Q: {
    ca: "No sento el meu company.",
    es: "No oigo a mi compañero.",
    en: "I can't hear my partner.",
  },
  fix2A: {
    ca: "Comprova que «Sentir la veu dels micros» està activat i que el teu casc està marcat a «Sortides d'auriculars».",
    es: "Comprueba que «Sentir la veu dels micros» está activado y que tu casco está marcado en «Sortides d'auriculars».",
    en: 'Check that "Sentir la veu dels micros" is on and that your headset is ticked under "Sortides d\'auriculars".',
  },
  fix3Q: {
    ca: "Se sent un xiulet fort.",
    es: "Se oye un pitido fuerte.",
    en: "There is a loud howl.",
  },
  fix3A: {
    ca: "Algú fa servir altaveus. Feu servir només cascos, o desactiveu «Sentir la veu dels micros».",
    es: "Alguien usa altavoces. Usad solo cascos, o desactivad «Sentir la veu dels micros».",
    en: 'Someone is using speakers. Use headsets only, or turn off "Sentir la veu dels micros".',
  },
  fix4Q: {
    ca: "Un casc s'ha desconnectat mentre gravàvem.",
    es: "Un casco se ha desconectado mientras grabábamos.",
    en: "A headset got unplugged while recording.",
  },
  fix4A: {
    ca: "Torna'l a connectar: l'estudi el recupera sol i la gravació continua.",
    es: "Vuelve a conectarlo: el estudio lo recupera solo y la grabación sigue.",
    en: "Plug it back in: the studio picks it up again and the recording carries on.",
  },
  fix5Q: {
    ca: "No surt la llista de cascos.",
    es: "No sale la lista de cascos.",
    en: "The headset list is empty.",
  },
  fix5A: {
    ca: "Fes servir Chrome o Edge i dona permís al micròfon. Després prem «Prova els micros» un cop.",
    es: "Usa Chrome o Edge y da permiso al micrófono. Después pulsa «Prova els micros» una vez.",
    en: 'Use Chrome or Edge and allow the microphone. Then press "Prova els micros" once.',
  },

  fix6Q: {
    ca: "Em sento a mi mateix amb eco.",
    es: "Me oigo a mí mismo con eco.",
    en: "I hear myself with an echo.",
  },
  fix6A: {
    ca: "Deixa «Sentir-me a mi mateix» desactivat i comprova que cada casc està aparellat amb el seu micro. A Windows, desactiva «Escolta aquest dispositiu» (Configuració → So → el micro → Propietats → Escolta) i, si el programa del casc en té, el «sidetone» o retorn del micro.",
    es: "Deja «Sentir-me a mi mateix» desactivado y comprueba que cada casco está emparejado con su micro. En Windows, desactiva «Escuchar este dispositivo» (Configuración → Sonido → el micro → Propiedades → Escuchar) y, si el programa del casco lo tiene, el «sidetone» o retorno del micro.",
    en: 'Leave "Sentir-me a mi mateix" off and check each headset is paired with its own mic. On Windows, turn off "Listen to this device" (Settings → Sound → the mic → Properties → Listen) and, if the headset software has one, the mic "sidetone".',
  },
  ruleTitle: { ca: "Norma d'or", es: "Norma de oro", en: "Golden rule" },
  rule: {
    ca: "Sempre cascos, mai altaveus: la veu tornaria al micro i xiularia.",
    es: "Siempre cascos, nunca altavoces: la voz volvería al micro y pitaría.",
    en: "Always headsets, never speakers: the voice would loop back into the mic and howl.",
  },
});
