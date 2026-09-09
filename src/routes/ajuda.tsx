import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteConfig";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { ajudaMessages as m } from "@/lib/i18n/messages/ajuda";

export const Route = createFileRoute("/ajuda")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: tr(lang, m, "metaTitle", { siteName: SITE_NAME }) },
        {
          name: "description",
          content: tr(lang, m, "metaDescription"),
        },
      ],
    };
  },
  component: HelpPage,
});

function HelpPage() {
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
            <p className="mt-1 text-xs text-muted-foreground">
              {t("subtitle", { siteName: SITE_NAME })}
            </p>
          </div>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s1Title")}
            </h2>
            <p>
              {t("s1P1", { siteName: SITE_NAME })}{" "}
              <Link to="/privacitat" className="text-accent hover:underline">
                {t("privacyLink")}
              </Link>
              ).
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s2Title")}
            </h2>
            <p>
              {t("s2From")}{" "}
              <Link to="/estudi" className="text-accent hover:underline">
                {t("s2StudioLink")}
              </Link>{" "}
              {t("s2P1a")} <em>{t("s2Pending")}</em> {t("s2P1b")}{" "}
              <strong>{t("s2MySpace")}</strong> {t("s2P1c")}
            </p>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("s3Title")}
            </h2>
            <p>
              {t("s3Only")} <strong>{t("s3Teacher")}</strong> {t("s3Or")}{" "}
              <strong>{t("s3Coordinator")}</strong> {t("s3P1Rest")}
            </p>
            <p className="mt-2">
              {t("s3P2From")} <strong>{t("s3TeacherPanel")}</strong>{" "}
              {t("s3P2Rest")}
            </p>
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
            <p>{t("s5Intro")}</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>{t("s5Li1Label")}</strong> (
                <code>{t("s5Li1Path")}</code>): {t("s5Li1Text")}
              </li>
              <li>
                <strong>{t("s5Li2Label")}</strong> (
                <code>{t("s5Li2Path")}</code>): {t("s5Li2Text")}
              </li>
              <li>
                <strong>{t("s5Li3Label")}</strong> (
                <code>{t("s5Li3Path")}</code>): {t("s5Li3Text")}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("faqTitle")}
            </h2>
            <div className="mt-2 space-y-3">
              <div>
                <p className="font-semibold">{t("faq1Q")}</p>
                <p className="text-muted-foreground">{t("faq1A")}</p>
              </div>
              <div>
                <p className="font-semibold">{t("faq2Q")}</p>
                <p className="text-muted-foreground">{t("faq2A")}</p>
              </div>
              <div>
                <p className="font-semibold">{t("faq3Q")}</p>
                <p className="text-muted-foreground">{t("faq3A")}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-accent">
              {t("contactTitle")}
            </h2>
            <p>
              {t("contactP1")}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              . {t("contactAlso")}{" "}
              <Link to="/privacitat" className="text-accent hover:underline">
                {t("privacyLink")}
              </Link>{" "}
              {t("contactAnd")}{" "}
              <Link to="/termes" className="text-accent hover:underline">
                {t("termsLink")}
              </Link>
              .
            </p>
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
