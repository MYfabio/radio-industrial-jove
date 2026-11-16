/**
 * Vista de "mur" reutilitzada per les tres variants: /mur (obert, sense
 * classe), /escola/$slug (mur d'una escola) i /classe/$code (mur d'una
 * classe). Cada ruta només resol quines dades mostrar; tota la part visual
 * (capçalera amb el destacat, cerca, filtre per categoria, graella única
 * amb els últims primer, diàleg de detall, preferits) viu aquí.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Clock, Tag, Search, Play, Lock, Heart, Star } from "lucide-react";
import type { PodcastRow } from "@/lib/podcasts.functions";
import {
  fetchMyFavoriteIds,
  toggleFavoriteFn,
} from "@/lib/favorites.functions";
import { onPodcastsChanged } from "@/lib/podcastSync";
import { useAuth } from "@/lib/auth";
import { trackPlay } from "@/lib/playTracker";
import { useT } from "@/lib/i18n";
import { podcastWallMessages as m } from "@/lib/i18n/messages/podcastWall";
import { AuthButton } from "@/components/AuthButton";
import { SharePodcast, podcastUrl } from "@/components/SharePodcast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const PALETTE = [
  "#2B9FE3",
  "#F5B41E",
  "#7C6FE0",
  "#E05C8A",
  "#1FB89A",
  "#E8712E",
  "#5A8DEE",
  "#A0785A",
  "#38B6D8",
  "#8CB832",
  "#D8503C",
  "#C24FC9",
];

function colorFor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++)
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length]!;
}

function initialsFor(title: string) {
  const words = title
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(" ")
    .filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "RE"
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function normTitle(t: string) {
  return t
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Treu els repetits (el mateix pòdcast pujat més d'un cop). Es queda amb el
 * primer que troba, que és el més recent perquè la llista ja ve ordenada.
 * Repetit = mateix títol (sense accents ni signes), o un títol que comença
 * igual que l'altre amb una durada gairebé idèntica (±15 s).
 */
function dedupe(items: PodcastRow[]) {
  const kept: { p: PodcastRow; t: string }[] = [];
  for (const p of items) {
    const t = normTitle(p.title);
    const dup = kept.some(
      (k) =>
        k.t === t ||
        (Math.min(k.t.length, t.length) >= 10 &&
          (k.t.startsWith(t) || t.startsWith(k.t)) &&
          Math.abs(k.p.dur - p.dur) <= 15),
    );
    if (!dup) kept.push({ p, t });
  }
  return kept.map((k) => k.p);
}

/**
 * Enllaç per compartir: la pàgina pròpia si el pòdcast és públic; si no
 * (p. ex. només al mur d'una classe), el mur actual amb el pòdcast obert.
 */
function shareUrlFor(p: PodcastRow, shareParam: string) {
  if (p.is_public) return podcastUrl(p.id);
  return `${window.location.origin}${window.location.pathname}?${shareParam}=${p.id}`;
}

function Poster({
  p,
  onOpen,
  canShare,
  shareParam,
  favorited,
  onToggleFavorite,
}: {
  p: PodcastRow;
  onOpen: () => void;
  canShare: boolean;
  shareParam: string;
  favorited?: boolean | undefined;
  onToggleFavorite?: (() => void) | undefined;
}) {
  const t = useT(m);
  const cat = p.cat || "Altres";
  const color = colorFor(cat);
  return (
    <div className="group relative w-full">
      <button
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={t("openPodcast", { title: p.title })}
      >
        <div
          className="relative aspect-video overflow-hidden rounded-2xl shadow-md transition-transform duration-200 group-hover:scale-[1.04] group-hover:shadow-2xl"
          style={
            p.has_cover_image
              ? undefined
              : { background: `linear-gradient(135deg, ${color}, #0E2A4E)` }
          }
        >
          {p.has_cover_image ? (
            <img
              src={`/api/public/cover/${p.id}`}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-extrabold tracking-widest text-white/90 sm:text-4xl">
              {p.cover && /\p{Emoji}/u.test(p.cover)
                ? p.cover
                : initialsFor(p.title)}
            </span>
          )}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
            style={{ background: color }}
          >
            {p.cat || t("otherCategory")}
          </span>
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity duration-200 group-hover:bg-black/30 group-hover:opacity-100">
            <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <Play className="size-6 translate-x-0.5" fill="currentColor" />
            </span>
          </span>
        </div>
      </button>
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          aria-label={favorited ? t("removeFavorite") : t("addFavorite")}
          aria-pressed={favorited}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-transform hover:scale-110"
        >
          <Heart
            className={`size-3.5 ${favorited ? "fill-current text-red-400" : ""}`}
          />
        </button>
      )}
      <div className="mt-1.5 flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold leading-tight">
            {p.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {p.author || t("anonymous")} · {formatTime(p.dur)}
          </p>
        </div>
        {canShare && (
          <SharePodcast
            variant="icon"
            title={p.title}
            isPublic={!!p.is_public}
            getUrl={() => shareUrlFor(p, shareParam)}
          />
        )}
      </div>
    </div>
  );
}

