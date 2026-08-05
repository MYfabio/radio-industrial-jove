import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Radio, Clock, Tag } from "lucide-react";
import { fetchApprovedPodcasts, type PodcastRow } from "@/lib/podcasts.functions";
import { onPodcastsChanged } from "@/lib/podcastSync";
import { TEMPLATES } from "@/lib/podcastTemplates";

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
      { title: "Mur de la classe — Pòdcasts aprovats de Ràdio Escolar" },
      {
        name: "description",
        content:
          "Escolta tots els pòdcasts que la classe ha gravat i que el mestre ja ha aprovat, ordenats per plantilla.",
      },
      { property: "og:title", content: "Mur de la classe — Ràdio Escolar" },
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

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function Card({ p }: { p: PodcastRow }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {p.has_cover_image ? (
          <img
            src={`/api/public/cover/${p.id}`}
            alt={`Caràtula de ${p.title}`}
            loading="lazy"
            className="size-16 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-3xl">
            {p.cover ?? "🎙️"}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold">{p.title}</h3>
          <p className="text-sm text-muted-foreground">
            {p.author || "Anònim"}
            {p.cat ? ` · ${p.cat}` : ""}
          </p>
          <p className="mt-1 flex items-center gap-1 font-mono text-xs text-accent">
            <Clock className="size-3" /> {formatTime(p.dur)}
          </p>
        </div>
      </div>

      {p.desc && <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>}

      <audio controls preload="none" src={`/api/public/audio/${p.id}`} className="mt-3 w-full" />

      {p.tags && p.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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
        <p className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
          <span className="font-semibold text-accent">Comentari del mestre: </span>
          {p.teacher_note}
        </p>
      )}
    </article>
  );
}

function Wall() {
  const { data } = useSuspenseQuery(wallQuery);
  const qc = useQueryClient();
  useEffect(
    () => onPodcastsChanged(() => void qc.invalidateQueries({ queryKey: ["podcasts"] })),
    [qc],
  );

  const groups = TEMPLATES.map((t) => ({
    key: t.id,
    label: `${t.emoji} ${t.nombre}`,
    items: data.filter((p) => p.template === t.id),
  }));
  const others = data.filter((p) => !TEMPLATES.some((t) => t.id === p.template));

  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
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
          <span className="ml-auto">
            <ThemeToggle />
          </span>
          <Link
            to="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >

            Gravar-ne un
          </Link>
        </header>

        {data.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Encara no hi ha cap pòdcast aprovat. Grava'n un i demana al mestre que el revisi!
          </p>
        )}

        {groups
          .filter((g) => g.items.length > 0)
          .map((g) => (
            <section key={g.key} className="mb-8">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {g.items.map((p) => (
                  <Card key={p.id} p={p} />
                ))}
              </div>
            </section>
          ))}

        {others.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              🎧 Altres pòdcasts
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Card key={p.id} p={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
