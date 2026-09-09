import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchSchoolWall } from "@/lib/podcasts.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { PodcastWallView } from "@/components/PodcastWall";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { escolaWallMessages as m } from "@/lib/i18n/messages/escolaWall";

const schoolWallQuery = (slug: string) =>
  queryOptions({
    queryKey: ["podcasts", "escola", slug],
    queryFn: () => fetchSchoolWall({ data: { slug } }),
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

export const Route = createFileRoute("/escola/$slug")({
  head: ({ matches }) => {
    const lang = langFromMatches(matches);
    return {
      meta: [
        { title: tr(lang, m, "metaTitle", { site: SITE_NAME }) },
        { name: "description", content: tr(lang, m, "metaDescription") },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(schoolWallQuery(params.slug)),
  component: SchoolWall,
});

function SchoolWall() {
  const { slug } = Route.useParams();
  const { data: result } = useSuspenseQuery(schoolWallQuery(slug));
  const data = result.items;
  const t = useT(m);

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading={result.radioName}
          description={
            result.locked
              ? t("privateWall")
              : t(data.length === 1 ? "countOne" : "countMany", { count: data.length })
          }
          canShare={result.allowExternalSharing}
          locked={
            result.locked
              ? {
                  message: result.allowedDomain
                    ? t("lockedDomain", { domain: result.allowedDomain })
                    : t("lockedGeneric"),
                }
              : null
          }
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
