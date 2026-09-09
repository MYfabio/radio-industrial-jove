import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchApprovedPodcasts } from "@/lib/podcasts.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { PodcastWallView } from "@/components/PodcastWall";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { murMessages as m } from "@/lib/i18n/messages/mur";

const wallQuery = queryOptions({
  queryKey: ["podcasts", "aprovats"],
  queryFn: () => fetchApprovedPodcasts(),
  staleTime: 0,
  // El mur es manté al dia sol: cada 15 s i quan es torna a la pestanya.
  refetchInterval: 15_000,
  refetchOnWindowFocus: true,
});

export const Route = createFileRoute("/mur")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: tr(lang, m, "metaTitle", { site: SITE_NAME }) },
        { name: "description", content: tr(lang, m, "metaDescription") },
        { property: "og:title", content: tr(lang, m, "ogTitle", { site: SITE_NAME }) },
        { property: "og:description", content: tr(lang, m, "ogDescription") },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(wallQuery),
  component: Wall,
});

function Wall() {
  const { data: result } = useSuspenseQuery(wallQuery);
  const data = result.items;
  const t = useT(m);

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading={t("heading")}
          description={t(data.length === 1 ? "countOne" : "countMany", { count: data.length })}
          canShare={result.allowExternalSharing}
          emptyMessage={t("empty")}
          headerIcon={<Logo className="size-12" />}
          headerActions={
            <>
              <ThemeToggle />
              <LangToggle />
              <AuthButton />
              <Link
                to="/estudi"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                {t("recordOne")}
              </Link>
            </>
          }
        />
      </div>
    </main>
  );
}
