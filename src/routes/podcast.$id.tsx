/**
 * Pàgina pròpia d'un pòdcast públic (/podcast/$id), amb l'aspecte de la
 * ràdio. És l'enllaç que surt al botó de compartir: es pot enganxar en un
 * article de La Claqueta, en un correu o en un blog.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Clock, Radio, Tag } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { Logo } from "@/components/Logo";
import { SharePodcast, podcastUrl } from "@/components/SharePodcast";
import { fetchPublicPodcast } from "@/lib/podcasts.functions";
import { SITE_NAME, SITE_URL } from "@/lib/siteConfig";
import { trackPlay } from "@/lib/playTracker";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { sharePodcastMessages as m } from "@/lib/i18n/messages/sharePodcast";

const podcastQuery = (id: number) =>
  queryOptions({
    queryKey: ["podcasts", "public", id],
    queryFn: () => fetchPublicPodcast({ data: { id } }),
    staleTime: 60_000,
  });

function formatTime(s: number) {
  const min = Math.floor(s / 60);
  return `${String(min).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export const Route = createFileRoute("/podcast/$id")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(podcastQuery(Number(params.id))),
  head: ({ matches, loaderData, params }) => {
    const lang = langFromMatches(matches);
    const found = loaderData ?? null;
    if (!found) {
      return {
        meta: [
          { title: `${tr(lang, m, "notFoundTitle")} — ${SITE_NAME}` },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = found.podcast;
    const radio = found.radioName ?? SITE_NAME;
    const description =
      p.desc || tr(lang, m, "metaDescription", { site: radio });
    const url = `${SITE_URL}/podcast/${params.id}`;
    const meta = [
      { title: `${p.title} — ${radio}` },
      { name: "description", content: description },
      { property: "og:type", content: "music.song" },
      { property: "og:title", content: p.title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: radio },
      { property: "og:audio", content: `${SITE_URL}/api/public/audio/${p.id}` },
      {
        name: "twitter:card",
        content: p.has_cover_image ? "summary_large_image" : "summary",
      },
    ];
    if (p.has_cover_image) {
      meta.push({
        property: "og:image",
        content: `${SITE_URL}/api/public/cover/${p.id}`,
      });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  component: PodcastPage,
});

function PodcastPage() {
  const { id } = Route.useParams();
  const { data: found } = useSuspenseQuery(podcastQuery(Number(id)));
  const t = useT(m);

  const wallLink = found?.schoolSlug ? (
    <Link
      to="/escola/$slug"
      params={{ slug: found.schoolSlug }}
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
    >
      <Radio className="size-4" />
      {t("moreFrom", { radio: found.radioName ?? SITE_NAME })}
    </Link>
  ) : (
    <Link
      to="/mur"
      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
    >
      <Radio className="size-4" />
      {t("moreFrom", { radio: SITE_NAME })}
    </Link>
  );

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="size-12" />
            <span className="text-xl font-bold tracking-tight sm:text-2xl">
              {found?.radioName ?? SITE_NAME}
            </span>
          </Link>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LangToggle />
          </span>
        </header>

        {!found ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <h1 className="text-xl font-bold">{t("notFoundTitle")}</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {t("notFoundText")}
            </p>
            <div className="mt-6 flex justify-center">{wallLink}</div>
          </div>
        ) : (
          <PodcastCard found={found} wallLink={wallLink} />
        )}
      </div>
    </main>
  );
}

function PodcastCard({
  found,
  wallLink,
}: {
  found: NonNullable<Awaited<ReturnType<typeof fetchPublicPodcast>>>;
  wallLink: React.ReactNode;
}) {
  const t = useT(m);
  const p = found.podcast;
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
      <div
        className="relative aspect-video w-full"
        style={
          p.has_cover_image
            ? undefined
            : { background: "linear-gradient(135deg, #2B9FE3, #0E2A4E)" }
        }
      >
        {p.has_cover_image ? (
          <img
            src={`/api/public/cover/${p.id}`}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            {p.cover && /\p{Emoji}/u.test(p.cover) ? (
              <span className="text-7xl">{p.cover}</span>
            ) : (
              <Logo className="size-28" />
            )}
          </span>
        )}
      </div>

      <div className="p-6 sm:p-8">
        <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
          {p.cat || t("otherCategory")}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {p.title}
        </h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          {p.author || t("anonymous")} <Clock className="ml-2 size-3.5" />{" "}
          {formatTime(p.dur)}
        </p>

        {p.desc && <p className="mt-4 leading-relaxed">{p.desc}</p>}

        <audio
          controls
          preload="metadata"
          src={`/api/public/audio/${p.id}`}
          className="mt-6 w-full"
          onPlay={() => trackPlay(p.id)}
        />

        {Array.isArray(p.tags) && p.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {p.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                <Tag className="size-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <SharePodcast title={p.title} getUrl={() => podcastUrl(p.id)} />
          {wallLink}
          <Link
            to="/estudi"
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {t("recordOne")}
          </Link>
        </div>
      </div>
    </article>
  );
}
