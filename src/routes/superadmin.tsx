import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, ShieldCheck, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { createSchoolFn, fetchSchoolsFn } from "@/lib/schools.functions";
import { SITE_NAME } from "@/lib/siteConfig";

export const Route = createFileRoute("/superadmin")({
  head: () => ({
    meta: [{ title: `Panell de super admin — ${SITE_NAME}` }],
  }),
  component: SuperAdminPanel,
});

function SuperAdminPanel() {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const create = useServerFn(createSchoolFn);
  const list = useServerFn(fetchSchoolsFn);

  const {
    data: schools,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ["schools"],
    queryFn: () => list({}),
    enabled: !!user && isSuperAdmin,
  });

  const [name, setName] = useState("");
  const [radioName, setRadioName] = useState("");
  const [domain, setDomain] = useState("");
  const [coordinadorEmail, setCoordinadorEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim() || !domain.trim() || !coordinadorEmail.trim()) {
      setError("Omple el nom, el domini i el correu del coordinador.");
      return;
    }
    setCreating(true);
    try {
      await create({
        data: {
          name: name.trim(),
          radioName: radioName.trim(),
          googleDomain: domain.trim(),
          coordinadorEmail: coordinadorEmail.trim(),
        },
      });
      setName("");
      setRadioName("");
      setDomain("");
      setCoordinadorEmail("");
      await qc.invalidateQueries({ queryKey: ["schools"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No s'ha pogut crear l'escola.");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) {
    return (
      <main className="studio-bg flex min-h-screen items-center justify-center px-4">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold">Cal iniciar sessió per veure aquest panell.</p>
        <AuthButton />
      </main>
    );
  }

  if (!isSuperAdmin) {
    return (
      <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold">Accés restringit</p>
        <p className="max-w-sm text-sm text-muted-foreground">Aquest panell només és per al super admin.</p>
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          Torna a l'estudi
        </Link>
      </main>
    );
  }

  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl xl:max-w-4xl 2xl:max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panell de super admin</h1>
            <p className="text-sm text-muted-foreground">Dona d'alta escoles noves.</p>
          </div>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </span>
        </header>

        <section className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Nova escola
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'escola" />
            <Input
              value={radioName}
              onChange={(e) => setRadioName(e.target.value)}
              placeholder="Nom de la ràdio (opcional)"
            />
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Domini de Google (escola.org)"
            />
            <Input
              value={coordinadorEmail}
              onChange={(e) => setCoordinadorEmail(e.target.value)}
              placeholder="Correu del coordinador"
            />
          </div>
          {error && <p className="text-sm text-destructive-foreground">{error}</p>}
          <Button onClick={() => void submit()} disabled={creating}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Crea l'escola
          </Button>
        </section>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Escoles donades d'alta
        </h2>

        {isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregant...
          </p>
        )}
        {isError && (
          <p className="text-sm text-destructive-foreground">
            {loadError instanceof Error ? loadError.message : "No s'han pogut carregar les escoles."}
          </p>
        )}
        {!isLoading && schools && schools.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
            Encara no hi ha cap escola donada d'alta.
          </p>
        )}

        <div className="space-y-2">
          {schools?.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  @{s.google_domain} · coordinador: {s.coordinador_email}
                </p>
              </div>
              <Link
                to="/escola/$slug"
                params={{ slug: s.slug }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <ExternalLink className="size-3.5" /> Mur
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
