/**
 * Gràfiques d'escoltes per al panell del coordinador (el seu centre) i el del
 * super admin (tots els centres o el que triï).
 *
 * Les gràfiques són SVG fet a mà, no cap llibreria: són dues formes senzilles
 * (una àrea per l'evolució i barres per al rànquing) i així no carreguem
 * centenars de kB a un panell que es fa servir de tant en tant. Els colors
 * surten dels tokens del tema (--chart-1 sobre --card), de manera que el mode
 * clar i el fosc funcionen sols.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BarChart3, Loader2, Table2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPlayStatsFn, type PlayStats } from "@/lib/plays.functions";
import type { SchoolRow } from "@/lib/schools.functions";
import { localeOf, useLang, useT, type Translate } from "@/lib/i18n";
import { statsMessages as m } from "@/lib/i18n/messages/stats";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

/* -------------------------------------------------------------------------- */
/* Gràfica d'àrea: escoltes per dia                                            */
/* -------------------------------------------------------------------------- */

const H = 210;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
const PLOT_H = H - PAD.top - PAD.bottom;
const DEFAULT_W = 720;

/**
 * Amplada real del contenidor, en píxels. La gràfica dibuixa amb aquesta
 * amplada al viewBox (una unitat = un píxel) en lloc d'encongir tot l'SVG:
 * si l'escaléssim, al mòbil les etiquetes quedarien a mida de formiga.
 */
function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(DEFAULT_W);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(Math.max(280, Math.round(node.clientWidth)));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

/** Salt "net" entre línies de la graella: 1, 2, 5, 10, 20, 50... i mai menys d'1. */
function niceStep(value: number): number {
  if (value <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 5, 10]) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}

/**
 * Eix vertical amb valors rodons. Apuntem a unes tres divisions: així les
 * etiquetes són sempre nombres enters (mai un "12,5") i la línia aprofita
 * bona part de l'alçada en lloc de quedar arraulida a baix.
 */
