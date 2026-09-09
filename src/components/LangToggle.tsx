import { Languages } from "lucide-react";
import { LANGS, LANG_LABELS, useLang } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/** Selector d'idioma (català · castellà · anglès); es recorda al navegador. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={LANG_LABELS[lang]}
        title={LANG_LABELS[lang]}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Languages className="size-3.5" />
        <span className="uppercase">{lang}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLang(l)}
            className={l === lang ? "font-semibold" : ""}
          >
            <span className="w-6 uppercase text-xs text-muted-foreground">
              {l}
            </span>{" "}
            {LANG_LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
