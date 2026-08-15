import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { joinClassFn } from "@/lib/classes.functions";
import { useAuth } from "@/lib/auth";

export function JoinClassDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { refreshProfile } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  const submit = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const cls = await joinClassFn({ data: { code } });
      setJoined(cls.name);
      refreshProfile();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No s'ha pogut unir a la classe.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setCode("");
          setError(null);
          setJoined(null);
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Uneix-te a una classe</DialogTitle>
          <DialogDescription>Demana al teu mestre el codi de la classe.</DialogDescription>
        </DialogHeader>

        {joined ? (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            <Check className="size-4 text-emerald-400" /> T'has unit a «{joined}»!
          </p>
        ) : (
          <div className="space-y-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Codi de 6 caràcters"
              maxLength={6}
              className="text-center text-lg font-mono uppercase tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && void submit()}
            />
            {error && <p className="text-sm text-destructive-foreground">{error}</p>}
            <Button className="w-full" onClick={() => void submit()} disabled={busy || !code.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Uneix-te
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
