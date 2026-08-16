import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { fetchPublicSettings, updateSiteSettingsFn } from "@/lib/settings.functions";
import { SITE_NAME } from "@/lib/siteConfig";

export const Route = createFileRoute("/coordinador")({
  head: () => ({
    meta: [{ title: `Panell de coordinador — ${SITE_NAME}` }],
  }),
  component: CoordinatorPanel,
});

function CoordinatorPanel() {
  const { user, role, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const updateSettings = useServerFn(updateSiteSettingsFn);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchPublicSettings(),
  });

  const [allowSharing, setAllowSharing] = useState(false);
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setAllowSharing(settings.allow_external_sharing);
      setDomain(settings.allowed_email_domain);
    }
  }, [settings]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings({ data: { allowExternalSharing: allowSharing, allowedEmailDomain: domain.trim() } });
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
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
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Settings className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panell de coordinador</h1>
            <p className="text-sm text-muted-foreground">Configuració del centre.</p>
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
        ) : (
          <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
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
                    Permetre compartir pòdcasts fora de l'escola
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Si ho actives, el mur de la classe és visible per a tothom i apareix un botó
                    "Compartir" a cada pòdcast. Si ho deixes desactivat, el mur només el pot veure
                    qui inicii sessió amb un compte de Google del domini del centre, per protegir
                    els alumnes.
                  </span>
                </span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Domini de correu del centre
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="escolaindustrial.org"
                className="mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Només els comptes de Google que acabin en «@{domain || "domini"}» podran veure el
                mur quan el compartir estigui desactivat.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => void save()} disabled={saving || !domain.trim()}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                Desar
              </Button>
              {saved && <span className="text-sm font-semibold text-accent">Desat!</span>}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
