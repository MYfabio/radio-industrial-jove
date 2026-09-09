import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteConfig";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { privacitatMessages as m } from "@/lib/i18n/messages/privacitat";

export const Route = createFileRoute("/privacitat")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: tr(lang, m, "metaTitle", { siteName: SITE_NAME }) },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const t = useT(m);
  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="size-10" animated={false} />
            <span className="text-lg font-bold tracking-tight">
              {SITE_NAME}
            </span>
          </Link>
          <span className="ml-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <AuthButton />
          </span>
        </header>

        <article className="space-y-6 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed sm:p-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{t("updated")}</p>
          </div>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s1Title")}
            </h2>
            <p>
              {t("s1P1", { siteName: SITE_NAME })}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s2Title")}
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>{t("s2Li1")}</li>
              <li>{t("s2Li2")}</li>
              <li>{t("s2Li3")}</li>
              <li>{t("s2Li4")}</li>
              <li>{t("s2Li5")}</li>
            </ul>
            <p className="mt-2 text-muted-foreground">{t("s2Note")}</p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s3Title")}
            </h2>
            <p>{t("s3P1")}</p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s4Title")}
            </h2>
            <p>{t("s4P1")}</p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s5Title")}
            </h2>
            <p>{t("s5P1")}</p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s6Title")}
            </h2>
            <p>
              {t("s6P1")}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s7Title")}
            </h2>
            <p>{t("s7P1")}</p>
          </section>

          <Link
            to="/"
            className="inline-block text-sm font-semibold text-accent hover:underline"
          >
            {t("backHome")}
          </Link>
        </article>
      </div>
    </main>
  );
}
