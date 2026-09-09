import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Check, Radio } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { joinClassFn, fetchMyMembershipsFn, setActiveClassFn } from "@/lib/classes.functions";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { joinClassMessages as m } from "@/lib/i18n/messages/authButton";

/**
 * "Les meves classes": l'alumne veu de quines classes és, tria l'activa (on
 * van els pòdcasts que publica) i s'afegeix a una altra amb el seu codi.
 */
export function JoinClassDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useT(m);
  const { user, refreshProfile } = useAuth();
  const qc = useQueryClient();
  const fetchMemberships = useServerFn(fetchMyMembershipsFn);
  const setActive = useServerFn(setActiveClassFn);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => fetchMemberships({}),
    enabled: open && !!user,
  });
  const classes = data?.classes ?? [];
  const hasClasses = classes.length > 0;

  const submit = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const cls = await joinClassFn({ data: { code } });
      setJoined(cls.name);
      setCode("");
      refreshProfile();
      await qc.invalidateQueries({ queryKey: ["my-memberships"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("joinError"));
    } finally {
      setBusy(false);
    }
  };

  const activate = async (classId: number) => {
    setSwitching(classId);
    setError(null);
    try {
      await setActive({ data: { classId } });
      refreshProfile();
      await qc.invalidateQueries({ queryKey: ["my-memberships"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("joinError"));
    } finally {
      setSwitching(null);
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
          <DialogTitle>{hasClasses ? t("titleWithClasses") : t("title")}</DialogTitle>
          <DialogDescription>{hasClasses ? t("descriptionWithClasses") : t("description")}</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {t("loading")}
          </p>
        )}

        {hasClasses && (
          <ul className="space-y-1.5">
            {classes.map((c) => {
              const active = c.id === data?.activeClassId;
              return (
                <li
                  key={c.id}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                    active ? "border-accent/50 bg-accent/10" : "border-border bg-secondary/40"
                  }`}
                >
                  <span className="min-w-0 truncate font-semibold">
                    {c.name}
                    {c.share_to_school && <Radio className="ml-1.5 inline size-3 text-accent" aria-hidden="true" />}
                  </span>
                  {active ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
                      <Check className="size-3.5" /> {t("active")}
                    </span>
                  ) : (
                    <button
                      onClick={() => void activate(c.id)}
                      disabled={switching !== null}
                      className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold hover:bg-accent/10 disabled:opacity-50"
                    >
                      {switching === c.id ? <Loader2 className="size-3.5 animate-spin" /> : t("makeActive")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {joined && (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            <Check className="size-4 text-emerald-400" /> {t("joined", { name: joined })}
          </p>
        )}

        <div className="space-y-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t("codePlaceholder")}
            maxLength={6}
            className="text-center text-lg font-mono uppercase tracking-widest"
            onKeyDown={(e) => e.key === "Enter" && void submit()}
          />
          {error && <p className="text-sm text-destructive-foreground">{error}</p>}
          <Button className="w-full" onClick={() => void submit()} disabled={busy || !code.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("join")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