function DetailDialog({
  p,
  canShare,
  shareParam,
  favorited,
  onToggleFavorite,
  onClose,
}: {
  p: PodcastRow | null;
  canShare: boolean;
  shareParam: string;
  favorited?: boolean | undefined;
  onToggleFavorite?: (() => void) | undefined;
  onClose: () => void;
}) {
  const t = useT(m);
  if (!p) return null;
  const cat = p.cat || "Altres";
  const color = colorFor(cat);
  return (
    <Dialog open={!!p} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg overflow-hidden p-0">
        <div
          className="relative aspect-video w-full"
          style={
            p.has_cover_image
              ? undefined
              : { background: `linear-gradient(135deg, ${color}, #0E2A4E)` }
          }
        >
          {p.has_cover_image ? (
            <img
              src={`/api/public/cover/${p.id}`}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold tracking-widest text-white/90">
              {p.cover && /\p{Emoji}/u.test(p.cover)
                ? p.cover
                : initialsFor(p.title)}
            </span>
          )}
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <DialogHeader>
            <span
              className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: color }}
            >
              {p.cat || t("otherCategory")}
            </span>
            <DialogTitle className="text-xl">{p.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-sm">
              {p.author || t("anonymous")} <Clock className="ml-2 size-3.5" />{" "}
              {formatTime(p.dur)}
            </DialogDescription>
          </DialogHeader>

          {p.desc && <p className="mt-3 text-sm leading-relaxed">{p.desc}</p>}

          <audio
            controls
            preload="none"
            src={`/api/public/audio/${p.id}`}
            className="mt-4 w-full"
            onPlay={() => trackPlay(p.id)}
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                aria-pressed={favorited}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  favorited
                    ? "border-red-400/50 bg-red-400/10 text-red-400"
                    : "border-border hover:bg-secondary"
                }`}
              >
                <Heart
                  className={`size-4 ${favorited ? "fill-current" : ""}`}
                />
                {favorited ? t("inFavorites") : t("favorite")}
              </button>
            )}
            {canShare && (
              <SharePodcast
                title={p.title}
                isPublic={!!p.is_public}
                getUrl={() => shareUrlFor(p, shareParam)}
              />
            )}
          </div>

          {Array.isArray(p.tags) && p.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                >
                  <Tag className="size-3" /> {t}
                </span>
              ))}
            </div>
          )}

          {p.teacher_note && (
            <p className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
              <span className="font-semibold text-accent">
                {t("teacherNote")}{" "}
              </span>
              {p.teacher_note}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Hero({
  p,
  isFeatured,
  onOpen,
}: {
  p: PodcastRow;
  isFeatured: boolean;
  onOpen: () => void;
}) {
  const t = useT(m);
  const color = colorFor(p.cat || "Altres");
  return (
    <button
      onClick={onOpen}
      aria-label={t("openPodcast", { title: p.title })}
      className="group relative mb-8 block aspect-[16/9] w-full overflow-hidden rounded-3xl text-left shadow-xl sm:aspect-[21/8]"
      style={
        p.has_cover_image
          ? undefined
          : { background: `linear-gradient(135deg, ${color}, #0E2A4E)` }
      }
    >
      {p.has_cover_image && (
        <img
          src={`/api/public/cover/${p.id}`}
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent sm:bg-gradient-to-r" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 text-white sm:max-w-xl sm:p-8">
        <span className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-black">
            <Star className="size-3" fill="currentColor" />
            {isFeatured ? t("featuredBadge") : t("latestBadge")}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: color }}
          >
            {p.cat || t("otherCategory")}
          </span>
        </span>
        <h2 className="text-2xl font-extrabold leading-tight sm:text-4xl">
          {p.title}
        </h2>
        <p className="text-sm text-white/80">
          {p.author || t("anonymous")} · {formatTime(p.dur)}
        </p>
        {p.desc && (
          <p className="hidden text-sm text-white/80 line-clamp-2 sm:block">
            {p.desc}
          </p>
        )}
        <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition-transform group-hover:scale-105">
          <Play className="size-4" fill="currentColor" /> {t("listen")}
        </span>
      </div>
    </button>
  );
}

