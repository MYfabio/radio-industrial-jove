/**
 * Guia «Gravar en parella amb dos cascos USB». Viu a /ajuda#gravar-en-parella
 * i es pot imprimir o desar en PDF: en imprimir només surt aquesta guia.
 */
import { Headphones, Printer, AlertTriangle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { guideMessages as m } from "@/lib/i18n/messages/guide";

export const GUIDE_ANCHOR = "gravar-en-parella";

const PRINT_CSS = `
@media print {
  body.radio-print-guide * { visibility: hidden !important; }
  body.radio-print-guide #${GUIDE_ANCHOR},
  body.radio-print-guide #${GUIDE_ANCHOR} * { visibility: visible !important; }
  body.radio-print-guide #${GUIDE_ANCHOR} {
    position: absolute; inset: 0 auto auto 0; width: 100%;
    background: #fff !important; color: #111 !important; border: 0 !important;
    padding: 0 !important; font-size: 11pt;
  }
  body.radio-print-guide #${GUIDE_ANCHOR} * { color: #111 !important; background: transparent !important; }
  body.radio-print-guide .guide-no-print { display: none !important; }
  @page { margin: 14mm; }
}`;

function printGuide() {
  document.body.classList.add("radio-print-guide");
  const done = () => {
    document.body.classList.remove("radio-print-guide");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}

export function RecordingGuide() {
  const t = useT(m);
  const steps = [
    "setup1",
    "setup2",
    "setup3",
    "setup4",
    "setup5",
    "setup6",
  ] as const;
  const tips = ["tip1", "tip2", "tip3", "tip4"] as const;
  const fixes = [
    ["fix1Q", "fix1A"],
    ["fix2Q", "fix2A"],
    ["fix3Q", "fix3A"],
    ["fix4Q", "fix4A"],
    ["fix5Q", "fix5A"],
    ["fix6Q", "fix6A"],
  ] as const;

  return (
    <section
      id={GUIDE_ANCHOR}
      className="scroll-mt-6 space-y-4 rounded-2xl border border-accent/30 bg-accent/5 p-5"
    >
      <style>{PRINT_CSS}</style>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Headphones className="size-5 text-accent" /> {t("title")}
          </h2>
          <p className="mt-1 text-muted-foreground">{t("intro")}</p>
        </div>
        <button
          type="button"
          onClick={printGuide}
          className="guide-no-print inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
        >
          <Printer className="size-3.5" /> {t("print")}
        </button>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">{t("needTitle")}</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>{t("need1")}</li>
          <li>{t("need2")}</li>
          <li>{t("need3")}</li>
        </ul>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">{t("setupTitle")}</h3>
        <ol className="list-inside list-decimal space-y-1">
          {steps.map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">{t("tipsTitle")}</h3>
        <ul className="list-inside list-disc space-y-1">
          {tips.map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">{t("fixTitle")}</h3>
        <div className="space-y-2">
          {fixes.map(([q, a]) => (
            <div key={q}>
              <p className="font-semibold">{t(q)}</p>
              <p className="text-muted-foreground">{t(a)}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 font-semibold">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <span>
          {t("ruleTitle")}: {t("rule")}
        </span>
      </p>
    </section>
  );
}
