import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import {
  GATE_META,
  simulate,
  toQiskit,
  toQpiAI,
  parseQiskit,
  type Circuit,
  type GateType,
  type Op,
} from "@/lib/quantum";

export const Route = createFileRoute("/composer")({
  head: () => ({
    meta: [
      { title: "Composer — Build Qiskit & QpiAI Circuits | QUBIT" },
      {
        name: "description",
        content:
          "Place gates on a qubit grid, sync them with Qiskit and QpiAI code, and read live probabilities, statevector and Bloch analytics.",
      },
      { property: "og:title", content: "QUBIT Composer — Qiskit & QpiAI circuit workspace" },
      {
        property: "og:description",
        content:
          "Interactive gate grid with bi-directional code synchronisation and real statevector analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComposerPage,
});

const PALETTE: { group: string; gates: GateType[] }[] = [
  { group: "Superposition", gates: ["H"] },
  { group: "Pauli", gates: ["X", "Y", "Z"] },
  { group: "Rotations", gates: ["RX", "RY", "RZ"] },
  { group: "Two-qubit", gates: ["CNOT", "SWAP"] },
  { group: "Operations", gates: ["MEASURE", "BARRIER"] },
];

const GATE_COLOR: Record<GateType, string> = {
  H: "bg-gate-hadamard",
  X: "bg-gate-pauli",
  Y: "bg-gate-pauli",
  Z: "bg-gate-pauli",
  RX: "bg-gate-rotation",
  RY: "bg-gate-rotation",
  RZ: "bg-gate-rotation",
  CNOT: "bg-gate-entangle",
  SWAP: "bg-gate-entangle",
  MEASURE: "bg-gate-meta",
  BARRIER: "bg-gate-meta",
};

const CELL = 56;

const BELL: Circuit = {
  qubits: 3,
  cols: 10,
  ops: [
    { id: "a", type: "H", q: 0, col: 0 },
    { id: "b", type: "CNOT", q: 0, q2: 1, col: 1 },
  ],
};

let uid = 100;
const newId = () => `op${uid++}`;

function ComposerPage() {
  const [circuit, setCircuit] = useState<Circuit>(BELL);
  const [tool, setTool] = useState<GateType>("H");
  const [angle, setAngle] = useState(Math.PI / 2);
  const [pending, setPending] = useState<{ q: number; col: number } | null>(null);
  const [codeTab, setCodeTab] = useState<"qiskit" | "qpiai">("qiskit");
  const [draft, setDraft] = useState("");
  const [dirty, setDirty] = useState(false);

  const result = useMemo(() => simulate(circuit), [circuit]);
  const generated = codeTab === "qiskit" ? toQiskit(circuit) : toQpiAI(circuit);

  useEffect(() => {
    if (!dirty) setDraft(generated);
  }, [generated, dirty]);

  const opAt = (q: number, col: number) =>
    circuit.ops.find((o) => o.col === col && (o.q === q || o.q2 === q));

  const place = (type: GateType, q: number, col: number) => {
    const meta = GATE_META[type];
    if (meta.kind === "double") {
      if (pending && pending.col === col && pending.q !== q) {
        const op: Op = { id: newId(), type, q: pending.q, q2: q, col };
        setCircuit((c) => ({ ...c, ops: [...c.ops, op] }));
        setPending(null);
      } else {
        setPending({ q, col });
      }
      return;
    }
    const op: Op = {
      id: newId(),
      type,
      q,
      col,
      ...(meta.angled ? { angle } : {}),
    };
    setCircuit((c) => ({ ...c, ops: [...c.ops, op] }));
  };

  const handleCell = (q: number, col: number) => {
    setDirty(false);
    const existing = opAt(q, col);
    if (existing) {
      setCircuit((c) => ({ ...c, ops: c.ops.filter((o) => o.id !== existing.id) }));
      setPending(null);
      return;
    }
    place(tool, q, col);
  };

  const setQubits = (n: number) =>
    setCircuit((c) => ({
      ...c,
      qubits: n,
      ops: c.ops.filter((o) => o.q < n && (o.q2 === undefined || o.q2 < n)),
    }));

  const applyCode = () => {
    setCircuit((c) => parseQiskit(draft, c));
    setDirty(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-workspace text-workspace-foreground">
      <SiteHeader tone="dark" />

      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-3 p-3 lg:grid lg:grid-cols-[210px_minmax(0,1fr)_400px] lg:items-start">
        {/* Palette */}
        <aside className="panel-dark p-3">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-workspace-muted">
            Operations
          </h2>
          <div className="space-y-3">
            {PALETTE.map((grp) => (
              <div key={grp.group}>
                <p className="mb-1.5 text-[10px] uppercase tracking-wider text-workspace-muted">
                  {grp.group}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {grp.gates.map((g) => (
                    <button
                      key={g}
                      title={GATE_META[g].hint}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/gate", g)}
                      onClick={() => {
                        setTool(g);
                        setPending(null);
                      }}
                      className={
                        "h-9 w-11 rounded font-mono text-xs font-semibold text-white transition-all " +
                        GATE_COLOR[g] +
                        (tool === g
                          ? " ring-2 ring-workspace-accent ring-offset-2 ring-offset-workspace-panel"
                          : " opacity-85 hover:opacity-100")
                      }
                    >
                      {GATE_META[g].label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {GATE_META[tool].angled && (
            <div className="mt-4 border-t border-workspace-line pt-3">
              <label className="text-[10px] uppercase tracking-wider text-workspace-muted">
                Angle θ = {angle.toFixed(3)} rad
              </label>
              <input
                type="range"
                min={0}
                max={Math.PI * 2}
                step={0.01}
                value={angle}
                onChange={(e) => setAngle(parseFloat(e.target.value))}
                className="mt-2 w-full accent-[var(--workspace-accent)]"
              />
            </div>
          )}

          <div className="mt-4 border-t border-workspace-line pt-3">
            <label className="text-[10px] uppercase tracking-wider text-workspace-muted">
              Qubits
            </label>
            <div className="mt-2 flex gap-1">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setQubits(n)}
                  className={
                    "h-7 flex-1 rounded text-xs font-medium " +
                    (circuit.qubits === n
                      ? "bg-workspace-elevated text-workspace-foreground"
                      : "text-workspace-muted hover:bg-workspace-elevated")
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setCircuit((c) => ({ ...c, ops: [] }));
                setPending(null);
                setDirty(false);
              }}
              className="mt-3 w-full rounded border border-workspace-line py-1.5 text-xs text-workspace-muted hover:text-workspace-foreground"
            >
              Clear circuit
            </button>
          </div>
        </aside>

        {/* Canvas + code */}
        <main className="flex min-w-0 flex-col gap-3">
          <section className="panel-dark overflow-hidden">
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-workspace-line px-3 py-2">
              <p className="min-w-0 truncate text-xs text-workspace-muted">
                {pending
                  ? `Select the second wire in column ${pending.col + 1} to complete ${GATE_META[tool].label}`
                  : "Click a cell to place the selected gate · click a placed gate to remove it"}
              </p>
              <span className="shrink-0 font-mono text-[11px] text-workspace-muted">
                {circuit.ops.length} ops · depth{" "}
                {circuit.ops.reduce((m, o) => Math.max(m, o.col + 1), 0)}
              </span>
            </header>

            <div className="overflow-x-auto p-4">
              <div className="relative" style={{ minWidth: circuit.cols * CELL + 60 }}>
                {Array.from({ length: circuit.qubits }).map((_, q) => (
                  <div key={q} className="flex items-center" style={{ height: CELL }}>
                    <span className="w-12 shrink-0 font-mono text-xs text-workspace-muted">
                      q[{q}]
                    </span>
                    <div className="relative flex">
                      <div className="absolute left-0 right-0 top-1/2 h-px bg-workspace-line" />
                      {Array.from({ length: circuit.cols }).map((__, col) => {
                        const op = opAt(q, col);
                        const isPending = pending?.q === q && pending.col === col;
                        return (
                          <button
                            key={col}
                            onClick={() => handleCell(q, col)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const g = e.dataTransfer.getData("text/gate") as GateType;
                              if (!g) return;
                              setTool(g);
                              setDirty(false);
                              place(g, q, col);
                            }}
                            className="relative z-10 grid place-items-center"
                            style={{ width: CELL, height: CELL }}
                          >
                            {op ? <OpCell op={op} q={q} /> : (
                              <span
                                className={
                                  "h-8 w-8 rounded border border-dashed transition-colors " +
                                  (isPending
                                    ? "border-workspace-accent bg-workspace-accent/15"
                                    : "border-transparent hover:border-workspace-line hover:bg-workspace-elevated/60")
                                }
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* two-qubit connectors */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  {circuit.ops
                    .filter((o) => o.q2 !== undefined)
                    .map((o) => {
                      const x = 48 + o.col * CELL + CELL / 2;
                      const y1 = o.q * CELL + CELL / 2;
                      const y2 = o.q2! * CELL + CELL / 2;
                      return (
                        <line
                          key={o.id}
                          x1={x}
                          y1={y1}
                          x2={x}
                          y2={y2}
                          stroke="var(--gate-entangle)"
                          strokeWidth={2}
                        />
                      );
                    })}
                </svg>
              </div>
              <div className="flex items-center" style={{ height: 36 }}>
                <span className="w-12 shrink-0 font-mono text-xs text-workspace-muted">
                  c{circuit.qubits}
                </span>
                <div className="h-px flex-1 bg-workspace-line" />
              </div>
            </div>
          </section>

          <section className="panel-dark flex flex-col">
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-workspace-line px-3 py-2">
              <div className="flex min-w-0 gap-1">
                {(["qiskit", "qpiai"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCodeTab(t);
                      setDirty(false);
                    }}
                    className={
                      "rounded px-2.5 py-1 text-xs font-medium " +
                      (codeTab === t
                        ? "bg-workspace-elevated text-workspace-foreground"
                        : "text-workspace-muted hover:text-workspace-foreground")
                    }
                  >
                    {t === "qiskit" ? "Qiskit (Python)" : "QpiAI Runtime"}
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {dirty && (
                  <span className="font-mono text-[10px] text-workspace-accent">edited</span>
                )}
                <button
                  onClick={applyCode}
                  disabled={codeTab !== "qiskit"}
                  title={
                    codeTab === "qiskit"
                      ? "Re-render the canvas from this code"
                      : "Canvas sync is available from the Qiskit view"
                  }
                  className="rounded bg-workspace-accent px-3 py-1 text-xs font-semibold text-workspace disabled:opacity-40"
                >
                  Sync to canvas
                </button>
              </div>
            </header>
            <textarea
              value={draft}
              spellCheck={false}
              onChange={(e) => {
                setDraft(e.target.value);
                setDirty(true);
              }}
              className="h-64 w-full resize-y bg-transparent p-4 font-mono text-[12.5px] leading-relaxed text-workspace-foreground outline-none"
            />
          </section>
        </main>

        {/* Analytics */}
        <div className="flex flex-col gap-3">
          <AnalyticsPanel result={result} />
          <section className="panel-dark p-3 text-[11px] leading-relaxed text-workspace-muted">
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-workspace-foreground">
              Engine
            </h3>
            Local statevector engine, {circuit.qubits} wires, exact amplitudes. Qiskit Aer and QpiAI
            runtime execution attach here once backend credentials and endpoints are supplied.
          </section>
        </div>
      </div>
    </div>
  );
}

function OpCell({ op, q }: { op: Op; q: number }) {
  if (op.type === "BARRIER")
    return <span className="h-10 w-0.5 rounded bg-gate-meta" />;
  if (op.type === "MEASURE")
    return (
      <span className="grid h-8 w-8 place-items-center rounded border border-workspace-line bg-gate-meta font-mono text-[11px] font-semibold text-white">
        M
      </span>
    );
  if (op.type === "CNOT")
    return op.q === q ? (
      <span className="h-3.5 w-3.5 rounded-full bg-gate-entangle" />
    ) : (
      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-gate-entangle text-gate-entangle">
        <span className="text-sm leading-none">+</span>
      </span>
    );
  if (op.type === "SWAP")
    return <span className="font-mono text-lg leading-none text-gate-entangle">×</span>;

  const angled = GATE_META[op.type].angled;
  return (
    <span
      className={
        "grid h-8 w-9 place-items-center rounded font-mono text-[11px] font-semibold text-white " +
        GATE_COLOR[op.type]
      }
      title={angled ? `θ = ${(op.angle ?? 0).toFixed(3)}` : GATE_META[op.type].hint}
    >
      {GATE_META[op.type].label}
    </span>
  );
}
