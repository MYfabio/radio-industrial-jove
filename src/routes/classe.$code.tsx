import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Users } from "lucide-react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchClassWall } from "@/lib/podcasts.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { PodcastWallView } from "@/components/PodcastWall";

const classWallQuery = (code: string) =>
  queryOptions({
    queryKey: ["podcasts", "classe", code],
    queryFn: () => fetchClassWall({ data: { code } }),
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

export const Route = createFileRoute("/classe/$code")({
  head: () => ({
    meta: [
      { title: `Mur de la classe — ${SITE_NAME}` },
      {
        name: "description",
        content: "Escolta els pòdcasts aprovats d'aquesta classe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(classWallQuery(params.code)),
  component: ClassWall,
});

function ClassWall() {
  const { code } = Route.useParams();
  const { data: result } = useSuspenseQuery(classWallQuery(code));
  const data = result.items;

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading={result.className}
          description={`${data.length} pòdcast${data.length === 1 ? "" : "s"} aprovats d'aquesta classe.`}
          canShare
          emptyMessage="Encara no hi ha cap pòdcast aprovat en aquesta classe."
          headerIcon={
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Users className="size-6" />
            </span>
          }
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
