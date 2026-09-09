import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptTermsFn } from "@/lib/settings.functions";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { acceptTermsGateMessages as m } from "@/lib/i18n/messages/acceptTermsGate";

/**
 * Bloqueja l'accés a un panell (mestre, coordinador) fins que la persona
 * accepti explícitament les condicions d'ús — són elles qui superviesen i
 * aproven el contingut que es publica, així que cal que ho tinguin clar.
 */
export function AcceptTermsGate({ children }: { children: React.ReactNode }) {
  const t = useT(m);
  const { termsAcceptedAt, refreshProfile } = useAuth();
  const accept = useServerFn(acceptTermsFn);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  if (termsAcceptedAt) return <>{children}</>;

  const confirm = async () => {
    setBusy(true);
    try {
      await accept({});
      refreshProfile();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="studio-bg flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <FileText className="size-6" />
      </span>
      <div className="max-w-md">
        <p className="text-lg font-semibold">{t("title")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("introBefore")}{" "}
          <Link to="/termes" target="_blank" className="text-accent hover:underline">
            {t("termsLink")}
          </Link>{" "}
          {t("introAfter")}
        </p>
      </div>
      <label className="flex max-w-md items-start gap-2 text-left text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 size-4"
        />
        {t("checkboxLabel")}
      </label>
      <Button onClick={() => void confirm()} disabled={!checked || busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        {t("accept")}
      </Button>
    </main>
  );
}
