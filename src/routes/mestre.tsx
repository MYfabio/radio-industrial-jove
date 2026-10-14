import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  Loader2,
  Check,
  X,
  Clock,
  Copy,
  Plus,
  Users,
  Radio,
  Link2,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  fetchAllPodcasts,
  reviewPodcastFn,
  deletePodcastFn,
  type PodcastRow,
} from "@/lib/podcasts.functions";
import {
  createClassFn,
  fetchMyClasses,
  deleteClassFn,
  setClassSharingFn,
  type ClassRow,
} from "@/lib/classes.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { notifyPodcastsChanged } from "@/lib/podcastSync";
import { useAuth } from "@/lib/auth";
import { AcceptTermsGate } from "@/components/AcceptTermsGate";
import { fetchMySchoolBasicsFn } from "@/lib/schools.functions";
import { ClassDashboard } from "@/components/ClassDashboard";
import {
  langFromMatches,
  localeOf,
  tr,
  useLang,
  useT,
  type Translate,
} from "@/lib/i18n";
import { mestreMessages as m } from "@/lib/i18n/messages/mestre";

export const Route = createFileRoute("/mestre")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: tr(lang, m, "metaTitle") },
        { name: "description", content: tr(lang, m, "metaDescription") },
        {
          property: "og:title",
          content: `${tr(lang, m, "ogTitle")} — ${SITE_NAME}`,
        },
        { property: "og:description", content: tr(lang, m, "ogDescription") },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: TeacherPanel,
});

const BADGE: Record<string, string> = {
  pendent: "border-amber-500/50 bg-amber-500/15 text-amber-400",
  aprovat: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  rebutjat:
    "border-destructive/50 bg-destructive/15 text-destructive-foreground",
};

function statusLabel(t: Translate<typeof m>, status: string): string {
  if (status === "aprovat") return t("statusAprovat");
  if (status === "rebutjat") return t("statusRebutjat");
  return t("statusPendent");
}

