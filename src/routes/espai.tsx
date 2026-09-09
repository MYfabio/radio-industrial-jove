import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { User, Loader2, Pencil, Trash2, Check, X, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/lib/auth";
import { fetchMyPodcasts, updatePodcastFn, deletePodcastFn, type PodcastRow } from "@/lib/podcasts.functions";
import { fetchMyFavoritePodcasts, toggleFavoriteFn } from "@/lib/favorites.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { langFromMatches, localeOf, tr, useLang, useT } from "@/lib/i18n";
import { espaiMessages as m } from "@/lib/i18n/messages/espai";

export const Route = createFileRoute("/espai")({
  head: ({ matches }) => ({
    meta: [{ title: tr(langFromMatches(matches), m, "metaTitle", { site: SITE_NAME }) }],
  }),
  component: MySpace,
});

const BADGE: Record<string, string> = {
  pendent: "border-amber-500/50 bg-amber-500/15 text-amber-400",
  aprovat: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  rebutjat: "border-destructive/50 bg-destructive/15 text-destructive-foreground",
};

/** Etiqueta traduïda de cada estat (claus d'`espaiMessages`). */
const STATUS_LABEL: Record<PodcastRow["status"], keyof typeof m> = {
  pendent: "statusPending",
  aprovat: "statusApproved",
  rebutjat: "statusRejected",
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function MyPodcastCard({ p, onChanged }: { p: PodcastRow; onChanged: () => void }) {
  const update = useServerFn(updatePodcastFn);
  const del = useServerFn(deletePodcastFn);
  const t = useT(m);
  const { lang } = useLang();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(p.title);
  const [desc, setDesc] = useState(p.desc ?? "");
  const [cat, setCat] = useState(p.cat ?? "");
  const [tags, setTags] = useState((Array.isArray(p.tags) ? p.tags : []).join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveEdit = async () => {
    if (!title.trim()) return setError(t("titleRequired"));
    setBusy(true);
    setError(null);
    try {
      await update({
        data: {
          id: p.id,
          title: title.trim(),
          desc: desc.trim() || null,
          cat: cat.trim() || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      });
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      await del({ data: { id: p.id } });
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("deleteFailed"));
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        {p.has_cover_image ? (
          <img src={`/api/public/cover/${p.id}`} alt="" className="size-14 rounded-xl object-cover" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary/15 text-2xl">
            {p.cover ?? "🎙️"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{p.title}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(p.created_at).toLocaleDateString(localeOf(lang))}
            {p.class_name && ` · ${p.class_name}`}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${BADGE[p.status] ?? BADGE["pendent"]}`}>
          {t(STATUS_LABEL[p.status] ?? "statusPending")}
        </span>
      </div>

      <audio controls preload="none" src={`/api/public/audio/${p.id}`} className="mt-3 w-full" />

      {p.teacher_note && (
        <p className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
          <span className="font-semibold text-accent">{t("teacherNote")} </span>
          {p.teacher_note}
        </p>
      )}

      {editing ? (
        <div className="mt-3 space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} />
          <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("descPlaceholder")} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={cat} onChange={(e) => setCat(e.target.value)} placeholder={t("catPlaceholder")} />
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t("tagsPlaceholder")} />
          </div>
          {error && <p className="text-sm text-destructive-foreground">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void saveEdit()} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {t("save")}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)} disabled={busy}>
              <X className="size-4" /> {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="size-4" /> {t("edit")}
          </Button>
          {confirmDelete ? (
            <>
              <span className="text-sm text-muted-foreground">{t("confirmQuestion")}</span>
              <Button size="sm" variant="destructive" onClick={() => void doDelete()} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} {t("confirmDelete")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)} disabled={busy}>
                {t("cancel")}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> {t("delete")}
            </Button>
          )}
          {error && <span className="text-sm text-destructive-foreground">{error}</span>}
        </div>
      )}
    </article>
  );
}

function FavoriteCard({ p, onRemoved }: { p: PodcastRow; onRemoved: () => void }) {
  const toggle = useServerFn(toggleFavoriteFn);
  const t = useT(m);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await toggle({ data: { podcastId: p.id } });
      onRemoved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        {p.has_cover_image ? (
          <img src={`/api/public/cover/${p.id}`} alt="" className="size-14 rounded-xl object-cover" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary/15 text-2xl">
            {p.cover ?? "🎙️"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{p.title}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            {p.author || t("anonymous")} <Clock className="ml-1 size-3.5" /> {formatTime(p.dur)}
          </p>
        </div>
        <button
          onClick={() => void remove()}
          disabled={busy}
          aria-label={t("removeFavorite")}
          className="text-red-400 hover:text-red-500"
        >
          <Heart className="size-5 fill-current" />
        </button>
      </div>
      <audio controls preload="none" src={`/api/public/audio/${p.id}`} className="mt-3 w-full" />
    </article>
  );
}

function MySpace() {
  const { user, loading: authLoading } = useAuth();
  const t = useT(m);
  const qc = useQueryClient();
  const listMine = useServerFn(fetchMyPodcasts);
  const listFav = useServerFn(fetchMyFavoritePodcasts);

  const { data: mine, isLoading: loadingMine } = useQuery({
    queryKey: ["espai", "podcasts"],
    queryFn: () => listMine({}),
    enabled: !!user,
  });
  const { data: favorites, isLoading: loadingFav } = useQuery({
    queryKey: ["espai", "favorites"],
    queryFn: () => listFav({}),
    enabled: !!user,
  });

  const refreshMine = () => void qc.invalidateQueries({ queryKey: ["espai", "podcasts"] });
  const refreshFav = () => void qc.invalidateQueries({ queryKey: ["espai", "favorites"] });

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
        <p className="text-lg font-semibold">{t("signInPrompt")}</p>
        <AuthButton />
      </main>
    );
  }

  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl xl:max-w-5xl 2xl:max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <User className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LangToggle />
            <AuthButton />
            <Link
              to="/estudi"
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              {t("goToStudio")}
            </Link>
          </span>
        </header>

        <Tabs defaultValue="mine">
          <TabsList>
            <TabsTrigger value="mine">{t("tabMine")}</TabsTrigger>
            <TabsTrigger value="favorites">{t("tabFavorites")}</TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="mt-4 space-y-4">
            {loadingMine && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> {t("loading")}
              </p>
            )}
            {!loadingMine && (mine?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
                <span className="text-4xl" aria-hidden="true">🎙️</span>
                <p className="text-lg font-bold">{t("emptyMineTitle")}</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {t("emptyMineText")}
                </p>
                <Link
                  to="/estudi"
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105 active:scale-95"
                >
                  {t("recordFirst")}
                </Link>
              </div>
            )}
            {mine?.map((p) => (
              <MyPodcastCard key={p.id} p={p} onChanged={refreshMine} />
            ))}
          </TabsContent>

          <TabsContent value="favorites" className="mt-4 space-y-4">
            {loadingFav && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> {t("loading")}
              </p>
            )}
            {!loadingFav && (favorites?.length ?? 0) === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
                {t("emptyFavorites")}
              </p>
            )}
            {favorites?.map((p) => (
              <FavoriteCard key={p.id} p={p} onRemoved={refreshFav} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
