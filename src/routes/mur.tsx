import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchApprovedPodcasts } from "@/lib/podcasts.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { PodcastWallView } from "@/components/PodcastWall";

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
      { title: `Mur obert — Pòdcasts aprovats de ${SITE_NAME}` },
      {
        name: "description",
        content:
          "Escolta pòdcasts gravats i aprovats a través d'aquest recurs obert, organitzats per categoria.",
      },
      { property: "og:title", content: `Mur obert — ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Pòdcasts aprovats, llestos per escoltar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(wallQuery),
  component: Wall,
});

function Wall() {
  const { data: result } = useSuspenseQuery(wallQuery);
  const data = result.items;

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading="Mur obert"
          description={`${data.length} pòdcast${data.length === 1 ? "" : "s"} aprovats i publicats, sense classe associada.`}
          canShare={result.allowExternalSharing}
          emptyMessage="Encara no hi ha cap pòdcast aprovat. Grava'n un i demana que el revisin!"
          headerIcon={<Logo className="size-12" />}
          headerActions={
            <>
              <ThemeToggle />
              <AuthButton />
              <Link
                to="/estudi"
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Gravar-ne un
              </Link>
            </>
          }
        />
      </div>
    </main>
  );
}
