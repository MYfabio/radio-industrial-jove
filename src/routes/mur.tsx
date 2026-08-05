import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Radio, Clock, Tag, Search, Play } from "lucide-react";
import { fetchApprovedPodcasts, type PodcastRow } from "@/lib/podcasts.functions";
import { onPodcastsChanged } from "@/lib/podcastSync";
import { SITE_NAME } from "@/lib/siteConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const wallQuery = queryOptions({
  queryKey: ["podcasts", "aprovats"],
  queryFn: () => fetchApprovedPodcasts(),
  staleTime: 0,
  // El mur es manté al dia sol: cada 15 s i quan es torna a la pestanya.
  refetchInterval: 15_000,
  refetchOnWindowFocus: true,
});

export const Route = createFileRoute("/mur")({
  head: () => ({
    meta: [
      { title: `Mur de la classe — Pòdcasts aprovats de ${SITE_NAME}` },
      {
        name: "description",
        content:
          "Escolta tots els pòdcasts que la classe ha gravat i que el mestre ja ha aprovat, organitzats per categoria.",
      },
      { property: "og:title", content: `Mur de la classe — ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Tots els pòdcasts aprovats de la classe, llestos per escoltar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wallQuery),
  component: Wall,
});

/** Paleta de colors per categoria: es tria de forma estable a partir del nom. */
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

function Poster({ p, onOpen }: { p: PodcastRow; onOpen: () => void }) {
  const cat = p.cat || "Altres";
  const color = colorFor(cat);
  return (
    <button
      onClick={onOpen}
      className="group w-48 shrink-0 snap-start text-left sm:w-60"
      aria-label={`Obre ${p.title}`}
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
      <h3 className="mt-1.5 truncate text-sm font-bold leading-tight">{p.title}</h3>
      <p className="truncate text-xs text-muted-foreground">
        {p.author || "Anònim"} · {formatTime(p.dur)}
      </p>
    </button>
  );
}

function DetailDialog({ p, onClose }: { p: PodcastRow | null; onClose: () => void }) {
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

          {p.tags && p.tags.length > 0 && (
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

function Row({
  label,
  color,
  items,
  onOpen,
}: {
  label: string;
  color: string;
  items: PodcastRow[];
  onOpen: (p: PodcastRow) => void;
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
          <Poster key={p.id} p={p} onOpen={() => onOpen(p)} />
        ))}
      </div>
    </section>
  );
}

function Wall() {
  const { data } = useSuspenseQuery(wallQuery);
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<PodcastRow | null>(null);

  useEffect(
    () => onPodcastsChanged(() => void qc.invalidateQueries({ queryKey: ["podcasts"] })),
    [qc],
  );

  const q = query.trim().toLowerCase();
  const filtered = q
    ? data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.author ?? "").toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      )
    : data;

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
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Radio className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mur de la classe</h1>
            <p className="text-sm text-muted-foreground">
              {data.length} pòdcast{data.length === 1 ? "" : "s"} aprovats i publicats.
            </p>
          </div>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              Gravar-ne un
            </Link>
          </span>
        </header>

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

        {data.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Encara no hi ha cap pòdcast aprovat. Grava'n un i demana al mestre que el revisi!
          </p>
        )}

        {data.length > 0 && filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Cap pòdcast coincideix amb «{query}».
          </p>
        )}

        {groups.map((g) => (
          <Row key={g.label} label={g.label} color={g.color} items={g.items} onOpen={setActive} />
        ))}
      </div>

      <DetailDialog p={active} onClose={() => setActive(null)} />
    </main>
  );
}
