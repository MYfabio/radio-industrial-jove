/**
 * Vista de "mur" reutilitzada per les tres variants: /mur (obert, sense
 * classe), /escola/$slug (mur d'una escola) i /classe/$code (mur d'una
 * classe). Cada ruta només resol quines dades mostrar; tota la part visual
 * (cerca, agrupació per categoria, diàleg de detall, preferits) viu aquí.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Clock, Tag, Search, Play, Share2, Check, Lock, Heart } from "lucide-react";
import type { PodcastRow } from "@/lib/podcasts.functions";
import { fetchMyFavoriteIds, toggleFavoriteFn } from "@/lib/favorites.functions";
import { onPodcastsChanged } from "@/lib/podcastSync";
import { useAuth } from "@/lib/auth";
import { AuthButton } from "@/components/AuthButton";
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
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
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

function Poster({
  p,
  onOpen,
  favorited,
  onToggleFavorite,
}: {
  p: PodcastRow;
  onOpen: () => void;
  favorited?: boolean | undefined;
  onToggleFavorite?: (() => void) | undefined;
}) {
  const cat = p.cat || "Altres";
  const color = colorFor(cat);
  return (
    <div className="group relative w-48 shrink-0 snap-start sm:w-60">
      <button onClick={onOpen} className="block w-full text-left" aria-label={`Obre ${p.title}`}>
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
              {p.cover && /\p{Emoji}/u.test(p.cover) ? p.cover : initialsFor(p.title)}
            </span>
          )}
          <span
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow"
            style={{ background: color }}
          >
            {cat}
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
          aria-label={favorited ? "Treure dels preferits" : "Afegir als preferits"}
          aria-pressed={favorited}
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-transform hover:scale-110"
        >
          <Heart className={`size-3.5 ${favorited ? "fill-current text-red-400" : ""}`} />
        </button>
      )}
      <h3 className="mt-1.5 truncate text-sm font-bold leading-tight">{p.title}</h3>
      <p className="truncate text-xs text-muted-foreground">
        {p.author || "Anònim"} · {formatTime(p.dur)}
      </p>
    </div>
  );
}

function ShareButton({ id, shareParam }: { id: number; shareParam: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${shareParam}=${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // L'usuari ha cancel·lat o el navegador no ho ha pogut fer: fem servir el porta-retalls.
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={() => void share()}
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary"
    >
      {copied ? <Check className="size-4 text-accent" /> : <Share2 className="size-4" />}
      {copied ? "Enllaç copiat!" : "Compartir"}
    </button>
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
            <img src={`/api/public/cover/${p.id}`} alt="" className="size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-6xl font-extrabold tracking-widest text-white/90">
              {p.cover && /\p{Emoji}/u.test(p.cover) ? p.cover : initialsFor(p.title)}
            </span>
          )}
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <DialogHeader>
            <span
              className="mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: color }}
            >
              {cat}
            </span>
            <DialogTitle className="text-xl">{p.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-sm">
              {p.author || "Anònim"} <Clock className="ml-2 size-3.5" /> {formatTime(p.dur)}
            </DialogDescription>
          </DialogHeader>

          {p.desc && <p className="mt-3 text-sm leading-relaxed">{p.desc}</p>}

          <audio controls preload="none" src={`/api/public/audio/${p.id}`} className="mt-4 w-full" />

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
                <Heart className={`size-4 ${favorited ? "fill-current" : ""}`} />
                {favorited ? "Als preferits" : "Preferit"}
              </button>
            )}
            {canShare && <ShareButton id={p.id} shareParam={shareParam} />}
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
              <span className="font-semibold text-accent">Comentari del mestre: </span>
              {p.teacher_note}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({
  label,
  color,
  items,
  onOpen,
  favoriteIds,
  onToggleFavorite,
}: {
  label: string;
  color: string;
  items: PodcastRow[];
  onOpen: (p: PodcastRow) => void;
  favoriteIds: Set<number> | null;
  onToggleFavorite: ((id: number) => void) | null;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 flex items-center gap-2 text-base font-bold sm:text-lg">
        <span className="size-2.5 rounded-full" style={{ background: color }} />
        {label}
        <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
      </h2>
      <div className="scrollbar-none -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2">
        {items.map((p) => (
          <Poster
            key={p.id}
            p={p}
            onOpen={() => onOpen(p)}
            favorited={favoriteIds?.has(p.id)}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(p.id) : undefined}
          />
        ))}
      </div>
    </section>
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
  emptyMessage = "Encara no hi ha cap pòdcast aprovat.",
  headerIcon,
  headerActions,
}: PodcastWallViewProps) {
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PodcastRow | null>(null);

  const { data: favoriteIdsList } = useQuery({
    queryKey: ["favorites", "mine"],
    queryFn: () => fetchMyFavoriteIds(),
    enabled: !!user,
  });
  const favoriteIds = user ? new Set(favoriteIdsList ?? []) : null;

  const toggleFavorite = (id: number) => {
    const current = new Set(qc.getQueryData<number[]>(["favorites", "mine"]) ?? []);
    const next = current.has(id) ? [...current].filter((x) => x !== id) : [...current, id];
    qc.setQueryData(["favorites", "mine"], next);
    void toggleFavoriteFn({ data: { podcastId: id } }).catch(() => {
      void qc.invalidateQueries({ queryKey: ["favorites", "mine"] });
    });
  };

  useEffect(
    () => onPodcastsChanged(() => void qc.invalidateQueries({ queryKey: ["podcasts"] })),
    [qc],
  );

  useEffect(() => {
    if (locked) return;
    const id = new URLSearchParams(window.location.search).get(shareParam);
    if (!id) return;
    const match = items.find((p) => p.id === Number(id));
    if (match) setActive(match);
  }, [locked, items, shareParam]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.author ?? "").toLowerCase().includes(q) ||
          (Array.isArray(p.tags) ? p.tags : []).some((t) => t.toLowerCase().includes(q)),
      )
    : items;

  const groups = useMemo(() => {
    const byCat = new Map<string, PodcastRow[]>();
    for (const p of filtered) {
      const key = p.cat || "Altres";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(p);
    }
    return Array.from(byCat.entries())
      .map(([label, items]) => ({ label, items, color: colorFor(label) }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [filtered]);

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center gap-3">
        {headerIcon}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="ml-auto flex items-center gap-2">{headerActions}</span>
      </header>

      {locked ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border p-10 text-center">
          <Lock className="size-8 text-muted-foreground" />
          <div>
            <p className="font-semibold">Aquest mur és privat</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {authLoading ? "Comprovant la sessió..." : locked.message}
            </p>
          </div>
          {!user && <AuthButton />}
        </div>
      ) : (
        <>
          <div className="relative mb-8 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per títol, autor o etiqueta…"
              aria-label="Cerca pòdcasts"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none ring-accent focus:ring-2"
            />
          </div>

          {items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              {emptyMessage}
            </p>
          )}

          {items.length > 0 && filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Cap pòdcast coincideix amb «{query}».
            </p>
          )}

          {groups.map((g) => (
            <CategoryRow
              key={g.label}
              label={g.label}
              color={g.color}
              items={g.items}
              onOpen={setActive}
              favoriteIds={favoriteIds}
              onToggleFavorite={user ? toggleFavorite : null}
            />
          ))}
        </>
      )}

      <DetailDialog
        p={active}
        canShare={canShare}
        shareParam={shareParam}
        favorited={active ? favoriteIds?.has(active.id) : undefined}
        onToggleFavorite={user && active ? () => toggleFavorite(active.id) : undefined}
        onClose={() => setActive(null)}
      />
    </>
  );
}
