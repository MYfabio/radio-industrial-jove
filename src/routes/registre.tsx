import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GraduationCap, School, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import {
  submitAccessRequestFn,
  type SubmitAccessRequestInput,
} from "@/lib/accessRequests.functions";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteConfig";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { registreMessages as m } from "@/lib/i18n/messages/registre";

export const Route = createFileRoute("/registre")({
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
  component: RegisterPage,
});

type Kind = "docent" | "escola";

function RegisterPage() {
  const t = useT(m);
  const submit = useServerFn(submitAccessRequestFn);
  const [kind, setKind] = useState<Kind>("docent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [domain, setDomain] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const input: SubmitAccessRequestInput = {
        kind,
        name,
        email,
        schoolName: kind === "escola" ? schoolName : null,
        domain: domain || null,
        message: message || null,
      };
      await submit({ data: input });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <Check className="size-6" />
              </span>
              <h1 className="text-xl font-bold">{t("doneTitle")}</h1>
              <p className="max-w-sm text-sm text-muted-foreground">
                {kind === "docent" ? t("doneTeacher") : t("doneSchool")}
              </p>
              <Link
                to="/"
                className="mt-2 text-sm font-semibold text-accent hover:underline"
              >
                {t("backHome")}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {t("title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("subtitle", { siteName: SITE_NAME })}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKind("docent")}
                  aria-pressed={kind === "docent"}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-semibold transition-colors ${
                    kind === "docent"
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-secondary/40"
                  }`}
                >
                  <GraduationCap className="size-5" />
                  {t("kindTeacher")}
                </button>
                <button
                  type="button"
                  onClick={() => setKind("escola")}
                  aria-pressed={kind === "escola"}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-semibold transition-colors ${
                    kind === "escola"
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border bg-secondary/40"
                  }`}
                >
                  <School className="size-5" />
                  {t("kindSchool")}
                </button>
              </div>

              <form
                onSubmit={(e) => void onSubmit(e)}
                className="mt-5 space-y-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("nameLabel")}
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("emailLabel")}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {kind === "escola" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("schoolNameLabel")}
                      </label>
                      <Input
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("domainLabel")}
                      </label>
                      <Input
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder={t("domainPlaceholder")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {kind === "docent" && (
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("schoolNameOptionalLabel")}
                    </label>
                    <Input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("messageLabel")}
                  </label>
                  <Textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive-foreground">{error}</p>
                )}

                <Button type="submit" disabled={busy} className="w-full">
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  {t("submit")}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {t("alsoEmail")}{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-accent hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
