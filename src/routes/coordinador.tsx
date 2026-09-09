import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, Settings, Check, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { fetchMySchoolFn, updateMySchoolFn } from "@/lib/schools.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { AcceptTermsGate } from "@/components/AcceptTermsGate";
import { SchoolMembersManager } from "@/components/SchoolMembers";
import { PlayStatsPanel } from "@/components/PlayStats";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { coordinadorMessages as m } from "@/lib/i18n/messages/coordinador";
import { panelsMessages as pm } from "@/lib/i18n/messages/panels";

export const Route = createFileRoute("/coordinador")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return { meta: [{ title: `${tr(lang, m, "metaTitle")} — ${SITE_NAME}` }] };
  },
  component: CoordinatorPanel,
});

const QUERY_KEY = ["my-school"] as const;

function CoordinatorPanel() {
  const t = useT(m);
  const tp = useT(pm);
  const { user, role, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const fetchMySchool = useServerFn(fetchMySchoolFn);
  const updateSchool = useServerFn(updateMySchoolFn);

  const {
    data,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: [...QUERY_KEY],
    queryFn: () => fetchMySchool({}),
    enabled: !!user && role === "coordinador",
  });

  const [radioName, setRadioName] = useState("");
  const [allowSharing, setAllowSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      await updateSchool({
        data: {
          radioName: radioName.trim(),
          allowExternalSharing: allowSharing,
        },
      });
      await qc.invalidateQueries({ queryKey: [...QUERY_KEY] });
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
        <p className="text-lg font-semibold">{tp("needLogin")}</p>
        <AuthButton />
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          {tp("backToStudio")}
        </Link>
      </main>
    );
  }

  if (role !== "coordinador") {
    return (
      <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold">{tp("restricted")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("restrictedText")}
        </p>
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          {tp("backToStudio")}
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
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
            <span className="ml-auto flex items-center gap-2">
              <LangToggle />
              <ThemeToggle />
              <AuthButton />
            </span>
          </header>

          {isLoading ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loadingSettings")}
            </p>
          ) : isError || !data ? (
            <p className="text-sm text-destructive-foreground">
              {t("loadError")}{" "}
              {loadError instanceof Error
                ? loadError.message
                : tp("unknownError")}
            </p>
          ) : (
            <div className="space-y-6">
              <section className="space-y-5 rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Radio className="size-4" /> {t("domain")}{" "}
                  <code>@{data.school.google_domain}</code>
                  {" · "}
                  <Link
                    to="/escola/$slug"
                    params={{ slug: data.school.slug }}
                    className="text-accent hover:underline"
                  >
                    {t("seeWall")}
                  </Link>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("radioNameLabel")}
                  </label>
                  <Input
                    value={radioName}
                    onChange={(e) => setRadioName(e.target.value)}
                    placeholder={t("radioNamePlaceholder")}
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
                        {t("allowSharingTitle")}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {t("allowSharingText")}
                      </span>
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => void save()}
                    disabled={saving || !radioName.trim()}
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {tp("save")}
                  </Button>
                  {saved && (
                    <span className="text-sm font-semibold text-accent">
                      {tp("saved")}
                    </span>
                  )}
                </div>
              </section>

              <PlayStatsPanel />

              <SchoolMembersManager
                data={data}
                selfUserId={user.id}
                queryKey={QUERY_KEY}
              />
            </div>
          )}
        </div>
      </main>
    </AcceptTermsGate>
  );
}
