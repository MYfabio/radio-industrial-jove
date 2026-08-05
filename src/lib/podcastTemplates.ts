/**
 * Plantilles de pòdcast: guien l'alumne amb durada objectiu,
 * guió d'intro/outro, passos i efectes recomanats.
 */
import type { EffectId } from "./soundEffects";

export interface TemplateStep {
  titulo: string;
  segundos: number;
  guion: string;
}

export interface PodcastTemplate {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  duracionObjetivo: number; // segons
  intro: string;
  outro: string;
  pasos: TemplateStep[];
  efectos: EffectId[];
}

export const TEMPLATES: PodcastTemplate[] = [
  {
    id: "noticies",
    nombre: "Notícies de classe",
    emoji: "📰",
    descripcion: "Tres notícies curtes de l'escola amb entradeta i comiat.",
    duracionObjetivo: 180,
    intro:
      "Hola! Benvinguts i benvingudes a la Ràdio Escolar. Sóc [el teu nom] i avui et porto les notícies de la nostra classe.",
    outro: "I això ha estat tot per avui. Ens escoltem al pròxim programa!",
    pasos: [
      { titulo: "Sintonia i salutació", segundos: 20, guion: "Fes sonar la campana i digues la intro." },
      { titulo: "Notícia 1", segundos: 45, guion: "Què va passar, qui, quan i on." },
      { titulo: "Notícia 2", segundos: 45, guion: "Una altra notícia diferent, amb una dada curiosa." },
      { titulo: "Notícia 3", segundos: 45, guion: "La més divertida, per acabar amb energia." },
      { titulo: "Comiat", segundos: 25, guion: "Fes un resum i digues l'outro amb aplaudiments." },
    ],
    efectos: ["campana", "aplausos", "whoosh"],
  },
  {
    id: "entrevista",
    nombre: "Entrevista",
    emoji: "🎙️",
    descripcion: "Parla amb un company, un mestre o un familiar amb 4 preguntes.",
    duracionObjetivo: 300,
    intro:
      "Benvinguts a la Ràdio Escolar. Avui tinc un convidat molt especial: [nom del convidat]. Hola, gràcies per venir!",
    outro: "Moltíssimes gràcies per acompanyar-nos. Fins a la pròxima entrevista!",
    pasos: [
      { titulo: "Presentació", segundos: 30, guion: "Digues qui és el convidat i per què l'entrevistes." },
      { titulo: "Pregunta 1", segundos: 60, guion: "Qui ets i a què et dediques?" },
      { titulo: "Pregunta 2", segundos: 60, guion: "Què és el que més t'agrada del que fas?" },
      { titulo: "Pregunta 3", segundos: 60, guion: "Explica'ns una anècdota divertida." },
      { titulo: "Pregunta 4", segundos: 60, guion: "Quin consell ens dónes?" },
      { titulo: "Tancament", segundos: 30, guion: "Dóna les gràcies i llança els aplaudiments." },
    ],
    efectos: ["aplausos", "campana", "risa"],
  },
  {
    id: "conte",
    nombre: "Conte sonor",
    emoji: "📚",
    descripcion: "Narra una història curta fent servir efectes per ambientar.",
    duracionObjetivo: 240,
    intro: "Hi havia una vegada... Benvinguts al conte d'avui a la Ràdio Escolar.",
    outro: "I conte contat, aquest conte s'ha acabat. Fins al pròxim!",
    pasos: [
      { titulo: "Presentació del conte", segundos: 30, guion: "Títol i personatges." },
      { titulo: "Plantejament", segundos: 60, guion: "On passa i què passa al principi." },
      { titulo: "Nus", segundos: 90, guion: "El problema. Fes servir efectes per donar emoció." },
      { titulo: "Desenllaç", segundos: 45, guion: "Com es resol tot." },
      { titulo: "Moralitat i comiat", segundos: 15, guion: "Què n'aprenem, del conte." },
    ],
    efectos: ["whoosh", "tambor", "campana"],
  },
  {
    id: "recomanacio",
    nombre: "Recomanació exprés",
    emoji: "⭐",
    descripcion: "Un pòdcast rapidíssim per recomanar un llibre, una peli o un joc.",
    duracionObjetivo: 90,
    intro: "Hola! En un minut t'explico per què has de provar això.",
    outro: "Ja ho saps: prova-ho i m'ho expliques. Adéu!",
    pasos: [
      { titulo: "Salutació", segundos: 10, guion: "Digues el teu nom i què recomanaràs." },
      { titulo: "De què va", segundos: 30, guion: "Explica-ho sense revelar el final." },
      { titulo: "Per què mola", segundos: 35, guion: "Dues raons per provar-ho." },
      { titulo: "Nota i comiat", segundos: 15, guion: "Posa-hi nota de l'1 al 10 i acomiada't." },
    ],
    efectos: ["whoosh", "aplausos"],
  },
];
