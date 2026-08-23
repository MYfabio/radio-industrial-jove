import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mic,
  Wand2,
  Users,
  GraduationCap,
  ShieldCheck,
  Radio,
  Palette,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/siteConfig";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  applicationCategory: "EducationalApplication",
  description:
    "Estudi de ràdio i pòdcast escolar en línia, obert a qualsevol centre educatiu: gravació amb efectes, edició amb IA i mur de pòdcasts de classe.",
  url: SITE_URL,
  isAccessibleForFree: true,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} — Recurs educatiu de ràdio i pòdcast per a escoles` },
      {
        name: "description",
        content:
          "Estudi de pòdcast escolar en línia: alumnes graven amb efectes de so, editen amb IA i publiquen al mur de la classe amb supervisió del professorat. Gratuït i fàcil per a qualsevol escola.",
      },
      { property: "og:title", content: `${SITE_NAME} — Ràdio i pòdcast escolar` },
      {
        property: "og:description",
        content:
          "Recurs educatiu perquè l'alumnat gravi, editi amb IA i publiqui pòdcasts de classe, amb supervisió del professorat.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
    scripts: [
      {
        tag: "script",
        attrs: { type: "application/ld+json" },
        children: JSON.stringify(JSON_LD),
      },
    ],
  }),
  component: LandingPage,
});

const STEPS = [
  {
    icon: Mic,
    title: "1. Grava",
    desc: "Tria una plantilla (entrevista, notícies, ficció...), segueix la guia pas a pas i grava amb efectes de so en directe.",
  },
  {
    icon: Wand2,
    title: "2. Edita amb IA",
    desc: "Un clic i la IA retalla silencis, transcriu la veu i proposa un títol, un resum i capítols.",
  },
  {
    icon: GraduationCap,
    title: "3. El mestre revisa",
    desc: "El professorat escolta, deixa un comentari privat i decideix quan surt publicat.",
  },
  {
    icon: Radio,
    title: "4. Surt al mur",
    desc: "El pòdcast es publica al mur de la classe, amb caràtula pròpia i llest per escoltar.",
  },
];

const AUDIENCES = [
  {
    icon: Users,
    title: "Per a l'alumnat",
    points: [
      "Grava sense necessitat de crear cap compte.",
      "Plantilles i guions perquè cap alumne es quedi en blanc.",
      "Galeria de sons compartida amb tota la classe.",
      "Amb Google: \"El meu espai\" per gestionar els teus pòdcasts i preferits.",
    ],
  },
  {
    icon: GraduationCap,
    title: "Per al professorat",
    points: [
      "Panell de revisió: escolta, comenta i aprova abans de publicar.",
      "Classes amb codi d'invitació: cada pòdcast queda etiquetat amb el grup.",
      "Control total de qui pot veure el mur (només l'escola o obert a fora).",
      "Cap eina externa a instal·lar: funciona directament al navegador.",
    ],
  },
];

function LandingPage() {
  return (
    <main className="studio-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <Logo className="size-10 shrink-0" />
            <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
            <Link
              to="/mur"
              className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:inline-flex"
            >
              Mur de la classe
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-10 flex flex-col items-center gap-6 text-center sm:mt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <ShieldCheck className="size-3.5" /> Recurs educatiu gratuït per a escoles
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            La ràdio escolar de la teva classe, sense instal·lar res
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {SITE_TAGLINE}: grava amb efectes de so, edita amb IA i publica pòdcasts al mur de la classe, amb
            supervisió del professorat en tot moment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/estudi"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Mic className="size-4" /> Entra a l'estudi
            </Link>
            <Link
              to="/mur"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary"
            >
              Escolta el mur <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            No cal compte per gravar i publicar. Inicia sessió amb Google només si vols la teva pròpia classe o
            "El meu espai".
          </p>
        </section>

        {/* Com funciona */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Com funciona
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <s.icon className="size-6 text-accent" />
                <h3 className="mt-3 text-sm font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Per a qui */}
        <section className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-2">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <a.icon className="size-5" />
                </span>
                <h3 className="text-base font-bold">{a.title}</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Extra features */}
        <section className="mt-16 flex flex-wrap items-center justify-center gap-2 text-center sm:mt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Wand2 className="size-3.5 text-accent" /> Edició automàtica amb IA
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Palette className="size-3.5 text-accent" /> Caràtules amb plantilla de Canva
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Users className="size-3.5 text-accent" /> Galeria de sons compartida
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <ShieldCheck className="size-3.5 text-accent" /> Mur privat de l'escola per defecte
          </span>
        </section>

        {/* CTA final */}
        <section className="mt-16 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center sm:mt-24 sm:p-10">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Fem ràdio a la teva escola?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Comença a gravar ara mateix, sense registrar-te. Si ets docent, inicia sessió amb Google per crear la
            teva classe i tenir un codi d'invitació per als alumnes.
          </p>
          <Link
            to="/estudi"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <Mic className="size-4" /> Entra a l'estudi
          </Link>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border py-6 text-xs text-muted-foreground">
          <span>{SITE_NAME} · Recurs educatiu obert</span>
          <Link to="/registre" className="hover:underline">
            Ets docent? Registra't
          </Link>
          <Link to="/ajuda" className="hover:underline">
            Ajuda
          </Link>
          <Link to="/privacitat" className="hover:underline">
            Privacitat
          </Link>
          <Link to="/termes" className="hover:underline">
            Condicions d'ús
          </Link>
          <Link to="/mestre" className="hover:underline">
            Panell del mestre
          </Link>
        </footer>
      </div>
    </main>
  );
}
