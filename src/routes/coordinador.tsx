import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Settings, Check, UserPlus, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { fetchMySchoolFn, updateMySchoolFn, setDocentFn } from "@/lib/schools.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { AcceptTermsGate } from "@/components/AcceptTermsGate";

export const Route = createFileRoute("/coordinador")({
  head: () => ({
    meta: [{ title: `Panell de coordinador — ${SITE_NAME}` }],
  }),
  component: CoordinatorPanel,
});

function CoordinatorPanel() {
  const { user, role, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const fetchMySchool = useServerFn(fetchMySchoolFn);
  const updateSchool = useServerFn(updateMySchoolFn);
  const setDocent = useServerFn(setDocentFn);

  const {
    data,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ["my-school"],
    queryFn: () => fetchMySchool({}),
    enabled: !!user && role === "coordinador",
  });

  const [radioName, setRadioName] = useState("");
  const [allowSharing, setAllowSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [docentEmail, setDocentEmail] = useState("");
  const [docentBusy, setDocentBusy] = useState(false);
  const [docentMessage, setDocentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data?.school) {
      setRadioName(data.school.radio_name);
      setAllowSharing(data.school.allow_external_sharing);
    }
  }, [data]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSchool({ data: { radioName: radioName.trim(), allowExternalSharing: allowSharing } });
      await qc.invalidateQueries({ queryKey: ["my-school"] });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const addDocent = async () => {
    if (!docentEmail.trim()) return;
    setDocentBusy(true);
    setDocentMessage(null);
    try {
      await setDocent({ data: { email: docentEmail.trim() } });
      setDocentMessage(`${docentEmail.trim()} ja pot crear classes.`);
      setDocentEmail("");
      await qc.invalidateQueries({ queryKey: ["my-school"] });
    } catch (e) {
      setDocentMessage(e instanceof Error ? e.message : "No s'ha pogut afegir.");
    } finally {
      setDocentBusy(false);
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
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          Torna a l'estudi
        </Link>
      </main>
    );
  }

  if (role !== "coordinador") {
    return (
      <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold">Accés restringit</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Aquest panell només és per al coordinador o coordinadora del centre.
        </p>
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          Torna a l'estudi
        </Link>
      </main>
    );
  }

  return (
    <AcceptTermsGate>
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl xl:max-w-4xl 2xl:max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Settings className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panell de coordinador</h1>
            <p className="text-sm text-muted-foreground">Configuració de l'escola.</p>
          </div>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </span>
        </header>

        {isLoading ? (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregant la configuració...
          </p>
        ) : isError || !data ? (
          <p className="text-sm text-destructive-foreground">
            No s'ha pogut carregar l'escola:{" "}
            {loadError instanceof Error ? loadError.message : "error desconegut"}
          </p>
        ) : (
          <div className="space-y-6">
            <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Radio className="size-4" /> Domini: <code>@{data.school.google_domain}</code>
                {" · "}
                <Link
                  to="/escola/$slug"
                  params={{ slug: data.school.slug }}
                  className="text-accent hover:underline"
                >
                  Veure el mur de l'escola
                </Link>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nom de la ràdio
                </label>
                <Input
                  value={radioName}
                  onChange={(e) => setRadioName(e.target.value)}
                  placeholder="Ràdio de l'escola"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={allowSharing}
                    onChange={(e) => setAllowSharing(e.target.checked)}
                    className="mt-1 size-4"
                  />
                  <span>
                    <span className="block font-semibold">
                      Permetre compartir el mur de l'escola fora del centre
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Si ho actives, el mur de l'escola és visible per a tothom. Si ho deixes
                      desactivat, només el pot veure qui iniciï sessió amb un compte de Google del
                      domini del centre.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => void save()} disabled={saving || !radioName.trim()}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Desa
                </Button>
                {saved && <span className="text-sm font-semibold text-accent">Desat!</span>}
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <UserPlus className="size-4" /> Docents de l'escola
              </h2>
              <p className="text-sm text-muted-foreground">
                Dona permís de docent a algú del centre perquè pugui crear classes. Ha d'haver
                iniciat sessió amb Google almenys un cop.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={docentEmail}
                  onChange={(e) => setDocentEmail(e.target.value)}
                  placeholder="nom@escola.org"
                  className="max-w-xs"
                  onKeyDown={(e) => e.key === "Enter" && void addDocent()}
                />
                <Button size="sm" onClick={() => void addDocent()} disabled={docentBusy || !docentEmail.trim()}>
                  {docentBusy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                  Fes-lo docent
                </Button>
              </div>
              {docentMessage && <p className="text-sm text-muted-foreground">{docentMessage}</p>}

              {data.members.length > 0 && (
                <ul className="space-y-1.5 text-sm">
                  {data.members.map((m) => (
                    <li key={m.auth_user_id} className="flex items-center justify-between gap-2">
                      <span className="truncate">{m.email}</span>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {m.role}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Users className="size-4" /> Classes de l'escola ({data.classes.length})
              </h2>
              {data.classes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Encara no hi ha cap classe creada al centre. Els docents les creen des del Panell del
                  mestre.
                </p>
              )}
              {data.classes.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {data.classes.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {c.name}
                        {c.share_to_school && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                            <Radio className="size-2.5" /> Mur escola
                          </span>
                        )}
                      </span>
                      <Link
                        to="/classe/$code"
                        params={{ code: c.invite_code }}
                        className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent/10"
                      >
                        Mur
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
    </AcceptTermsGate>
  );
}
