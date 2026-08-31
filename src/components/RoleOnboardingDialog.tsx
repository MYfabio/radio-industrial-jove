import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Backpack, Loader2, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { chooseRoleFn } from "@/lib/settings.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * Primer accés amb Google: preguntem si és alumne o docent per no liar-nos.
 * Dir "docent" no dona permisos — crea una sol·licitud que revisa un humà.
 */
export function RoleOnboardingDialog() {
  const { user, role, declaredRole, loading, refreshProfile } = useAuth();
  const choose = useServerFn(chooseRoleFn);
  const [busy, setBusy] = useState<"alumne" | "docent" | null>(null);
  const [sentDocent, setSentDocent] = useState(false);

  const shouldAsk = !loading && !!user && role === "alumne" && declaredRole === null;
  if (!shouldAsk && !sentDocent) return null;

  const pick = async (choice: "alumne" | "docent") => {
    setBusy(choice);
    try {
      await choose({ data: { choice } });
      if (choice === "docent") setSentDocent(true);
      refreshProfile();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        // Tancar el diàleg sense triar compta com a "alumne" (l'opció segura).
        if (!open && shouldAsk && busy === null) void pick("alumne");
      }}
    >
      <DialogContent className="max-w-md">
        {sentDocent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Check className="size-6" />
            </span>
            <DialogTitle>Sol·licitud enviada!</DialogTitle>
            <DialogDescription className="max-w-xs">
              Hem avisat perquè et donin accés de docent. Mentrestant ja pots gravar i publicar com
              qualsevol alumne.
            </DialogDescription>
            <button
              onClick={() => setSentDocent(false)}
              className="mt-1 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              Entesos
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Benvingut/da! Què ets?</DialogTitle>
              <DialogDescription>
                Ens ajuda a ensenyar-te el que et toca. Ho pots canviar més endavant des de la
                pàgina de registre.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => void pick("alumne")}
                disabled={busy !== null}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary/40 p-5 font-semibold transition-all hover:scale-[1.02] hover:border-accent"
              >
                {busy === "alumne" ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : (
                  <Backpack className="size-8 text-accent" />
                )}
                Sóc alumne
              </button>
              <button
                onClick={() => void pick("docent")}
                disabled={busy !== null}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-secondary/40 p-5 font-semibold transition-all hover:scale-[1.02] hover:border-accent"
              >
                {busy === "docent" ? (
                  <Loader2 className="size-8 animate-spin" />
                ) : (
                  <GraduationCap className="size-8 text-accent" />
                )}
                Sóc docent
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
