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
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { WallLink } from "@/components/WallLink";
import { SchoolShowcase } from "@/components/SchoolShowcase";
import { SITE_NAME, siteTagline, SITE_URL } from "@/lib/siteConfig";
import { langFromMatches, tr, useLang, useT, type Lang } from "@/lib/i18n";
import { homeMessages as m } from "@/lib/i18n/messages/home";

/** L alta de centre es unica per a totes les apps i viu a aulaia.cat. */
const ALTA_URL = "https://www.aulaia.cat/alta?app=radio-escolar";

/** Adreça canònica de la portada (amb la barra final, com la serveix el domini). */
const HOME_URL = `${SITE_URL}/`;

/**
 * Preguntes freqüents de la portada. Les mateixes claus omplen el bloc visible
 * i el FAQPage de les dades estructurades: no n'hi pot haver cap que no es vegi.
 */
const FAQ = [
  { q: "faq1Q", a: "faq1A" },
  { q: "faq2Q", a: "faq2A" },
  { q: "faq3Q", a: "faq3A" },
  { q: "faq4Q", a: "faq4A" },
  { q: "faq5Q", a: "faq5A" },
] as const;

/** Dades estructurades (schema.org) de la portada, en la llengua del render. */
function jsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${HOME_URL}#web`,
        url: HOME_URL,
        name: SITE_NAME,
        inLanguage: lang,
        publisher: { "@id": "https://www.aulaia.cat/#organitzacio" },
      },
      {
        "@type": "WebApplication",
        "@id": `${HOME_URL}#app`,
        name: SITE_NAME,
        url: HOME_URL,
        description: tr(lang, m, "jsonLdDescription"),
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        browserRequirements: "Requereix un navegador modern amb accés al micròfon",
        inLanguage: lang,
        educationalLevel: ["Primària", "Secundària", "Batxillerat"],
        audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          "@id": "https://www.aulaia.cat/#organitzacio",
          name: "aulaia.cat",
          url: "https://www.aulaia.cat/",
        },
        isPartOf: { "@id": `${HOME_URL}#web` },
      },
      {
        "@type": "FAQPage",
        "@id": `${HOME_URL}#preguntes`,
        url: HOME_URL,
        inLanguage: lang,
        mainEntity: FAQ.map(({ q, a }) => ({
          "@type": "Question",
          name: tr(lang, m, q),
          acceptedAnswer: { "@type": "Answer", text: tr(lang, m, a) },
        })),
      },
    ],
  };
}

export const Route = createFileRoute("/")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    const title = tr(lang, m, "ogTitle", { site: SITE_NAME });
    const description = tr(lang, m, "ogDescription");
    return {
      meta: [
        { title: tr(lang, m, "metaTitle", { site: SITE_NAME }) },
        { name: "description", content: tr(lang, m, "metaDescription") },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: HOME_URL },
        // No hi ha cap imatge de previsualització adequada (només la icona SVG,
        // que les xarxes no accepten): targeta petita, sense imatge.
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        // TanStack només pinta a <head> el JSON-LD que va dins `meta`
        // (l'antic `scripts` del head no arribava a l'HTML).
        { "script:ld+json": jsonLd(lang) },
      ],
      links: [{ rel: "canonical", href: HOME_URL }],
    };
  },
  component: LandingPage,
});

/** `title`, `desc` i `points` són claus de `homeMessages`: el text es tradueix al render amb `t()`. */
const STEPS = [
  { icon: Mic, title: "step1Title", desc: "step1Desc" },
  { icon: Wand2, title: "step2Title", desc: "step2Desc" },
  { icon: GraduationCap, title: "step3Title", desc: "step3Desc" },
  { icon: Radio, title: "step4Title", desc: "step4Desc" },
] as const;

const AUDIENCES = [
  {
    icon: Users,
    title: "studentsTitle",
    points: ["studentsPoint1", "studentsPoint2", "studentsPoint3", "studentsPoint4"],
  },
  {
    icon: GraduationCap,
    title: "teachersTitle",
    points: ["teachersPoint1", "teachersPoint2", "teachersPoint3", "teachersPoint4"],
  },
] as const;

function LandingPage() {
  const t = useT(m);
  const { lang } = useLang();
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
            <LangToggle />
            <AuthButton />
            <WallLink
              className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:inline-flex">
              {t("classWallLink")}
            </WallLink>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-10 flex flex-col items-center gap-6 text-center sm:mt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <ShieldCheck className="size-3.5" /> {t("heroBadge")}
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {t("heroLead", { tagline: siteTagline(lang) })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/estudi"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Mic className="size-4" /> {t("enterStudio")}
            </Link>
            <WallLink
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary">
              {t("listenWall")} <ArrowRight className="size-4" />
            </WallLink>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("heroNote")}
          </p>
        </section>

        <SchoolShowcase />

        {/* Què és, problema i perfil */}
        <section className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:col-span-2">
            <h2 className="text-base font-bold">{t("whatTitle", { site: SITE_NAME })}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("whatText", { site: SITE_NAME })}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold">{t("problemTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("problemText")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold">{t("profileTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("profileText")}</p>
          </div>
        </section>

        {/* Com funciona */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("howItWorks")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <s.icon className="size-6 text-accent" />
                <h3 className="mt-3 text-sm font-bold">{t(s.title)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(s.desc)}</p>
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
                <h3 className="text-base font-bold">{t(a.title)}</h3>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    {t(p)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Extra features */}
        <section className="mt-16 flex flex-wrap items-center justify-center gap-2 text-center sm:mt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Wand2 className="size-3.5 text-accent" /> {t("featureAi")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Palette className="size-3.5 text-accent" /> {t("featureCovers")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <Users className="size-3.5 text-accent" /> {t("featureSounds")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
            <ShieldCheck className="size-3.5 text-accent" /> {t("featurePrivate")}
          </span>
        </section>

        {/* Preguntes freqüents */}
        <section className="mt-16 sm:mt-24">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("faqTitle")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-sm font-bold">{t(q)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(a)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mt-16 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center sm:mt-24 sm:p-10">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("ctaText")}
          </p>
          <Link
            to="/estudi"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <Mic className="size-4" /> {t("enterStudio")}
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("ctaSchoolQuestion")}{" "}
            <a href={ALTA_URL} className="font-semibold text-foreground underline underline-offset-4">
              {t("ctaSchoolLink")}
            </a>
            .
          </p>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border py-6 text-xs text-muted-foreground">
          <span>{SITE_NAME} · {t("footerOpen")}</span>
          <Link to="/registre" className="hover:underline">
            {t("footerTeacherSignup")}
          </Link>
          <Link to="/ajuda" className="hover:underline">
            {t("footerHelp")}
          </Link>
          <Link to="/privacitat" className="hover:underline">
            {t("footerPrivacy")}
          </Link>
          <Link to="/termes" className="hover:underline">
            {t("footerTerms")}
          </Link>
          <Link to="/mestre" className="hover:underline">
            {t("footerTeacherPanel")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
