/**
 * Quadre de comandament d'una classe, al panell del mestre: alumnat amb el
 * nombre de pòdcasts publicats i escoltes, i cada pòdcast amb les seves
 * escoltes reals. El docent tria la classe entre les seves.
 */
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchClassDashboardFn } from "@/lib/dashboard.functions";
import type { ClassRow } from "@/lib/classes.functions";
import { localeOf, useLang, useT, type Translate } from "@/lib/i18n";
import { dashboardMessages as m } from "@/lib/i18n/messages/dashboard";

const BADGE: Record<string, string> = {
  pendent: "border-amber-500/50 bg-amber-500/15 text-amber-400",
  aprovat: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  rebutjat:
    "border-destructive/50 bg-destructive/15 text-destructive-foreground",
};

function statusLabel(t: Translate<typeof m>, status: string): string {
  if (status === "aprovat") return t("statusAprovat");
  if (status === "rebutjat") return t("statusRebutjat");
  return t("statusPendent");
}

function Kpi({
  label,
  value,
  locale,
}: {
  label: string;
  value: number;
  locale: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold leading-none">
        {value.toLocaleString(locale)}
      </p>
    </div>
  );
}

export function ClassDashboard({ classes }: { classes: ClassRow[] }) {
  const t = useT(m);
  const { lang } = useLang();
  const locale = localeOf(lang);
  const fetchDashboard = useServerFn(fetchClassDashboardFn);
  const [classId, setClassId] = useState<number | null>(classes[0]?.id ?? null);

  // Si la classe triada desapareix (esborrada) o n'arriba la primera, ens hi ajustem.
  useEffect(() => {
    if (classId === null || !classes.some((c) => c.id === classId))
      setClassId(classes[0]?.id ?? null);
  }, [classes, classId]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["class-dashboard", classId],
    queryFn: () => fetchDashboard({ data: { classId: classId! } }),
    enabled: classId !== null,
  });

  if (classes.length === 0) return null;

  const maxPlays = Math.max(1, ...(data?.podcasts.map((p) => p.plays) ?? [1]));

  return (
    <section className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <LayoutDashboard className="size-4" /> {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
        </div>
        {classes.length > 1 && (
          <Select
            value={classId === null ? "" : String(classId)}
            onValueChange={(v) => setClassId(Number(v))}
          >
            <SelectTrigger
              className="h-8 w-[200px] text-xs"
              aria-label={t("classLabel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {t("loading")}
        </p>
      )}
      {isError && (
        <p className="text-sm text-destructive-foreground">
          {t("loadError")} {error instanceof Error ? error.message : ""}
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Kpi
              label={t("kpiStudents")}
              value={data.students.length}
              locale={locale}
            />
            <Kpi
              label={t("kpiPodcasts")}
              value={data.podcasts.length}
              locale={locale}
            />
            <Kpi
              label={t("kpiApproved")}
              value={data.podcasts.filter((p) => p.status === "aprovat").length}
              locale={locale}
            />
            <Kpi
              label={t("kpiPlays")}
              value={data.totalPlays}
              locale={locale}
            />
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("studentsTitle")} ({data.students.length})
            </h3>
            {data.students.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noStudents")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-1.5 pr-3 font-semibold">
                        {t("colStudent")}
                      </th>
                      <th className="py-1.5 pr-3 text-right font-semibold">
                        {t("colPodcasts")}
                      </th>
                      <th className="py-1.5 pr-3 text-right font-semibold">
                        {t("colApproved")}
                      </th>
                      <th className="py-1.5 text-right font-semibold">
                        {t("colPlays")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((s) => (
                      <tr
                        key={s.auth_user_id}
                        className="border-t border-border/60"
                      >
                        <td className="max-w-[260px] py-2 pr-3">
                          <p className="truncate font-medium">{s.name}</p>
                          {s.name !== s.email && (
                            <p className="truncate text-xs text-muted-foreground">
                              {s.email}
                            </p>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {s.podcasts === 0 ? (
                            <span className="text-xs text-muted-foreground">
                              {t("noneYet")}
                            </span>
                          ) : (
                            s.podcasts
                          )}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">
                          {s.approved}
                        </td>
                        <td className="py-2 text-right font-semibold tabular-nums">
                          {s.plays}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("podcastsTitle")} ({data.podcasts.length})
            </h3>
            {data.podcasts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noPodcasts")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-1.5 pr-3 font-semibold">
                        {t("colPodcast")}
                      </th>
                      <th className="py-1.5 pr-3 font-semibold">
                        {t("colAuthor")}
                      </th>
                      <th className="py-1.5 pr-3 font-semibold">
                        {t("colStatus")}
                      </th>
                      <th className="py-1.5 pr-3 font-semibold">
                        {t("colDate")}
                      </th>
                      <th className="w-40 py-1.5 text-right font-semibold">
                        {t("colPlays")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.podcasts.map((p) => (
                      <tr key={p.id} className="border-t border-border/60">
                        <td className="max-w-[260px] py-2 pr-3">
                          <p className="truncate font-medium" title={p.title}>
                            {p.title}
                          </p>
                        </td>
                        <td className="py-2 pr-3 text-muted-foreground">
                          {p.author || t("anonymous")}
                        </td>
                        <td className="py-2 pr-3">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                              BADGE[p.status] ?? BADGE["pendent"]
                            }`}
                          >
                            {statusLabel(t, p.status)}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString(locale)}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-2.5 w-24">
                              <div
                                className="h-full rounded-r-[4px]"
                                style={{
                                  width: `${Math.max(2, (p.plays / maxPlays) * 100)}%`,
                                  background: "var(--chart-1)",
                                }}
                              />
                            </div>
                            <span className="w-8 text-right font-semibold tabular-nums">
                              {p.plays}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t("playsNote")}</p>
        </>
      )}
    </section>
  );
}
