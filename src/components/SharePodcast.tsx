/**
 * Botó de compartir un pòdcast: obre una finestreta amb l'enllaç a punt de
 * copiar (per enganxar-lo, p. ex., en un article de La Claqueta) i, si el
 * navegador ho permet, el menú de compartir del sistema.
 */
import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useT } from "@/lib/i18n";
import { sharePodcastMessages as m } from "@/lib/i18n/messages/sharePodcast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Enllaç a la pàgina pròpia d'un pòdcast públic. */
export function podcastUrl(id: number) {
  return `${window.location.origin}/podcast/${id}`;
}

export function SharePodcast({
  title,
  getUrl,
  isPublic = true,
  variant = "button",
}: {
  title: string;
  /** Es calcula en obrir (necessita `window`). */
  getUrl: () => string;
  /** Si és fals, l'enllaç porta al mur de la classe i s'avisa. */
  isPublic?: boolean;
  /** "icon": només la icona (sota el pòster); "button": icona i text. */
  variant?: "icon" | "button";
}) {
  const t = useT(m);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Sense permís de porta-retalls: deixem el text seleccionat perquè es copiï a mà.
      document.querySelector<HTMLInputElement>("[data-share-url]")?.select();
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // Cancel·lat per l'usuari.
    }
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setUrl(getUrl());
          setCopied(false);
        }
      }}
    >
      <PopoverTrigger asChild>
        {variant === "icon" ? (
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label={t("shareTitle", { title })}
            title={t("share")}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Share2 className="size-3.5" />
          </button>
        ) : (
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-secondary">
            <Share2 className="size-4" />
            {t("share")}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="text-sm font-semibold" htmlFor="share-url">
          {t("linkLabel")}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="share-url"
            data-share-url
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs"
          />
          <button
            onClick={() => void copy()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {isPublic ? t("linkHelp") : t("wallLinkHelp")}
        </p>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={() => void nativeShare()}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <Share2 className="size-3.5" /> {t("shareWith")}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