/** Enllaç públic que el docent comparteix a l'aula perquè l'alumnat s'uneixi a la classe. */
function joinLink(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/uneix/${code}`;
}

function Row({ p, onSaved }: { p: PodcastRow; onSaved: () => void }) {
  const t = useT(m);
  const { lang } = useLang();
  const review = useServerFn(reviewPodcastFn);
  const remove = useServerFn(deletePodcastFn);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(p.teacher_note ?? "");
  const [when, setWhen] = useState(
    p.publish_at ? p.publish_at.slice(0, 16) : "",
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const save = async (
    status: "pendent" | "aprovat" | "rebutjat",
    label: string,
  ) => {
    setBusy(label);
    try {
      await review({
        data: {
          id: p.id,
          status,
          teacherNote: note.trim() || null,
          publishAt: when ? new Date(when).toISOString() : null,
        },
      });
      notifyPodcastsChanged();
      setSaved(
        status === "aprovat"
          ? when
            ? t("savedApprovedLater")
            : t("savedApprovedNow")
          : status === "rebutjat"
            ? t("savedRejected")
            : t("savedNote"),
      );
      onSaved();
    } finally {
      setBusy(null);
    }
  };

  const destroy = async () => {
    setConfirmDelete(false);
    setBusy("esborrar");
    try {
      await remove({ data: { id: p.id } });
      notifyPodcastsChanged();
      onSaved();
    } catch (e) {
      setSaved(e instanceof Error ? e.message : t("unknownError"));
      setBusy(null);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        {p.has_cover_image ? (
          <img
            src={`/api/public/cover/${p.id}`}
            alt=""
            className="size-14 rounded-xl object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary/15 text-2xl">
            {p.cover ?? "🎙️"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{p.title}</h3>
          <p className="text-sm text-muted-foreground">
            {p.author || t("anonymous")} · #{p.id} ·{" "}
            {new Date(p.created_at).toLocaleDateString(localeOf(lang))}
            {p.class_name && (
              <>
                {" "}
                ·{" "}
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                  <Users className="size-3" /> {p.class_name}
                </span>
              </>
            )}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            BADGE[p.status] ?? BADGE["pendent"]
          }`}
        >
          {statusLabel(t, p.status)}
        </span>
      </div>

      <audio
        controls
        preload="none"
        src={`/api/public/audio/${p.id}`}
        className="mt-3 w-full"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("noteLabel")}
          </label>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3" /> {t("publishAtLabel")}
          </label>
          <Input
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t("publishAtHint")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => void save("aprovat", "aprovat")}
          disabled={busy !== null}
        >
          {busy === "aprovat" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {p.status === "aprovat" ? t("approveUpdate") : t("approvePublish")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            void save(
              (p.status as "pendent" | "aprovat" | "rebutjat") ?? "pendent",
              "desar",
            )
          }
          disabled={busy !== null}
        >
          {busy === "desar" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {t("saveNote")}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => void save("rebutjat", "rebutjat")}
          disabled={busy !== null}
        >
          <X className="size-4" /> {t("removeFromWall")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto text-muted-foreground hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
          disabled={busy !== null}
        >
          {busy === "esborrar" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          {t("deletePodcast")}
        </Button>
        {saved && (
          <span className="text-xs font-semibold text-accent">{saved}</span>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deletePodcastTitle", { title: p.title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deletePodcastText")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void destroy()}>
              {t("deletePodcast")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

function ClassesPanel({ schoolSlug }: { schoolSlug: string | null }) {
  const t = useT(m);
  const { user, schoolId, loading: authLoading } = useAuth();
  const create = useServerFn(createClassFn);
  const list = useServerFn(fetchMyClasses);
  const deleteClass = useServerFn(deleteClassFn);
  const setSharing = useServerFn(setClassSharingFn);
  const [sharingId, setSharingId] = useState<number | null>(null);

  const toggleSharing = async (cls: ClassRow) => {
    setSharingId(cls.id);
    setError(null);
    try {
      await setSharing({
        data: { classId: cls.id, share: !cls.share_to_school },
      });
      await qc.invalidateQueries({ queryKey: ["classes"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unknownError"));
    } finally {
      setSharingId(null);
    }
  };
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [shareToSchool, setShareToSchool] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{
    id: number;
    what: "code" | "link";
  } | null>(null);
  const [justCreated, setJustCreated] = useState<ClassRow | null>(null);
  const [toDelete, setToDelete] = useState<ClassRow | null>(null);

  const {
    data: classes,
    isLoading,
    isError,
    error: loadError,
  } = useQuery({
    queryKey: ["classes", "meves"],
    queryFn: () => list({}),
    enabled: !!user,
  });

  const copy = async (id: number, what: "code" | "link", text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied({ id, what });
    window.setTimeout(
      () =>
        setCopied((cur) => (cur?.id === id && cur.what === what ? null : cur)),
      1500,
    );
  };

  const submit = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    setJustCreated(null);
    try {
      const created = await create({
        data: { name: name.trim(), shareToSchool },
      });
      setName("");
      setShareToSchool(false);
      setJustCreated(created);
      // Mostrem el codi a l'instant, sense esperar el refetch del servidor.
      qc.setQueryData<ClassRow[]>(["classes", "meves"], (old) => [
        created,
        ...(old ?? []),
      ]);
      await qc.invalidateQueries({ queryKey: ["classes"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("createClassError"));
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const cls = toDelete;
    setToDelete(null);
    setError(null);
    try {
      await deleteClass({ data: { classId: cls.id } });
      if (justCreated?.id === cls.id) setJustCreated(null);
      await qc.invalidateQueries({ queryKey: ["classes"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("unknownError"));
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <section className="mb-8 rounded-2xl border border-dashed border-border p-5 text-center">
        <p className="text-sm text-muted-foreground">{t("classesLoginHint")}</p>
        <div className="mt-3 flex justify-center">
          <AuthButton />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Users className="size-4" /> {t("classesTitle")}
      </h2>

      {justCreated && (
        <div className="mt-3 space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
          <p className="text-sm">
            <span className="font-semibold">
              {t("createdBanner", { name: justCreated.name })}
            </span>{" "}
            {t("createdHint")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                void copy(
                  justCreated.id,
                  "link",
                  joinLink(justCreated.invite_code),
                )
              }
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {copied?.id === justCreated.id && copied.what === "link" ? (
                <Check className="size-3.5" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              {copied?.id === justCreated.id && copied.what === "link"
                ? t("linkCopied")
                : t("copyLink")}
            </button>
            <button
              onClick={() =>
                void copy(justCreated.id, "code", justCreated.invite_code)
              }
              title={t("copyCodeTitle")}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/40 bg-card px-3 py-1.5 font-mono text-sm font-bold tracking-widest hover:bg-accent/10"
            >
              {copied?.id === justCreated.id && copied.what === "code" ? (
                <Check className="size-3.5 text-accent" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {justCreated.invite_code}
            </button>
            <code className="min-w-0 truncate text-xs text-muted-foreground">
              {joinLink(justCreated.invite_code)}
            </code>
          </div>
        </div>
      )}

      {isLoading && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("loading")}
        </p>
      )}

      {isError && (
        <p className="mt-2 text-sm text-destructive-foreground">
          {t("loadClassesError")}{" "}
          {loadError instanceof Error ? loadError.message : t("unknownError")}
        </p>
      )}

      {!isLoading && classes && classes.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2"
            >
              <div className="w-full min-w-0">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                {c.school_id !== null && (
                  <label
                    className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"
                    title={t("shareHint")}
                  >
                    <Switch
                      checked={c.share_to_school}
                      disabled={sharingId === c.id}
                      onCheckedChange={() => void toggleSharing(c)}
                      aria-label={t("shareSwitchLabel")}
                    />
                    <span>
                      {t("shareSwitchLabel")}:{" "}
                      <span
                        className={
                          c.share_to_school
                            ? "font-semibold text-accent"
                            : "font-semibold"
                        }
                      >
                        {c.share_to_school ? t("yes") : t("no")}
                      </span>
                    </span>
                    {sharingId === c.id && (
                      <Loader2 className="size-3 animate-spin" />
                    )}
                  </label>
                )}
              </div>
              <span className="flex flex-wrap items-center gap-1.5">
                <Link
                  to="/classe/$code"
                  params={{ code: c.invite_code }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent/10"
                >
                  <Users className="size-3.5" /> {t("classWall")}
                </Link>
                {c.share_to_school && schoolSlug && (
                  <Link
                    to="/escola/$slug"
                    params={{ slug: schoolSlug }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/20"
                  >
                    <Radio className="size-3.5" /> {t("schoolWall")}
                  </Link>
                )}
                <button
                  onClick={() =>
                    void copy(c.id, "link", joinLink(c.invite_code))
                  }
                  title={t("joinLinkTitle")}
                  aria-label={t("copyLink")}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent/10"
                >
                  {copied?.id === c.id && copied.what === "link" ? (
                    <Check className="size-3.5 text-accent" />
                  ) : (
                    <Link2 className="size-3.5" />
                  )}
                  {copied?.id === c.id && copied.what === "link"
                    ? t("linkCopied")
                    : t("copyLink")}
                </button>
                <button
                  onClick={() => void copy(c.id, "code", c.invite_code)}
                  title={t("copyCodeTitle")}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-xs font-bold tracking-widest hover:bg-accent/10"
                >
                  {copied?.id === c.id && copied.what === "code" ? (
                    <Check className="size-3.5 text-accent" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {c.invite_code}
                </button>
                <button
                  onClick={() => setToDelete(c)}
                  title={t("deleteClass")}
                  aria-label={t("deleteClass")}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading &&
        !isError &&
        classes &&
        classes.length === 0 &&
        !justCreated && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("noClassesYet")}
          </p>
        )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("classNamePlaceholder")}
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && void submit()}
        />
        <Button
          size="sm"
          onClick={() => void submit()}
          disabled={creating || !name.trim()}
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {t("createClass")}
        </Button>
      </div>
      {schoolId && (
        <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={shareToSchool}
            onChange={(e) => setShareToSchool(e.target.checked)}
            className="size-4"
          />
          {t("shareToSchool")}
        </label>
      )}
      {error && (
        <p className="mt-2 text-sm text-destructive-foreground">{error}</p>
      )}

      <AlertDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteClassTitle", { name: toDelete?.name ?? "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteClassText")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>
              {t("deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

/** Quadre de la classe: fa servir la mateixa consulta de classes que ClassesPanel (react-query la comparteix). */
function DashboardMount({ onGoClasses }: { onGoClasses: () => void }) {
  const t = useT(m);
  const { user } = useAuth();
  const list = useServerFn(fetchMyClasses);
  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", "meves"],
    queryFn: () => list({}),
    enabled: !!user,
  });
  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {t("loading")}
      </p>
    );
  }
  if (!classes || classes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {t("dashboardNoClasses")}{" "}
        <button
          onClick={onGoClasses}
          className="font-semibold text-accent hover:underline"
        >
          {t("tabClasses")}
        </button>
      </p>
    );
  }
  return <ClassDashboard classes={classes} />;
}

function TeacherPanel() {
  const t = useT(m);
  const { user, role, loading: authLoading } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(fetchAllPodcasts);
  const [classFilter, setClassFilter] = useState<string>("totes");
  const [shownReviewed, setShownReviewed] = useState(10);
  const fetchSchool = useServerFn(fetchMySchoolBasicsFn);
  const { data: school } = useQuery({
    queryKey: ["my-school-basics"],
    queryFn: () => fetchSchool({}),
    enabled: !!user && role !== "alumne",
  });
  const [tab, setTab] = useState<string>("revisar");
  useEffect(() => {
    // Recorda la darrera pestanya (després d'hidratar, perquè l'SSR coincideixi).
    try {
      const saved = window.localStorage.getItem("radio-mestre-tab");
      if (saved === "revisar" || saved === "classes" || saved === "quadre")
        setTab(saved);
    } catch {
      // Sense localStorage comencem a "Revisar".
    }
  }, []);
  const changeTab = (next: string) => {
    setTab(next);
    try {
      window.localStorage.setItem("radio-mestre-tab", next);
    } catch {
      // Sense localStorage, la pestanya no es recorda: no passa res.
    }
  };
  const { data, isLoading } = useQuery({
    queryKey: ["podcasts", "tots"],
    queryFn: () => list({}),
    enabled: !!user && role !== "alumne",
  });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["podcasts"] });
  };

  const classNames = Array.from(
    new Set(
      (data ?? []).map((p) => p.class_name).filter((n): n is string => !!n),
    ),
  ).sort();
  const hasClassless = (data ?? []).some((p) => !p.class_name);

  const matchesFilter = (p: PodcastRow) =>
    classFilter === "totes"
      ? true
      : classFilter === "sense-classe"
        ? !p.class_name
        : p.class_name === classFilter;

  const pending = (data ?? []).filter(
    (p) => p.status === "pendent" && matchesFilter(p),
  );
  const pendingAll = (data ?? []).filter((p) => p.status === "pendent").length;
  const rest = (data ?? []).filter(
    (p) => p.status !== "pendent" && matchesFilter(p),
  );

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
        <p className="text-lg font-semibold">{t("needLogin")}</p>
        <AuthButton />
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          {t("backToStudio")}
        </Link>
      </main>
    );
  }

  if (role === "alumne") {
    return (
      <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-semibold">{t("restricted")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("restrictedText")}
        </p>
        <Link to="/estudi" className="text-sm text-accent hover:underline">
          {t("backToStudio")}
        </Link>
      </main>
    );
  }

  return (
    <AcceptTermsGate>
      <main className="studio-bg min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-3xl xl:max-w-5xl 2xl:max-w-6xl">
          <header className="mb-8 flex flex-wrap items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <GraduationCap className="size-6" />
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
            <div className="flex w-full flex-wrap items-center gap-2">
              <Link
                to="/estudi"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                {t("goStudio")}
              </Link>
              {school && (
                <Link
                  to="/escola/$slug"
                  params={{ slug: school.slug }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  <Radio className="size-4" /> {t("schoolWall")}
                </Link>
              )}
              <Link
                to="/mur"
                title={t("openWallHint")}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                {t("openWall")}
              </Link>
            </div>
          </header>

          <Tabs value={tab} onValueChange={changeTab}>
            <TabsList className="mb-6 h-auto w-full flex-wrap justify-start gap-1 rounded-2xl p-1">
              <TabsTrigger
                value="revisar"
                className="gap-1.5 rounded-xl px-4 py-2"
              >
                <Check className="size-4" /> {t("tabReview")}
                {pendingAll > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-1.5 text-xs font-bold text-amber-500">
                    {pendingAll}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="classes"
                className="gap-1.5 rounded-xl px-4 py-2"
              >
                <Users className="size-4" /> {t("tabClasses")}
              </TabsTrigger>
              <TabsTrigger
                value="quadre"
                className="gap-1.5 rounded-xl px-4 py-2"
              >
                <LayoutDashboard className="size-4" /> {t("tabDashboard")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classes">
              <ClassesPanel schoolSlug={school?.slug ?? null} />
            </TabsContent>

            <TabsContent value="quadre">
              <DashboardMount onGoClasses={() => changeTab("classes")} />
            </TabsContent>

            <TabsContent value="revisar">
              {isLoading && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />{" "}
                  {t("loadingPodcasts")}
                </p>
              )}

              {(classNames.length > 0 || hasClassless) && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("classFilter")}
                  </span>
                  {[
                    "totes",
                    ...classNames,
                    ...(hasClassless ? ["sense-classe"] : []),
                  ].map((c) => (
                    <button
                      key={c}
                      onClick={() => setClassFilter(c)}
                      aria-pressed={classFilter === c}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        classFilter === c
                          ? "border-accent bg-accent/20 text-accent"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {c === "totes"
                        ? t("allClasses")
                        : c === "sense-classe"
                          ? t("noClassFilter")
                          : c}
                    </button>
                  ))}
                </div>
              )}

              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pendingTitle", { count: pending.length })}
              </h2>
              <div className="space-y-4">
                {pending.map((p) => (
                  <Row key={p.id} p={p} onSaved={refresh} />
                ))}
                {!isLoading && pending.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                    {t("nothingPending")}
                  </p>
                )}
              </div>

              {rest.length > 0 && (
                <>
                  <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("reviewedTitle", { count: rest.length })}
                  </h2>
                  <div className="space-y-4">
                    {rest.slice(0, shownReviewed).map((p) => (
                      <Row key={p.id} p={p} onSaved={refresh} />
                    ))}
                  </div>
                  {rest.length > shownReviewed && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="secondary"
                        onClick={() => setShownReviewed((n) => n + 20)}
                      >
                        {t("showMore", { count: rest.length - shownReviewed })}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AcceptTermsGate>
  );
}
