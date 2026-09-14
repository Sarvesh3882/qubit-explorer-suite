import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Learning Map" },
  { to: "/composer", label: "Composer" },
];

export function SiteHeader({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <header
      className={
        "sticky top-0 z-40 border-b " +
        (dark
          ? "border-workspace-line bg-workspace text-workspace-foreground"
          : "border-border bg-background/90 backdrop-blur")
      }
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
            Q
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-semibold tracking-tight">
              QUBIT
            </span>
            <span
              className={
                "block truncate text-[11px] " +
                (dark ? "text-workspace-muted" : "text-muted-foreground")
              }
            >
              Interactive Quantum Learning &amp; Simulation
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={
                "rounded-md px-3 py-1.5 font-medium transition-colors " +
                (dark
                  ? "text-workspace-muted hover:bg-workspace-panel hover:text-workspace-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground")
              }
              activeProps={{
                className: dark
                  ? "rounded-md px-3 py-1.5 font-medium bg-workspace-panel text-workspace-foreground"
                  : "rounded-md px-3 py-1.5 font-medium bg-secondary text-foreground",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
