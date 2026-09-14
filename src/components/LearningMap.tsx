import { Link } from "@tanstack/react-router";
import { MODULES, REGIONS } from "@/lib/curriculum";

const REGION_LABELS: { region: keyof typeof REGIONS; x: number; y: number }[] = [
  { region: "algorithms", x: 20, y: 5 },
  { region: "introduction", x: 46, y: 24 },
  { region: "optimization", x: 20, y: 92 },
  { region: "hardware", x: 84, y: 78 },
];

export function LearningMap() {
  const edges = MODULES.flatMap((m) =>
    m.connects
      .map((id) => MODULES.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => ({ from: m, to: t! })),
  );

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-map shadow-sm">
      <div className="relative aspect-[16/10] w-full">
        {/* terrain regions */}
        <div className="absolute inset-0">
          <div className="absolute left-[6%] top-[-8%] h-[46%] w-[68%] rounded-[48%] bg-region-algo" />
          <div className="absolute left-[24%] top-[18%] h-[52%] w-[46%] rounded-[46%] bg-region-intro" />
          <div className="absolute left-[4%] bottom-[-14%] h-[52%] w-[62%] rounded-[48%] bg-region-opt" />
          <div className="absolute right-[-10%] bottom-[2%] h-[62%] w-[52%] rounded-[46%] bg-region-hw" />
          <div className="absolute inset-0 bg-map-grain opacity-60" />
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {edges.map(({ from, to }, i) => (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              className="text-map-line"
              strokeWidth={0.25}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {REGION_LABELS.map((r) => (
          <span
            key={r.region}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            style={{ left: `${r.x}%`, top: `${r.y}%` }}
          >
            {REGIONS[r.region].label}
          </span>
        ))}

        {MODULES.map((m) => (
          <Link
            key={m.id}
            to="/modules/$moduleId"
            params={{ moduleId: m.id }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card text-center shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md">
              <span className="font-display text-sm font-bold leading-none text-foreground">
                {m.code}
              </span>
              <span className="text-[10px] leading-none text-muted-foreground">
                0/{m.lessonCount}
              </span>
            </span>
            <span className="pointer-events-none absolute left-1/2 top-full mt-2 w-40 -translate-x-1/2 rounded-md border border-border bg-card px-2 py-1.5 text-center text-[11px] font-medium text-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              {m.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
