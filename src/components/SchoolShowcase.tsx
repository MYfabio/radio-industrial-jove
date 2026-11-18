/**
 * Mostra del mur d'una escola a la portada: els últims pòdcasts d'una escola
 * real perquè qui arriba vegi com queda la ràdio d'un centre.
 *
 * Només surt si aquella escola té el mur obert a fora (el coordinador ho ha
 * activat). Si el tanca, la secció desapareix sola; si falla, no surt res.
 */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Radio } from "lucide-react";
import { fetchSchoolWall } from "@/lib/podcasts.functions";
import { SHOWCASE_SCHOOL_SLUG } from "@/lib/siteConfig";
import { useT } from "@/lib/i18n";
import { homeMessages as m } from "@/lib/i18n/messages/home";

const MAX_ITEMS = 4;

function formatTime(s: number) {
  const min = Math.floor(s / 60);
  return `${String(min).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function SchoolShowcase() {
  const t = useT(m);
  const { data } = useQuery({
    queryKey: ["podcasts", "showcase", SHOWCASE_SCHOOL_SLUG],
    queryFn: () => fetchSchoolWall({ data: { slug: SHOWCASE_SCHOOL_SLUG } }),
    staleTime: 60_000,
    retry: false,
  });

  if (!data || data.locked || !data.allowExternalSharing) return null;
  const items = data.items.slice(0, MAX_ITEMS);
  if (items.length === 0) return null;

  return (
    <section className="mt-16 sm:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("showcaseTitle")}
          </h2>
          <p className="mt-1 flex items-center gap-2 text-lg font-bold">
            <Radio className="size-5 text-accent" /> {data.radioName}
          </p>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {t("showcaseLead", { count: data.items.length })}
          </p>
        </div>
        <Link
          to="/escola/$slug"
          params={{ slug: data.slug }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
        >
          {t("showcaseAll")} <ArrowRight className="size-4" />
        </Link>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              to="/podcast/$id"
              params={{ id: String(p.id) }}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-accent/50"
            >
              <div className="flex aspect-square items-center justify-center overflow-hidden bg-secondary text-4xl">
                {p.has_cover_image ? (
                  <img
                    src={`/api/public/cover/${p.id}`}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <span aria-hidden="true">
                    {p.cover && /\p{Emoji}/u.test(p.cover) ? p.cover : "🎙️"}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-3">
                {p.cat && (
                  <span className="text-xs font-semibold text-accent">
                    {p.cat}
                  </span>
                )}
                <span className="line-clamp-2 text-sm font-bold">
                  {p.title}
                </span>
                <span className="mt-auto text-xs text-muted-foreground">
                  {p.author || t("showcaseAnon")} · {formatTime(p.dur)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
