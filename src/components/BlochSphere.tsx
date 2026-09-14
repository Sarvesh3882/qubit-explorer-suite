interface Props {
  vector: { x: number; y: number; z: number };
  label: string;
}

/** Lightweight isometric projection of a Bloch vector. */
export function BlochSphere({ vector, label }: Props) {
  const R = 46;
  const cx = 60;
  const cy = 60;
  // isometric-ish projection: x to lower-right, y to lower-left, z up
  const px = cx + R * (vector.x * 0.82 - vector.y * 0.82);
  const py = cy - R * (vector.z * 0.92 - vector.x * 0.3 - vector.y * 0.3);
  const len = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 120" className="h-[120px] w-[120px]">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--workspace-line)" />
        <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.34} fill="none" stroke="var(--workspace-line)" />
        <ellipse cx={cx} cy={cy} rx={R * 0.34} ry={R} fill="none" stroke="var(--workspace-line)" opacity={0.5} />
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="var(--workspace-line)" opacity={0.7} />
        <line
          x1={cx}
          y1={cy}
          x2={px}
          y2={py}
          stroke="var(--workspace-accent)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <circle cx={px} cy={py} r={3.6} fill="var(--workspace-accent)" />
        <text x={cx} y={cy - R - 5} textAnchor="middle" fontSize="9" fill="var(--workspace-muted)">
          |0&gt;
        </text>
        <text x={cx} y={cy + R + 12} textAnchor="middle" fontSize="9" fill="var(--workspace-muted)">
          |1&gt;
        </text>
      </svg>
      <span className="font-mono text-[10px] text-workspace-muted">
        {label} · r={len.toFixed(2)}
      </span>
      <span className="font-mono text-[10px] text-workspace-muted">
        x {vector.x.toFixed(2)} y {vector.y.toFixed(2)} z {vector.z.toFixed(2)}
      </span>
    </div>
  );
}
