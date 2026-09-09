import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, ShieldCheck, Plus, ExternalLink, Check, Inbox, Users, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { SchoolMembersManager } from "@/components/SchoolMembers";
import { useAuth } from "@/lib/auth";
import {
  createSchoolFn,
  fetchSchoolsFn,
  fetchSchoolPeopleAdminFn,
  updateSchoolAdminFn,
  deleteSchoolFn,
  type SchoolRow,
} from "@/lib/schools.functions";
import { fetchAccessRequestsFn, resolveAccessRequestFn } from "@/lib/accessRequests.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { superadminMessages as m } from "@/lib/i18n/messages/superadmin";
import { panelsMessages as pm } from "@/lib/i18n/messages/panels";

export const Route = createFileRoute("/superadmin")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return { meta: [{ title: `${tr(lang, m, "metaTitle")} — ${SITE_NAME}` }] };
  },
  component: SuperAdminPanel,
});

function SuperAdminPanel() {
  const t = useT(m);
  const tp = useT(pm);
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const create = useServerFn(createSchoolFn);
  const list = useServerFn(fetchSchoolsFn);
  const listRequests = useServerFn(fetchAccessRequestsFn);
  const resolveRequest = useServerFn(resolveAccessRequestFn);

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

  const { data: requests, isLoading: loadingRequests } = useQuery({
    queryKey: ["access-requests"],
    queryFn: () => listRequests({}),
    enabled: !!user && isSuperAdmin,
  });
  const pendingRequests = (requests ?? []).filter((r) => !r.resolved);

  const toggleResolved = async (id: number, resolved: boolean) => {
    await resolveRequest({ data: { id, resolved } });
    await qc.invalidateQueries({ queryKey: ["access-requests"] });
  };

  const [name, setName] = useState("");
  const [radioName, setRadioName] = useState("");
  const [domain, setDomain] = useState("");
  const [coordinadorEmail, setCoordinadorEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSchoolId, setOpenSchoolId] = useState<number | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim() || !domain.trim() || !coordinadorEmail.trim()) {
      setError(t("fillAll"));
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
      setError(e instanceof Error ? e.message : t("createError"));
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
        <p className="text-lg font-semibold">{tp("needLogin")}</p>
        <AuthButton />
      </main>
    );
  }

  if (!isSuperAdmin) {
    return (
      <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold">{tp("restricted")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("restrictedText")}</p>
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          {tp("backToStudio")}
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <span className="ml-auto flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <AuthButton />
          </span>
        </header>

        <section className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Inbox className="size-4" /> {t("pendingRequests", { count: pendingRequests.length })}
          </h2>

          {loadingRequests && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {tp("loading")}
            </p>
          )}
          {!loadingRequests && pendingRequests.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noPending")}</p>
          )}
          <div className="space-y-2">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border bg-secondary/40 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {r.name} · <span className="font-normal text-muted-foreground">{r.email}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.kind === "docent" ? t("wantsDocent") : t("wantsSchool")}
                    {r.school_name && ` · ${r.school_name}`}
                    {r.domain && ` · @${r.domain}`}
                  </p>
                  {r.message && <p className="mt-1 text-xs text-muted-foreground">"{r.message}"</p>}
                </div>
                <Button size="sm" variant="secondary" onClick={() => void toggleResolved(r.id, true)}>
                  <Check className="size-3.5" /> {t("resolved")}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("newSchool")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("schoolName")} />
            <Input
              value={radioName}
              onChange={(e) => setRadioName(e.target.value)}
              placeholder={t("radioNameOptional")}
            />
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={t("googleDomain")} />
            <Input
              value={coordinadorEmail}
              onChange={(e) => setCoordinadorEmail(e.target.value)}
              placeholder={t("coordinadorEmail")}
            />
          </div>
          {error && <p className="text-sm text-destructive-foreground">{error}</p>}
          <Button onClick={() => void submit()} disabled={creating}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {t("createSchool")}
          </Button>
        </section>

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("schoolsTitle")}</h2>

        {isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {tp("loading")}
          </p>
        )}
        {isError && (
          <p className="text-sm text-destructive-foreground">
            {loadError instanceof Error ? loadError.message : t("loadError")}
          </p>
        )}
        {!isLoading && schools && schools.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
            {t("noSchools")}
          </p>
        )}

        <div className="space-y-2">
          {schools?.map((s) => (
            <SchoolCard
              key={s.id}
              school={s}
              open={openSchoolId === s.id}
              onToggle={() => setOpenSchoolId((cur) => (cur === s.id ? null : s.id))}
              selfUserId={user.id}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function SchoolCard({
  school,
  open,
  onToggle,
  selfUserId,
}: {
  school: SchoolRow;
  open: boolean;
  onToggle: () => void;
  selfUserId: string;
}) {
  const t = useT(m);
  const tp = useT(pm);
  const qc = useQueryClient();
  const fetchPeople = useServerFn(fetchSchoolPeopleAdminFn);
  const updateSchool = useServerFn(updateSchoolAdminFn);
  const deleteSchool = useServerFn(deleteSchoolFn);
  const queryKey = ["school-people", school.id] as const;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...queryKey],
    queryFn: () => fetchPeople({ data: { schoolId: school.id } }),
    enabled: open,
  });

  const [name, setName] = useState(school.name);
  const [radioName, setRadioName] = useState(school.radio_name);
  const [domain, setDomain] = useState(school.google_domain ?? "");
  const [coordinadorEmail, setCoordinadorEmail] = useState(school.coordinador_email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await updateSchool({ data: { id: school.id, name, radioName, googleDomain: domain, coordinadorEmail } });
      await qc.invalidateQueries({ queryKey: ["schools"] });
      await qc.invalidateQueries({ queryKey: [...queryKey] });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : tp("unknownError"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    setSaveError(null);
    try {
      await deleteSchool({ data: { id: school.id } });
      await qc.invalidateQueries({ queryKey: ["schools"] });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : tp("unknownError"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{school.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {school.google_domain ? `@${school.google_domain}` : t("noDomain")} · {t("coordinatorLabel")}{" "}
            {school.coordinador_email ?? "—"}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/escola/$slug"
            params={{ slug: school.slug }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            <ExternalLink className="size-3.5" /> {tp("wall")}
          </Link>
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
          >
            <Users className="size-3.5" /> {open ? t("hide") : t("manage")}
            {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </span>
      </div>

      {open && (
        <div className="space-y-6 border-t border-border p-4">
          <section className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("editSchool")}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("schoolName")} />
              <Input value={radioName} onChange={(e) => setRadioName(e.target.value)} placeholder={t("radioNameOptional")} />
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={t("googleDomain")} />
              <Input
                value={coordinadorEmail}
                onChange={(e) => setCoordinadorEmail(e.target.value)}
                placeholder={t("coordinadorEmail")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={() => void save()} disabled={saving || !name.trim()}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {tp("save")}
              </Button>
              {saved && <span className="text-sm font-semibold text-accent">{tp("saved")}</span>}
              <Button
                size="sm"
                variant="destructive"
                className="ml-auto"
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                {t("deleteSchool")}
              </Button>
            </div>
            {saveError && <p className="text-sm text-destructive-foreground">{saveError}</p>}
          </section>

          {isLoading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> {t("loadingPeople")}
            </p>
          )}
          {isError && (
            <p className="text-sm text-destructive-foreground">{error instanceof Error ? error.message : tp("unknownError")}</p>
          )}
          {data && <SchoolMembersManager data={data} selfUserId={selfUserId} schoolId={school.id} queryKey={queryKey} />}
        </div>
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteSchoolTitle", { name: school.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteSchoolText")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tp("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void remove()}>{t("deleteSchool")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
