import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { MODULES, REGIONS, getModule } from "@/lib/curriculum";

export const Route = createFileRoute("/modules/$moduleId")({
  loader: ({ params }) => {
    const module = getModule(params.moduleId);
    if (!module) throw notFound();
    return { module };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Module unavailable | QUBIT" }, { name: "robots", content: "noindex" }],
      };
    const { module } = loaderData;
    const title = `${module.title} — QUBIT Learning Module`;
    return {
      meta: [
        { title },
        { name: "description", content: module.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: module.summary },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ModulePage,
});

function ModulePage() {
  const { module } = Route.useLoaderData();
  const related = module.connects.map(getModule).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-5 py-8">
        <Link to="/" className="text-xs font-medium text-primary hover:underline">
          ‹ Back to learning map
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <article>
            <header className="border-b border-border pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {REGIONS[module.region].label} · {module.lessonCount} lessons · {module.minutes} min
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{module.title}</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {module.summary}
              </p>
            </header>

            <div className="mt-6 space-y-8">
              {module.lessons.map((lesson, i) => (
                <section key={lesson.title}>
                  <h2 className="flex items-baseline gap-3 text-lg font-semibold">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {lesson.title}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {lesson.body.map((p, j) => (
                      <p key={j} className="text-[15px] leading-7 text-foreground/85">
                        {p}
                      </p>
                    ))}
                  </div>
                  {lesson.formula && (
                    <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-secondary px-4 py-3 font-mono text-sm text-foreground">
                      {lesson.formula}
                    </pre>
                  )}
                </section>
              ))}
            </div>

            {related.length > 0 && (
              <section className="mt-10 border-t border-border pt-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Continue with
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {related.map((r) => (
                    <Link
                      key={r!.id}
                      to="/modules/$moduleId"
                      params={{ moduleId: r!.id }}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                    >
                      {r!.title}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-20">
            <section className="overflow-hidden rounded-lg border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Simulation space</h2>
                <p className="text-xs text-muted-foreground">{module.simulation.title}</p>
              </header>
              <div className="aspect-video bg-workspace">
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-workspace-line text-workspace-accent">
                    ▶
                  </span>
                  <p className="text-xs text-workspace-muted">{module.simulation.caption}</p>
                </div>
              </div>
              <p className="border-t border-border px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                This panel plays any rendered video simulation (Manim animations included) for the
                module. Drop a source URL in and it streams here.
              </p>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Practice in the composer</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Build the circuit from this module on the qubit grid, switch between Qiskit and
                QpiAI code, and read the probabilities and Bloch vectors live.
              </p>
              <Link
                to="/composer"
                className="mt-3 block rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open composer
              </Link>
            </section>

            <section className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-sm font-semibold">Module index</h2>
              <ul className="mt-2 space-y-1">
                {MODULES.map((m) => (
                  <li key={m.id}>
                    <Link
                      to="/modules/$moduleId"
                      params={{ moduleId: m.id }}
                      className="flex items-center gap-2 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      activeProps={{
                        className:
                          "flex items-center gap-2 rounded px-2 py-1 text-xs bg-secondary text-foreground font-medium",
                      }}
                    >
                      <span className="font-mono text-[10px]">{m.code}</span>
                      <span className="truncate">{m.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
