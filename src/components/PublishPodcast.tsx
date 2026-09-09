import { useRef, useState } from "react";
import { Loader2, Send, CheckCircle2, ImagePlus, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publishPodcast } from "@/lib/publishPodcast";
import { CANVA_COVER_TEMPLATE_URL } from "@/lib/siteConfig";
import { localeOf, useLang, useT } from "@/lib/i18n";
import { publishPodcastMessages as m } from "@/lib/i18n/messages/publishPodcast";

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
  const t = useT(m);
  const { lang } = useLang();
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
      setError(t("coverNotImage"));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(t("coverTooBig"));
      return;
    }
    setError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    const blob = getBlob();
    if (!blob) return setError(t("noRecording"));
    if (!title.trim()) return setError(t("titleRequired"));

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
      setError(e instanceof Error ? e.message : t("publishFailed"));
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
        <CheckCircle2 className="mt-0.5 size-5 text-emerald-400" />
        <div className="text-sm">
          <p className="font-semibold">{t("sentTitle", { id: done.id })}</p>
          <p className="text-muted-foreground">
            {scheduled && publishAt
              ? t("scheduledInfo", { date: new Date(publishAt).toLocaleString(localeOf(lang)) })
              : t("pendingInfo")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="p-title">{t("titleLabel")}</Label>
          <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-desc">{t("descLabel")}</Label>
          <Textarea id="p-desc" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t("descPlaceholder")} />
        </div>
        <div>
          <Label htmlFor="p-author">{t("authorLabel")}</Label>
          <Input id="p-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t("authorPlaceholder")} />
        </div>
        <div>
          <Label htmlFor="p-cat">{t("catLabel")}</Label>
          <Input id="p-cat" value={cat} onChange={(e) => setCat(e.target.value)} placeholder={t("catPlaceholder")} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-tags">{t("tagsLabel")}</Label>
          <Input id="p-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t("tagsPlaceholder")} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("coverTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("coverIntro")}</p>
        <a
          href={CANVA_COVER_TEMPLATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
        >
          <Palette className="size-3.5" /> {t("canvaLink")}
        </a>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("canvaHelp")}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {coverPreview ? (
            <div className="relative">
              <img src={coverPreview} alt={t("coverAlt")} className="size-20 rounded-xl object-cover" />
              <button
                onClick={() => {
                  setCoverFile(null);
                  setCoverPreview(null);
                }}
                aria-label={t("removePhoto")}
                className="absolute -right-2 -top-2 rounded-full border border-border bg-card p-1 text-muted-foreground hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <span className="flex size-20 items-center justify-center rounded-xl bg-primary/15 text-4xl">{icon}</span>
          )}

          <Button type="button" variant="secondary" onClick={() => coverInput.current?.click()}>
            <ImagePlus className="size-4" /> {t("uploadPhoto")}
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
                aria-label={t("pickIcon", { emoji })}
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
          {t("scheduleLabel")}
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("scheduleHelp")}
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
        {sending ? t("sending") : t("publish")}
      </Button>
    </div>
  );
}
