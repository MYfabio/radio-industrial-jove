import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptTermsFn } from "@/lib/settings.functions";
import { useAuth } from "@/lib/auth";

/**
 * Bloqueja l'accés a un panell (mestre, coordinador) fins que la persona
 * accepti explícitament les condicions d'ús — són elles qui superviesen i
 * aproven el contingut que es publica, així que cal que ho tinguin clar.
 */
export function AcceptTermsGate({ children }: { children: React.ReactNode }) {
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
        <p className="text-lg font-semibold">Abans de continuar</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Aquest panell et permet aprovar i publicar contingut de l'alumnat. Com a docent o
          coordinador/a, ets tu qui en supervisa i n'és responsable — llegeix les{" "}
          <Link to="/termes" target="_blank" className="text-accent hover:underline">
            condicions d'ús
          </Link>{" "}
          abans de fer-ho servir.
        </p>
      </div>
      <label className="flex max-w-md items-start gap-2 text-left text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 size-4"
        />
        He llegit i accepto les condicions d'ús, i entenc que la supervisió i responsabilitat del
        contingut que aprovi és meva.
      </label>
      <Button onClick={() => void confirm()} disabled={!checked || busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Accepto i continuo
      </Button>
    </main>
  );
}
