import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { levelMeterMessages as m } from "@/lib/i18n/messages/levelMeter";

interface Props {
  analyser: AnalyserNode | null;
  active: boolean;
}

type Level = "silenci" | "baix" | "be" | "alt";

const COPY: Record<Level, { key: keyof typeof m; className: string }> = {
  silenci: { key: "silence", className: "text-muted-foreground" },
  baix: { key: "tooQuiet", className: "text-amber-400" },
  be: { key: "perfect", className: "text-emerald-400" },
  alt: { key: "tooLoud", className: "text-destructive" },
};

/** Mesurador de veu en directe: avisa l'alumne si parla massa fluix o massa fort. */
export function LevelMeter({ analyser, active }: Props) {
  const t = useT(m);
  const [rms, setRms] = useState(0);
  const [peak, setPeak] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!analyser || !active) {
      setRms(0);
      setPeak(0);
      return;
    }
    const data = new Float32Array(analyser.fftSize);
    let hold = 0;

    const tick = () => {
      analyser.getFloatTimeDomainData(data);
      let sum = 0;
      let max = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = data[i] ?? 0;
        sum += v * v;
        if (Math.abs(v) > max) max = Math.abs(v);
      }
      const value = Math.sqrt(sum / data.length);
      setRms((prev) => prev * 0.7 + value * 0.3);
      hold = Math.max(max, hold * 0.95);
      setPeak(hold);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [analyser, active]);

  const level: Level =
    !active || rms < 0.008 ? "silenci" : peak > 0.97 || rms > 0.35 ? "alt" : rms < 0.03 ? "baix" : "be";

  const pct = Math.min(100, Math.round(rms * 320));
  const copy = COPY[level];

  return (
    <div className="mt-4 rounded-2xl border border-border bg-secondary/30 p-3">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{t("voiceLevel")}</span>
        <span className={copy.className}>{t(copy.key)}</span>
      </div>
      <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-background">
        {/* zona recomanada */}
        <div className="absolute inset-y-0 left-[10%] right-[65%] bg-emerald-500/15" />
        <div
          className={`h-full rounded-full transition-[width] duration-75 ${
            level === "alt" ? "bg-destructive" : level === "baix" ? "bg-amber-400" : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{t("scaleQuiet")}</span>
        <span>{t("scaleGood")}</span>
        <span>{t("scaleLoud")}</span>
      </div>
    </div>
  );
}
