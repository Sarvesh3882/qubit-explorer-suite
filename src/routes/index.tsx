import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LearningMap } from "@/components/LearningMap";
import { MODULES, PATHS, getModule } from "@/lib/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QUBIT — Interactive Quantum Learning & Simulation Platform" },
      {
        name: "description",
        content:
          "Learn quantum computing through a guided module map, then build circuits in an interactive Qiskit and QpiAI composer with live analytics.",
      },
      { property: "og:title", content: "QUBIT — Interactive Quantum Learning & Simulation" },
      {
        property: "og:description",
        content:
          "A guided quantum curriculum map plus an interactive circuit composer with Qiskit and QpiAI code synchronisation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-5 py-8">
        <section className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Learning Map
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Your quantum journey starts here
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Choose a module to explore theory, worked mathematics and a simulation space — or follow
            a guided learning path from single-qubit states through to hardware orchestration. Every
            module links directly into the composer so you can run what you just read.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/composer"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Open the composer
            </Link>
            <Link
              to="/modules/$moduleId"
              params={{ moduleId: "single-qubit" }}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Start with Single Qubit States
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Browse learning paths
            </h2>
            {PATHS.map((p) => {
              const total = p.modules.reduce(
                (sum, id) => sum + (getModule(id)?.lessonCount ?? 0),
                0,
              );
              return (
                <div key={p.name} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold">{p.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.modules.length} modules · {total} lessons
                  </p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
                    <div className="h-1.5 w-0 rounded-full bg-primary" />
                  </div>
                  <Link
                    to="/modules/$moduleId"
                    params={{ moduleId: p.modules[0]! }}
                    className="mt-3 block rounded-md border border-primary/40 py-1.5 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                  >
                    Explore now
                  </Link>
                </div>
              );
            })}
          </aside>

          <div className="space-y-6">
            <LearningMap />
            <section>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                All modules
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {MODULES.map((m) => (
                  <Link
                    key={m.id}
                    to="/modules/$moduleId"
                    params={{ moduleId: m.id }}
                    className="rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-secondary font-mono text-[11px] font-bold">
                        {m.code}
                      </span>
                      <h3 className="truncate text-sm font-semibold">{m.title}</h3>
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {m.summary}
                    </p>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {m.lessonCount} lessons · {m.minutes} min
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
