const SIZE = 160;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PassRateGauge({ passed, total }: { passed: number; total: number }) {
  const rate = total === 0 ? 0 : passed / total;
  const offset = CIRCUMFERENCE * (1 - rate);
  const percentLabel = total === 0 ? "—" : `${Math.round(rate * 100)}%`;

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#2A3244"
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#4FD1C5"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-foreground">{percentLabel}</span>
        <span className="font-body text-xs text-muted">pass rate</span>
      </div>
    </div>
  );
}
