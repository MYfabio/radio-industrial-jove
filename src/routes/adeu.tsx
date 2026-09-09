/**
 * Pantalla de comiat, on s'arriba en tancar la sessió. Abans, en sortir, et
 * quedaves a la mateixa pàgina i no hi havia cap senyal clar que havies
 * sortit; aquí es diu explícitament, es recorda que no s'ha perdut res i,
 * com que sovint és un ordinador compartit de l'aula, es demana tancar
 * també la finestra.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Mic, Home, Radio } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { useAuth } from "@/lib/auth";
import { SITE_NAME } from "@/lib/siteConfig";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { adeuMessages as m } from "@/lib/i18n/messages/adeu";

export const Route = createFileRoute("/adeu")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: `${tr(lang, m, "metaTitle")} — ${SITE_NAME}` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: GoodbyePage,
});

function GoodbyePage() {
  const t = useT(m);
  const { signInWithGoogle } = useAuth();

  return (
    <main className="studio-bg flex min-h-screen flex-col px-4 py-6 sm:px-6">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="size-9" animated={false} />
          <span className="text-sm font-semibold">{SITE_NAME}</span>
        </Link>
        <span className="ml-auto flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
        </span>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-10 text-center">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-primary/15 text-primary">
          <LogOut className="size-8" />
        </span>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t("lead")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button size="lg" onClick={() => void signInWithGoogle()}>
            <Mic className="size-4" /> {t("signIn")}
          </Button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            <Home className="size-4" /> {t("home")}
          </Link>
          <Link
            to="/mur"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            <Radio className="size-4" /> {t("wall")}
          </Link>
        </div>

        <div className="mt-10 w-full rounded-2xl border border-dashed border-border bg-card/60 p-4 text-left">
          <p className="text-sm font-semibold">{t("sharedDeviceTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("sharedDeviceText")}
          </p>
        </div>
      </div>
    </main>
  );
}
