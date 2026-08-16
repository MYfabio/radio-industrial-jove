import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

const STORAGE_KEY = "cookieNoticeSeen";

/**
 * Avís mínim i transparent: aquest lloc només fa servir la sessió d'inici
 * amb Google per identificar-te (cap cookie de publicitat ni de seguiment).
 * No cal un gestor de consentiment perquè no hi ha cookies opcionals a triar.
 */
export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Si localStorage no és accessible, no mostrem res per no ser molestos.
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // No passa res si no es pot desar la preferència.
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3">
      <div className="flex w-full max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg">
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          Aquest lloc només fa servir una galeta tècnica per mantenir la teva sessió quan inicies sessió amb Google.
          No fem servir cookies de publicitat ni de seguiment.{" "}
          <Link to="/privacitat" className="text-accent hover:underline">
            Més informació
          </Link>
          .
        </p>
        <Button size="sm" onClick={dismiss}>
          D'acord
        </Button>
      </div>
    </div>
  );
}
