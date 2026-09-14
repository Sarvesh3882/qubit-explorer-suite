import { useState } from "react";
import { amplitudes, type SimResult } from "@/lib/quantum";
import { BlochSphere } from "./BlochSphere";

const TABS = ["Probabilities", "Statevector", "Bloch"] as const;

export function AnalyticsPanel({ result }: { result: SimResult }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Probabilities");
  const shown = result.probabilities
    .map((p, i) => ({ p, label: result.labels[i]! }))
    .filter((d) => d.p > 1e-6);

  return (
    <section className="panel-dark flex min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-1 border-b border-workspace-line px-3 py-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "rounded px-2.5 py-1 text-xs font-medium transition-colors " +
              (tab === t
                ? "bg-workspace-elevated text-workspace-foreground"
                : "text-workspace-muted hover:text-workspace-foreground")
            }
          >
            {t}
          </button>
        ))}
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {tab === "Probabilities" && (
          <div>
            <div className="flex h-44 items-end gap-1.5 border-b border-l border-workspace-line pl-2">
              {shown.map((d) => (
                <div key={d.label} className="group flex flex-1 flex-col items-center justify-end">
                  <span className="mb-1 font-mono text-[10px] text-workspace-muted">
                    {(d.p * 100).toFixed(1)}
                  </span>
                  <div
                    className="w-full max-w-9 rounded-t bg-workspace-accent transition-all"
                    style={{ height: `${Math.max(2, d.p * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex gap-1.5 pl-2">
              {shown.map((d) => (
                <span
                  key={d.label}
                  className="flex-1 text-center font-mono text-[10px] text-workspace-muted"
                >
                  {d.label}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-workspace-muted">
              Measurement probability (%) over computational basis states, little-endian ordering.
            </p>
          </div>
        )}

        {tab === "Statevector" && (
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-workspace-muted">
                <th className="pb-2">Basis</th>
                <th className="pb-2">Amplitude</th>
                <th className="pb-2 text-right">|a|²</th>
              </tr>
            </thead>
            <tbody className="text-workspace-foreground">
              {amplitudes(result.state).map((a) => (
                <tr key={a.label} className="border-t border-workspace-line/60">
                  <td className="py-1.5">|{a.label}&gt;</td>
                  <td className="py-1.5">
                    {a.re.toFixed(4)} {a.im < 0 ? "-" : "+"} {Math.abs(a.im).toFixed(4)}i
                  </td>
                  <td className="py-1.5 text-right">{a.prob.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "Bloch" && (
          <div className="grid grid-cols-2 gap-3">
            {result.bloch.map((v, i) => (
              <BlochSphere key={i} vector={v} label={`q[${i}]`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
