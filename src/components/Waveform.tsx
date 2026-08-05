import { useEffect, useRef } from "react";

interface WaveformProps {
  analyser: AnalyserNode | null;
  recording: boolean;
  paused: boolean;
  className?: string;
}


/** Pista de onda: dibuja en vivo lo que se está grabando y deja el rastro. */
export function Waveform({ analyser, recording, paused, className = "h-40" }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!recording) historyRef.current = [];
  }, [recording]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const waveColor = styles.getPropertyValue("--wave").trim() || "#e0b64a";
    const liveColor = styles.getPropertyValue("--wave-live").trim() || "#e2603a";
    const gridColor = styles.getPropertyValue("--border").trim() || "#333";

    const data = analyser ? new Uint8Array(analyser.fftSize) : null;

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // línea central
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (analyser && data && recording && !paused) {
        analyser.getByteTimeDomainData(data as unknown as Uint8Array<ArrayBuffer>);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          peak = Math.max(peak, Math.abs((data[i] ?? 128) - 128) / 128);
        }
        historyRef.current.push(peak);
      }

      const barW = 3;
      const gap = 2;
      const maxBars = Math.floor(w / (barW + gap));
      const history = historyRef.current;
      const slice = history.slice(-maxBars);

      slice.forEach((peak, i) => {
        const isLast = i === slice.length - 1;
        const barH = Math.max(2, peak * (h * 0.9));
        const x = i * (barW + gap);
        ctx.fillStyle = isLast && recording && !paused ? liveColor : waveColor;
        ctx.globalAlpha = isLast ? 1 : 0.85;
        ctx.beginPath();
        ctx.roundRect(x, h / 2 - barH / 2, barW, barH, barW / 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    draw();
    return () => cancelAnimationFrame(frameRef.current);
  }, [analyser, recording, paused]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full rounded-xl bg-secondary/40 ${className}`}
      aria-label="Pista de onda de la grabación"
    />
  );
}

