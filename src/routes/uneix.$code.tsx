/**
 * Enllaç d'invitació a una classe (/uneix/$code): el docent el comparteix a
 * l'aula i l'alumne, en obrir-lo, s'hi afegeix. Si no ha iniciat sessió,
 * recordem el codi, l'enviem a Google i en tornar l'AuthProvider el porta
 * aquí perquè s'hi uneixi. No cal que sigui del centre: així un docent pot
 * fer subgrups amb alumnes de qualsevol lloc.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, Users, Check, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { fetchClassByCode, joinClassFn } from "@/lib/classes.functions";
import { setPendingJoin } from "@/lib/pendingJoin";
import { SITE_NAME } from "@/lib/siteConfig";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { uneixMessages as m } from "@/lib/i18n/messages/uneix";

export const Route = createFileRoute("/uneix/$code")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: `${tr(lang, m, "metaTitle")} — ${SITE_NAME}` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: JoinByLink,
});

function JoinByLink() {
  const t = useT(m);
  const { code } = Route.useParams();
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    refreshProfile,
  } = useAuth();
  const join = useServerFn(joinClassFn);

  const {
    data: cls,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["class-by-code", code],
    queryFn: () => fetchClassByCode({ data: { code } }),
    retry: false,
  });

  const [state, setState] = useState<"idle" | "joining" | "joined" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  const doJoin = async () => {
    setState("joining");
    setError(null);
    try {
      await join({ data: { code } });
      refreshProfile();
      setState("joined");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("joinError"));
      setState("error");
    }
  };

  useEffect(() => {
    if (!user || !cls || attempted.current) return;
    attempted.current = true;
    void doJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cls]);

  const signIn = async () => {
    setPendingJoin(code);
    await signInWithGoogle();
  };

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-8 flex items-center gap-2">
          <Link
            to="/"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {SITE_NAME}
          </Link>
          <span className="ml-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <AuthButton />
          </span>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            {state === "joined" ? (
              <Check className="size-7" />
            ) : (
              <Users className="size-7" />
            )}
          </span>

          {(isLoading || authLoading) && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loading")}
            </p>
          )}

          {!isLoading && (isError || !cls) && (
            <>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("unknownCode")}
              </p>
              <Link
                to="/"
                className="mt-4 inline-block text-sm text-accent hover:underline"
              >
                {t("home")}
              </Link>
            </>
          )}

          {cls && !authLoading && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {state === "joined" ? "" : t("inviteTitle")}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {state === "joined"
                  ? t("joinedTitle", { name: cls.name })
                  : cls.name}
              </h1>

              {!user && (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("signInToJoin")}
                  </p>
                  <Button className="mt-4" onClick={() => void signIn()}>
                    {t("signIn")}
                  </Button>
                </>
              )}

              {user && state === "joining" && (
                <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> {t("joining")}
                </p>
              )}

              {user && state === "error" && (
                <>
                  <p className="mt-3 text-sm text-destructive-foreground">
                    {error}
                  </p>
                  <Button
                    className="mt-4"
                    variant="secondary"
                    onClick={() => void doJoin()}
                  >
                    {t("retry")}
                  </Button>
                </>
              )}

              {user && state === "joined" && (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("joinedText")}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Link
                      to="/estudi"
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <Mic className="size-4" /> {t("goRecord")}
                    </Link>
                    <Link
                      to="/classe/$code"
                      params={{ code: cls.invite_code }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
                    >
                      {t("seeWall")}
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