export interface PodcastWallViewProps {
  items: PodcastRow[];
  heading: string;
  description: string;
  canShare: boolean;
  /** Nom del paràmetre a la URL per obrir un pòdcast directament (p. ex. "p"). */
  shareParam?: string;
  locked?: { message: string } | null;
  emptyMessage?: string;
  headerIcon?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export function PodcastWallView({
  items,
  heading,
  description,
  canShare,
  shareParam = "p",
  locked = null,
  emptyMessage,
  headerIcon,
  headerActions,
}: PodcastWallViewProps) {
  const t = useT(m);
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [active, setActive] = useState<PodcastRow | null>(null);

  const { data: favoriteIdsList } = useQuery({
    queryKey: ["favorites", "mine"],
    queryFn: () => fetchMyFavoriteIds(),
    enabled: !!user,
  });
  const favoriteIds = user ? new Set(favoriteIdsList ?? []) : null;

  const toggleFavorite = (id: number) => {
    const current = new Set(
      qc.getQueryData<number[]>(["favorites", "mine"]) ?? [],
    );
    const next = current.has(id)
      ? [...current].filter((x) => x !== id)
      : [...current, id];
    qc.setQueryData(["favorites", "mine"], next);
    void toggleFavoriteFn({ data: { podcastId: id } }).catch(() => {
      void qc.invalidateQueries({ queryKey: ["favorites", "mine"] });
    });
  };

  useEffect(
    () =>
      onPodcastsChanged(
        () => void qc.invalidateQueries({ queryKey: ["podcasts"] }),
      ),
    [qc],
  );

  useEffect(() => {
    if (locked) return;
    const id = new URLSearchParams(window.location.search).get(shareParam);
    if (!id) return;
    const match = items.find((p) => p.id === Number(id));
    if (match) setActive(match);
  }, [locked, items, shareParam]);

  const unique = useMemo(() => dedupe(items), [items]);

  // Capçalera: l'últim que el docent ha destacat; si no n'hi ha, l'últim publicat.
  const featured = unique.find((p) => p.featured) ?? null;
  const hero = featured ?? unique[0] ?? null;

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of unique) {
      const key = p.cat || "Altres";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count, color: colorFor(label) }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [unique]);

  const q = query.trim().toLowerCase();
  const filtering = !!q || category !== null;
  const filtered = unique.filter(
    (p) =>
      (category === null || (p.cat || "Altres") === category) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        (p.author ?? "").toLowerCase().includes(q) ||
        (Array.isArray(p.tags) ? p.tags : []).some((t) =>
          t.toLowerCase().includes(q),
        )),
  );
  // Sense filtres, el de la capçalera no es repeteix a la graella.
  const grid =
    !filtering && hero ? filtered.filter((p) => p.id !== hero.id) : filtered;

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center gap-3">
        {headerIcon}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {heading}
          </h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="ml-auto flex items-center gap-2">{headerActions}</span>
      </header>

      {locked ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <Lock className="size-8 text-muted-foreground" />
          <div>
            <p className="font-semibold">{t("privateWall")}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {authLoading ? t("checkingSession") : locked.message}
            </p>
          </div>
          {!user && <AuthButton />}
        </div>
      ) : (
        <>
          {hero && !filtering && (
            <Hero
              p={hero}
              isFeatured={!!featured}
              onOpen={() => setActive(hero)}
            />
          )}

          <div className="mb-6 flex flex-col gap-3">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchLabel")}
                className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none ring-accent focus:ring-2"
              />
            </div>
            {categories.length > 1 && (
              <div
                role="group"
                aria-label={t("categoryFilter")}
                className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
              >
                <button
                  onClick={() => setCategory(null)}
                  aria-pressed={category === null}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    category === null
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {t("allCategories")} ({unique.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.label}
                    onClick={() =>
                      setCategory(category === c.label ? null : c.label)
                    }
                    aria-pressed={category === c.label}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      category === c.label
                        ? "border-transparent text-white"
                        : "border-border bg-card hover:bg-secondary"
                    }`}
                    style={
                      category === c.label ? { background: c.color } : undefined
                    }
                  >
                    {category !== c.label && (
                      <span
                        className="size-2 rounded-full"
                        style={{ background: c.color }}
                      />
                    )}
                    {c.label === "Altres" ? t("otherCategory") : c.label} (
                    {c.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              {emptyMessage ?? t("emptyDefault")}
            </p>
          )}

          {items.length > 0 && filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              {t("noMatch", { query: query || category || "" })}
            </p>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {grid.map((p) => (
              <Poster
                key={p.id}
                p={p}
                onOpen={() => setActive(p)}
                canShare={canShare}
                shareParam={shareParam}
                favorited={favoriteIds?.has(p.id)}
                onToggleFavorite={user ? () => toggleFavorite(p.id) : undefined}
              />
            ))}
          </div>
        </>
      )}

      <DetailDialog
        p={active}
        canShare={canShare}
        shareParam={shareParam}
        favorited={active ? favoriteIds?.has(active.id) : undefined}
        onToggleFavorite={
          user && active ? () => toggleFavorite(active.id) : undefined
        }
        onClose={() => setActive(null)}
      />
    </>
  );
}
