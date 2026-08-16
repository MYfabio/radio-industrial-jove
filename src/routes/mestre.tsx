import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthButton } from "@/components/AuthButton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GraduationCap, Loader2, Check, X, Clock, Copy, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAllPodcasts, reviewPodcastFn, type PodcastRow } from "@/lib/podcasts.functions";
import { createClassFn, fetchMyClasses } from "@/lib/classes.functions";
import { SITE_NAME } from "@/lib/siteConfig";
import { notifyPodcastsChanged } from "@/lib/podcastSync";
import { useAuth } from "@/lib/auth";


export const Route = createFileRoute("/mestre")({
  head: () => ({
    meta: [
      { title: "Panell del mestre — Revisar pòdcasts de la classe" },
      {
        name: "description",
        content:
          "Escolta els pòdcasts pendents, deixa un comentari privat per a l'alumne i decideix quan surten al mur.",
      },
      { property: "og:title", content: `Panell del mestre — ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Revisa, comenta i programa la publicació dels pòdcasts de la classe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherPanel,
});

const BADGE: Record<string, string> = {
  pendent: "border-amber-500/50 bg-amber-500/15 text-amber-400",
  aprovat: "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  rebutjat: "border-destructive/50 bg-destructive/15 text-destructive-foreground",
};

function Row({ p, onSaved }: { p: PodcastRow; onSaved: () => void }) {
  const review = useServerFn(reviewPodcastFn);
  const [note, setNote] = useState(p.teacher_note ?? "");
  const [when, setWhen] = useState(p.publish_at ? p.publish_at.slice(0, 16) : "");
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const save = async (status: "pendent" | "aprovat" | "rebutjat", label: string) => {
    setBusy(label);
    try {
      await review({
        data: {
          id: p.id,
          status,
          teacherNote: note.trim() || null,
          publishAt: when ? new Date(when).toISOString() : null,
        },
      });
      notifyPodcastsChanged();
      setSaved(
        status === "aprovat"
          ? when
            ? "Aprovat: sortirà al mur el dia indicat."
            : "Aprovat: ja es veu al mur de la classe."
          : status === "rebutjat"
            ? "Rebutjat: no es veurà al mur."
            : "Comentari desat.",
      );
      onSaved();
    } finally {
      setBusy(null);
    }
  };


  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        {p.has_cover_image ? (
          <img src={`/api/public/cover/${p.id}`} alt="" className="size-14 rounded-xl object-cover" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-xl bg-primary/15 text-2xl">
            {p.cover ?? "🎙️"}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{p.title}</h3>
          <p className="text-sm text-muted-foreground">
            {p.author || "Anònim"} · #{p.id} · {new Date(p.created_at).toLocaleDateString("ca-ES")}
            {p.class_name && (
              <>
                {" "}
                ·{" "}
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                  <Users className="size-3" /> {p.class_name}
                </span>
              </>
            )}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            BADGE[p.status] ?? BADGE["pendent"]
          }`}
        >
          {p.status}
        </span>
      </div>

      <audio controls preload="none" src={`/api/public/audio/${p.id}`} className="mt-3 w-full" />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Comentari privat per a l'alumne
          </label>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Molt bona entonació! La propera vegada allarga una mica la introducció."
          />
        </div>
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3" /> Sortir al mur el dia
          </label>
          <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          <p className="mt-1 text-xs text-muted-foreground">Deixa-ho buit per publicar-lo de seguida.</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => void save("aprovat", "aprovat")} disabled={busy !== null}>
          {busy === "aprovat" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {p.status === "aprovat" ? "Actualitzar al mur" : "Aprovar i publicar al mur"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            void save((p.status as "pendent" | "aprovat" | "rebutjat") ?? "pendent", "desar")
          }
          disabled={busy !== null}
        >
          {busy === "desar" ? <Loader2 className="size-4 animate-spin" /> : null}
          Desar comentari
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => void save("rebutjat", "rebutjat")}
          disabled={busy !== null}
        >
          <X className="size-4" /> Treure del mur
        </Button>
        {saved && <span className="text-xs font-semibold text-accent">{saved}</span>}
      </div>

    </article>
  );
}

function ClassesPanel() {
  const { user, loading: authLoading } = useAuth();
  const create = useServerFn(createClassFn);
  const list = useServerFn(fetchMyClasses);
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", "meves"],
    queryFn: () => list({}),
    enabled: !!user,
  });

  const copyCode = async (id: number, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
  };

  const submit = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await create({ data: { name: name.trim() } });
      setName("");
      await qc.invalidateQueries({ queryKey: ["classes"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No s'ha pogut crear la classe.");
    } finally {
      setCreating(false);
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <section className="mb-8 rounded-2xl border border-dashed border-border p-5 text-center">
        <p className="text-sm text-muted-foreground">
          Inicia sessió per crear classes i tenir-hi codis d'invitació per als alumnes.
        </p>
        <div className="mt-3 flex justify-center">
          <AuthButton />
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Users className="size-4" /> Les teves classes
      </h2>

      {isLoading && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregant...
        </p>
      )}

      {!isLoading && classes && classes.length > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm font-semibold">{c.name}</span>
              <button
                onClick={() => void copyCode(c.id, c.invite_code)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-xs font-bold tracking-widest hover:bg-accent/10"
              >
                {copiedId === c.id ? <Check className="size-3.5 text-accent" /> : <Copy className="size-3.5" />}
                {c.invite_code}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la classe (p. ex. 5è B)"
          className="max-w-xs"
          onKeyDown={(e) => e.key === "Enter" && void submit()}
        />
        <Button size="sm" onClick={() => void submit()} disabled={creating || !name.trim()}>
          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Crea una classe
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive-foreground">{error}</p>}
    </section>
  );
}

function TeacherPanel() {
  const qc = useQueryClient();
  const list = useServerFn(fetchAllPodcasts);
  const { data, isLoading } = useQuery({ queryKey: ["podcasts", "tots"], queryFn: () => list({}) });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["podcasts"] });
  };

  const pending = (data ?? []).filter((p) => p.status === "pendent");
  const rest = (data ?? []).filter((p) => p.status !== "pendent");

  return (
    <main className="studio-bg min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panell del mestre</h1>
            <p className="text-sm text-muted-foreground">
              Escolta, comenta i decideix quan surt cada pòdcast al mur.
            </p>
          </div>
          <span className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </span>
          <Link
            to="/estudi"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Anar a l'estudi
          </Link>
          <Link
            to="/mur"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Veure el mur
          </Link>
        </header>

        <ClassesPanel />

        {isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregant els pòdcasts...
          </p>
        )}

        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pendents de revisar ({pending.length})
        </h2>
        <div className="space-y-4">
          {pending.map((p) => (
            <Row key={p.id} p={p} onSaved={refresh} />
          ))}
          {!isLoading && pending.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
              Cap pòdcast pendent. Tot revisat!
            </p>
          )}
        </div>

        {rest.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ja revisats ({rest.length})
            </h2>
            <div className="space-y-4">
              {rest.map((p) => (
                <Row key={p.id} p={p} onSaved={refresh} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
