import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "radio-tema";

/** Botó per canviar entre mode clar i fosc (es recorda al navegador). */
export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem(KEY, next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Canviar a mode clar" : "Canviar a mode fosc"}
      title={dark ? "Mode clar" : "Mode fosc"}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      <span className="hidden sm:inline">{dark ? "Clar" : "Fosc"}</span>
    </button>
  );
}
