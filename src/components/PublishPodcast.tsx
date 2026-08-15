import { useRef, useState } from "react";
import { Loader2, Send, CheckCircle2, ImagePlus, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publishPodcast } from "@/lib/publishPodcast";
import { CANVA_COVER_TEMPLATE_URL } from "@/lib/siteConfig";

const COVER_ICONS = ["🎙️", "📻", "📰", "🎧", "🌍", "⚽", "🔬", "🎭", "🐾", "🎵", "🍕", "🚀"];

interface Props {
  getBlob: () => Blob | null;
  transcript: string;
  dur: number;
  defaultTitle?: string;
  defaultDesc?: string;
  template: string | null;
}

export function PublishPodcast({
  getBlob,
  transcript,
  dur,
  defaultTitle = "",
  defaultDesc = "",
  template,
}: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [desc, setDesc] = useState(defaultDesc);
  const [cat, setCat] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [icon, setIcon] = useState<string>("🎙️");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [scheduled, setScheduled] = useState(false);
  const [publishAt, setPublishAt] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ id: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);

  const pickCover = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("La caràtula ha de ser una imatge (JPG o PNG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("La imatge és massa gran (màxim 3 MB).");
      return;
    }
    setError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    const blob = getBlob();
    if (!blob) return setError("Encara no hi ha cap gravació per publicar.");
    if (!title.trim()) return setError("Posa-hi un títol abans de publicar.");

    setSending(true);
    setError(null);
    try {
      const row = await publishPodcast({
        blob,
        title: title.trim(),
        desc: desc.trim(),
        cat: cat.trim(),
        author: author.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        transcript,
        dur,
        template,
        cover: coverFile ? null : icon,
        coverFile,
        publishAt: scheduled && publishAt ? new Date(publishAt).toISOString() : null,
      });
      setDone({ id: row.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No s'ha pogut publicar el pòdcast.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <CheckCircle2 className="mt-0.5 size-5 text-emerald-400" />
        <div className="text-sm">
          <p className="font-semibold">Enviat! Pòdcast #{done.id}</p>
          <p className="text-muted-foreground">
            {scheduled && publishAt
              ? `Quan el mestre l'aprovi, apareixerà al mur el ${new Date(publishAt).toLocaleString("ca-ES")}.`
              : "Queda pendent de revisió. Quan el mestre l'aprovi, sortirà al mur de la classe."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="p-title">Títol *</Label>
          <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="El pòdcast de 5è B" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-desc">Descripció</Label>
          <Textarea id="p-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="De què parla el vostre pòdcast?" />
        </div>
        <div>
          <Label htmlFor="p-author">Qui el fa</Label>
          <Input id="p-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Marta i Pau" />
        </div>
        <div>
          <Label htmlFor="p-cat">Categoria</Label>
          <Input id="p-cat" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Notícies" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-tags">Etiquetes (separades per comes)</Label>
          <Input id="p-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="escola, natura, entrevista" />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caràtula</p>
        <p className="mt-1 text-sm text-muted-foreground">Puja una foto o tria una icona per al mur.</p>
        <a
          href={CANVA_COVER_TEMPLATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
        >
          <Palette className="size-3.5" /> Fes la caràtula amb la plantilla de Canva
        </a>
        <p className="mt-1 text-xs text-muted-foreground">
          Obre la plantilla, personalitza-la amb el teu títol, descarrega-la com a imatge (PNG o JPG) i puja-la aquí baix.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {coverPreview ? (
            <div className="relative">
              <img src={coverPreview} alt="Caràtula triada" className="size-20 rounded-xl object-cover" />
              <button
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
                aria-label="Treure la foto"
                className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <span className="flex size-20 items-center justify-center rounded-xl bg-primary/15 text-4xl">{icon}</span>
          )}

          <Button type="button" variant="secondary" onClick={() => coverInput.current?.click()}>
            <ImagePlus className="size-4" /> Pujar una foto
          </Button>
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickCover(e.target.files?.[0] ?? null)}
          />
        </div>

        {!coverPreview && (
          <div className="mt-3 flex flex-wrap gap-2">
            {COVER_ICONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                aria-pressed={icon === emoji}
                aria-label={`Triar la icona ${emoji}`}
                className={`rounded-xl border p-2 text-xl transition-transform hover:scale-110 ${
                  icon === emoji ? "border-accent bg-accent/20" : "border-border bg-card"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={scheduled}
            onChange={(e) => setScheduled(e.target.checked)}
            className="size-4 accent-current"
          />
          Programar la publicació
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          Tria el dia i l'hora en què vols que aparegui al mur (un cop aprovat).
        </p>
        {scheduled && (
          <Input
            type="datetime-local"
            className="mt-3 max-w-xs"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
          />
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      <Button size="lg" onClick={() => void submit()} disabled={sending}>
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {sending ? "Enviant..." : "Publicar el pòdcast"}
      </Button>
    </div>
  );
}
