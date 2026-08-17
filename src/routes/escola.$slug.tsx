import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchSchoolWall } from "@/lib/podcasts.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { PodcastWallView } from "@/components/PodcastWall";

const schoolWallQuery = (slug: string) =>
  queryOptions({
    queryKey: ["podcasts", "escola", slug],
    queryFn: () => fetchSchoolWall({ data: { slug } }),
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

export const Route = createFileRoute("/escola/$slug")({
  head: () => ({
    meta: [
      { title: `Mur de l'escola — ${SITE_NAME}` },
      {
        name: "description",
        content: "Escolta els pòdcasts aprovats de les classes d'aquesta escola que han triat compartir-los.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(schoolWallQuery(params.slug)),
  component: SchoolWall,
});

function SchoolWall() {
  const { slug } = Route.useParams();
  const { data: result } = useSuspenseQuery(schoolWallQuery(slug));
  const data = result.items;

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading={result.radioName}
          description={
            result.locked
              ? "Mur privat de l'escola."
              : `${data.length} pòdcast${data.length === 1 ? "" : "s"} compartits per les classes d'aquesta escola.`
          }
          canShare={result.allowExternalSharing}
          locked={
            result.locked
              ? {
                  message: result.allowedDomain
                    ? `Inicia sessió amb un compte de Google d'aquesta escola (@${result.allowedDomain}) per veure'l.`
                    : "Aquest mur és privat.",
                }
              : null
          }
          emptyMessage="Encara no hi ha cap pòdcast compartit al mur de l'escola."
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
