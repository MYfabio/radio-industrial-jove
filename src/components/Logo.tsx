/** Logotip: cercle fosc amb un equalitzador d'ona. Les barres es mouen soles. */
const BARS = [
  { x: 20, h: 18 },
  { x: 34, h: 32 },
  { x: 48, h: 56 },
  { x: 62, h: 50 },
  { x: 76, h: 28 },
];

export function Logo({ className = "size-10", animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="logoBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9A2E" />
          <stop offset="100%" stopColor="#9CAA3E" />
        </linearGradient>
      </defs>
      {animated && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .logo-bar {
              animation: logoEq 1.1s ease-in-out infinite;
              transform-box: fill-box;
              transform-origin: center;
            }
            .logo-bar:nth-child(1) { animation-delay: 0s; }
            .logo-bar:nth-child(2) { animation-delay: 0.12s; }
            .logo-bar:nth-child(3) { animation-delay: 0.24s; }
            .logo-bar:nth-child(4) { animation-delay: 0.08s; }
            .logo-bar:nth-child(5) { animation-delay: 0.2s; }
          }
          @keyframes logoEq {
            0%, 100% { transform: scaleY(0.55); }
            50% { transform: scaleY(1); }
          }
        `}</style>
      )}
      <circle cx="50" cy="50" r="48" fill="#10182B" />
      {BARS.map((bar, i) => (
        <rect
          key={i}
          className={animated ? "logo-bar" : undefined}
          x={bar.x}
          y={50 - bar.h / 2}
          width={9}
          height={bar.h}
          rx={4.5}
          fill="url(#logoBarGrad)"
        />
      ))}
    </svg>
  );
}
