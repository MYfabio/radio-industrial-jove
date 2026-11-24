import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LangToggle } from "@/components/LangToggle";
import { AuthButton } from "@/components/AuthButton";
import { Logo } from "@/components/Logo";
import { useMySchool } from "@/components/WallLink";
import {
  useQuery,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { Radio } from "lucide-react";
import { fetchPublicSchoolsFn } from "@/lib/schools.functions";
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
        // El mur mostra pòdcasts amb veus d'alumnat menor: fora dels cercadors.
        { name: "robots", content: "noindex, nofollow" },
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

// Ràdios d'escola amb el mur obert a fora. No bloqueja el mur: si falla o
// encara no n'hi ha cap, senzillament no surt la secció.
const publicSchoolsQuery = queryOptions({
  queryKey: ["schools", "public"],
  queryFn: () => fetchPublicSchoolsFn(),
  staleTime: 60_000,
  retry: false,
});

function SchoolRadios() {
  const t = useT(m);
  const { data } = useQuery(publicSchoolsQuery);
  if (!data || data.length === 0) return null;
  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("schoolsTitle")}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("schoolsLead")}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {data.map((s) => (
          <li key={s.slug}>
            <Link
              to="/escola/$slug"
              params={{ slug: s.slug }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              <Radio className="size-4 text-accent" />
              <span>
                {s.radioName}
                {s.name && s.name !== s.radioName ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {s.name}
                  </span>
                ) : null}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {s.podcasts}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Wall() {
  const { data: result } = useSuspenseQuery(wallQuery);
  const data = result.items;
  const t = useT(m);
  const school = useMySchool();

  return (
    <main className="studio-bg min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <PodcastWallView
          items={data}
          heading={t("heading")}
          description={t(data.length === 1 ? "countOne" : "countMany", { count: data.length })}
          canShare={result.allowExternalSharing}
          emptyMessage={t("empty")}
          belowHeader={<SchoolRadios />}
          headerIcon={<Logo className="size-12" />}
          headerActions={
            <>
              <ThemeToggle />
              <LangToggle />
              <AuthButton />
              {school && (
                <Link
                  to="/escola/$slug"
                  params={{ slug: school.slug }}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  {school.radioName}
                </Link>
              )}
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
