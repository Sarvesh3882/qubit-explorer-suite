import { useEffect, useRef, useState } from "react";

interface Props {
  vector: { x: number; y: number; z: number };
  label: string;
  size?: number;
}

type V3 = { x: number; y: number; z: number };

function rotate(p: V3, yaw: number, pitch: number) {
  // rotate around z (yaw), then around x (pitch)
  const x1 = p.x * Math.cos(yaw) - p.y * Math.sin(yaw);
  const y1 = p.x * Math.sin(yaw) + p.y * Math.cos(yaw);
  const z1 = p.z;
  const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
  const z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
  return { x: x1, y: y2, z: z2 };
}

/** Interactive 3D Bloch sphere: drag to orbit, double-click to reset. */
export function BlochSphere({ vector, label, size = 150 }: Props) {
  const R = size * 0.36;
  const c = size / 2;
  const [yaw, setYaw] = useState(-0.5);
  const [pitch, setPitch] = useState(-1.05);
  const [spin, setSpin] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!spin) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setYaw((y) => y + dt * 0.35);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spin]);

  const proj = (p: V3) => {
    const r = rotate(p, yaw, pitch);
    return { sx: c + r.x * R, sy: c - r.z * R, depth: r.y };
  };

  const ring = (axis: "xy" | "xz" | "yz") => {
    const pts: string[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      const p: V3 =
        axis === "xy"
          ? { x: Math.cos(a), y: Math.sin(a), z: 0 }
          : axis === "xz"
            ? { x: Math.cos(a), y: 0, z: Math.sin(a) }
            : { x: 0, y: Math.cos(a), z: Math.sin(a) };
      const q = proj(p);
      pts.push(`${q.sx.toFixed(2)},${q.sy.toFixed(2)}`);
    }
    return pts.join(" ");
  };

  const len = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  const tip = proj(vector);
  const origin = proj({ x: 0, y: 0, z: 0 });
  const axes: { p: V3; t: string }[] = [
    { p: { x: 1.18, y: 0, z: 0 }, t: "x" },
    { p: { x: 0, y: 1.18, z: 0 }, t: "y" },
    { p: { x: 0, y: 0, z: 1.22 }, t: "|0>" },
    { p: { x: 0, y: 0, z: -1.22 }, t: "|1>" },
  ];

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY };
    setSpin(false);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setYaw((y) => y + dx * 0.012);
    setPitch((p) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, p - dy * 0.012)));
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div className="flex select-none flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
        className="cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onDoubleClick={() => {
          setYaw(-0.5);
          setPitch(-1.05);
          setSpin(true);
        }}
      >
        <defs>
          <radialGradient id={`sph-${label}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="var(--workspace-elevated)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--workspace-panel)" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={R} fill={`url(#sph-${label})`} stroke="var(--workspace-line)" />
        <polyline points={ring("xy")} fill="none" stroke="var(--workspace-line)" strokeWidth={1} />
        <polyline points={ring("xz")} fill="none" stroke="var(--workspace-line)" strokeWidth={1} opacity={0.7} />
        <polyline points={ring("yz")} fill="none" stroke="var(--workspace-line)" strokeWidth={1} opacity={0.5} />

        {axes.map((a) => {
          const q = proj(a.p);
          const o = proj({ x: 0, y: 0, z: 0 });
          return (
            <g key={a.t} opacity={q.depth > 0 ? 0.45 : 1}>
              <line
                x1={o.sx}
                y1={o.sy}
                x2={q.sx}
                y2={q.sy}
                stroke="var(--workspace-line)"
                strokeDasharray="2 3"
              />
              <text
                x={q.sx}
                y={q.sy}
                dy={3}
                textAnchor="middle"
                fontSize="9"
                fill="var(--workspace-muted)"
              >
                {a.t}
              </text>
            </g>
          );
        })}

        {len > 1e-6 && (
          <g>
            <line
              x1={origin.sx}
              y1={origin.sy}
              x2={tip.sx}
              y2={tip.sy}
              stroke="var(--workspace-accent)"
              strokeWidth={2.4}
              strokeLinecap="round"
              opacity={tip.depth > 0 ? 0.55 : 1}
            />
            <circle
              cx={tip.sx}
              cy={tip.sy}
              r={4}
              fill="var(--workspace-accent)"
              opacity={tip.depth > 0 ? 0.55 : 1}
            />
          </g>
        )}
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
