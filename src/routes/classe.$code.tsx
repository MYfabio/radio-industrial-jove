import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Users } from "lucide-react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { fetchClassWall } from "@/lib/podcasts.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { PodcastWallView } from "@/components/PodcastWall";
import { langFromMatches, tr, useT } from "@/lib/i18n";
import { classeWallMessages as m } from "@/lib/i18n/messages/classeWall";

const classWallQuery = (code: string) =>
  queryOptions({
    queryKey: ["podcasts", "classe", code],
    queryFn: () => fetchClassWall({ data: { code } }),
    staleTime: 0,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

export const Route = createFileRoute("/classe/$code")({
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
  loader: ({ context, params }) => context.queryClient.ensureQueryData(classWallQuery(params.code)),
  component: ClassWall,
});

function ClassWall() {
  const { code } = Route.useParams();
  const { data: result } = useSuspenseQuery(classWallQuery(code));
  const data = result.items;
  const t = useT(m);

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading={result.className}
          description={t(data.length === 1 ? "countOne" : "countMany", { count: data.length })}
          canShare
          emptyMessage={t("empty")}
          headerIcon={
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Users className="size-6" />
            </span>
          }
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