function verticalAxis(rawMax: number): { max: number; ticks: number[] } {
  const peak = Math.max(1, rawMax);
  const step = niceStep(peak / 3);
  const max = Math.max(step, Math.ceil(peak / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v);
  return { max, ticks };
}

function DailyChart({
  data,
  t,
  locale,
}: {
  data: PlayStats["daily"];
  t: Translate<typeof m>;
  locale: string;
}) {
  const { ref, width: W } = useMeasuredWidth<HTMLDivElement>();
  const PLOT_W = W - PAD.left - PAD.right;
  const [hover, setHover] = useState<number | null>(null);
  const { max, ticks } = verticalAxis(Math.max(...data.map((d) => d.plays), 0));
  const stepX = data.length > 1 ? PLOT_W / (data.length - 1) : 0;
  const xOf = (i: number) =>
    PAD.left + (data.length > 1 ? i * stepX : PLOT_W / 2);
  const yOf = (v: number) => PAD.top + PLOT_H - (v / max) * PLOT_H;

  const line = data
    .map(
      (d, i) =>
        `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(d.plays).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${xOf(data.length - 1).toFixed(1)},${PAD.top + PLOT_H} L${xOf(0).toFixed(1)},${PAD.top + PLOT_H} Z`;

  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  const last = data[data.length - 1];
  const active = hover !== null ? data[hover] : undefined;

  return (
    <figure className="relative m-0" ref={ref}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`${t("chartDailyTitle")}: ${data.reduce((n, d) => n + d.plays, 0)} ${t("playsUnit")}`}
        onMouseLeave={() => setHover(null)}
      >
        {/* Graella: hairline, sòlida, per sota de les dades */}
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yOf(v)}
              y2={yOf(v)}
              stroke="var(--border)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={PAD.left - 8}
              y={yOf(v) + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[11px] tabular-nums"
            >
              {Math.round(v)}
            </text>
          </g>
        ))}

        <path d={area} fill="var(--chart-1)" opacity={0.1} />
        <path
          d={line}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Punt final amb anell del color de la superfície */}
        {last && (
          <circle
            cx={xOf(data.length - 1)}
            cy={yOf(last.plays)}
            r={4.5}
            fill="var(--chart-1)"
            stroke="var(--card)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* Retolació selectiva: només l'últim valor */}
        {last && last.plays > 0 && (
          <text
            x={xOf(data.length - 1)}
            y={Math.max(PAD.top + 10, yOf(last.plays) - 12)}
            textAnchor="end"
            className="fill-foreground text-[12px] font-semibold tabular-nums"
          >
            {last.plays}
          </text>
        )}

        {/* Creueta i punt de l'element sobre el qual hi ha el ratolí */}
        {active && hover !== null && (
          <g>
            <line
              x1={xOf(hover)}
              x2={xOf(hover)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              stroke="var(--muted-foreground)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={xOf(hover)}
              cy={yOf(active.plays)}
              r={4.5}
              fill="var(--chart-1)"
              stroke="var(--card)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Etiquetes de l'eix X: principi, mig i final */}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1]
          .filter((i, idx, arr) => data[i] && arr.indexOf(i) === idx)
          .map((i) => (
            <text
              key={i}
              x={xOf(i)}
              y={H - 8}
              textAnchor={
                i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"
              }
              className="fill-muted-foreground text-[11px]"
            >
              {dayLabel(data[i]!.day)}
            </text>
          ))}

        {/* Zona sensible: tota l'àrea del gràfic, no només els punts */}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={PLOT_W}
          height={PLOT_H}
          fill="transparent"
          onMouseMove={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - box.left) / box.width;
            const index = Math.round(ratio * (data.length - 1));
            setHover(Math.min(data.length - 1, Math.max(0, index)));
          }}
        />
      </svg>

      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(xOf(hover) / W) * 100}%` }}
        >
          <p className="font-semibold text-popover-foreground">
            {dayLabel(active.day)}
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-2 rounded-full"
              style={{ background: "var(--chart-1)" }}
            />
            <span className="tabular-nums">{active.plays}</span>{" "}
            {active.plays === 1 ? t("playsUnitOne") : t("playsUnit")}
          </p>
        </div>
      )}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Barres horitzontals: els pòdcasts més escoltats                             */
/* -------------------------------------------------------------------------- */

function TopChart({
  items,
  t,
}: {
  items: PlayStats["top"];
  t: Translate<typeof m>;
}) {
  const max = Math.max(...items.map((i) => i.plays), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[minmax(0,8rem)_1fr] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr]"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" title={item.title}>
              {item.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.class_name ?? t("noClass")}
            </p>
          </div>
          <div
            className="flex items-center gap-2"
            title={`${item.plays} ${item.plays === 1 ? t("playsUnitOne") : t("playsUnit")}`}
          >
            <div className="h-3.5 min-w-0 flex-1">
              <div
                className="h-full rounded-r-[4px] transition-[width] duration-300"
                style={{
                  width: `${Math.max(2, (item.plays / max) * 100)}%`,
                  background: "var(--chart-1)",
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">
              {item.plays}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Xifres destacades                                                           */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */

export function PlayStatsPanel({ schools }: { schools?: SchoolRow[] }) {
  const t = useT(m);
  const { lang } = useLang();
  const locale = localeOf(lang);
  const fetchStats = useServerFn(fetchPlayStatsFn);
  const [days, setDays] = useState<Range>(30);
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const isAdmin = schools !== undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["play-stats", days, isAdmin ? schoolId : "own"],
    queryFn: () =>
      fetchStats({ data: isAdmin ? { days, schoolId } : { days } }),
  });

  const rangeLabel = (r: Range) =>
    r === 7 ? t("range7") : r === 30 ? t("range30") : t("range90");
  const dayLabel = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  const tableRows = useMemo(
    () => (data ? data.daily.filter((d) => d.plays > 0) : []),
    [data],
  );

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <BarChart3 className="size-4" /> {t("title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>
      </div>

      {/* Filtres, en una sola fila sobre les gràfiques */}
      <div className="flex flex-wrap items-center gap-2">
        {isAdmin && (
          <Select
            value={schoolId === null ? "all" : String(schoolId)}
            onValueChange={(v) => setSchoolId(v === "all" ? null : Number(v))}
          >
            <SelectTrigger
              className="h-8 w-[220px] text-xs"
              aria-label={t("schoolLabel")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                {t("allSchools")}
              </SelectItem>
              {schools.map((s) => (
                <SelectItem key={s.id} value={String(s.id)} className="text-xs">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span
          className="flex items-center gap-1.5"
          role="group"
          aria-label={t("rangeLabel")}
        >
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              aria-pressed={days === r}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                days === r
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {rangeLabel(r)}
            </button>
          ))}
        </span>
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
              label={t("kpiTotal")}
              value={data.totalPlays}
              locale={locale}
            />
            <Kpi label={t("kpiLast7")} value={data.last7} locale={locale} />
            <Kpi
              label={t("kpiPlayed")}
              value={data.playedPodcasts}
              locale={locale}
            />
            <Kpi
              label={t("kpiPublished")}
              value={data.publishedPodcasts}
              locale={locale}
            />
          </div>

          {data.totalPlays === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <>
              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("chartDailyTitle")}
                </h3>
                <DailyChart data={data.daily} t={t} locale={locale} />
              </div>

              {data.top.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("chartTopTitle")}
                  </h3>
                  <TopChart items={data.top} t={t} />
                </div>
              )}

              <div>
                <button
                  onClick={() => setShowTable((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                >
                  <Table2 className="size-3.5" />{" "}
                  {showTable ? t("hideTable") : t("showTable")}
                </button>
                {showTable && (
                  <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-card">
                        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-3 py-1.5 font-semibold">
                            {t("colDay")}
                          </th>
                          <th className="px-3 py-1.5 text-right font-semibold">
                            {t("colPlays")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((d) => (
                          <tr key={d.day} className="border-t border-border/60">
                            <td className="px-3 py-1.5">{dayLabel(d.day)}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {d.plays}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
