import { Link } from "react-router-dom";
import type { Technology } from "../../types/technology";
import { loadAllTechnologies } from "../../data/loadTechnologies";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";

interface Props {
  tech: Technology;
}

export function DependencyGraph({ tech }: Props) {
  const all = loadAllTechnologies();
  const byId = new Map(all.map((t) => [t.id, t]));

  const prereqs = tech.prerequisites
    .map((id) => byId.get(id))
    .filter(Boolean) as Technology[];
  const unlocks = tech.unlocks
    .map((id) => byId.get(id))
    .filter(Boolean) as Technology[];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-codex-border bg-codex-surface p-4">
        <p className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
          Mini graph
        </p>
        <div className="mt-4 flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-6">
          <div className="flex flex-wrap justify-center gap-2">
            {prereqs.length ? (
              prereqs.map((p) => (
                <GraphNode key={p.id} tech={p} variant="prereq" />
              ))
            ) : (
              <span className="text-xs text-codex-muted">No prerequisites</span>
            )}
          </div>
          <span className="hidden font-mono text-codex-blue md:block" aria-hidden>
            →
          </span>
          <GraphNode tech={tech} variant="current" />
          <span className="hidden font-mono text-codex-blue md:block" aria-hidden>
            →
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {unlocks.length ? (
              unlocks.map((u) => (
                <GraphNode key={u.id} tech={u} variant="unlock" />
              ))
            ) : (
              <span className="text-xs text-codex-muted">No unlocks in index</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="font-display text-lg font-semibold text-codex-text">
            Prerequisites
          </h3>
          <ul className="mt-2 space-y-2">
            {prereqs.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/tech/${p.id}`}
                  className="block rounded border border-codex-border bg-codex-card px-3 py-2 text-sm hover:border-codex-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                >
                  <span className="font-medium text-codex-text">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-codex-muted">
                    {CATEGORY_LABEL[p.category]} ·{" "}
                    {p.era.replaceAll("-", " ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="font-display text-lg font-semibold text-codex-text">
            Unlocks
          </h3>
          <ul className="mt-2 space-y-2">
            {unlocks.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/tech/${u.id}`}
                  className="block rounded border border-codex-border bg-codex-card px-3 py-2 text-sm hover:border-codex-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                >
                  <span className="font-medium text-codex-text">{u.name}</span>
                  <span className="mt-0.5 block text-xs text-codex-muted">
                    {CATEGORY_LABEL[u.category]} ·{" "}
                    {u.era.replaceAll("-", " ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function GraphNode({
  tech,
  variant,
}: {
  tech: Technology;
  variant: "prereq" | "current" | "unlock";
}) {
  const border =
    variant === "current"
      ? "border-codex-gold shadow-node-glow"
      : "border-codex-border";
  return (
    <Link
      to={`/tech/${tech.id}`}
      className={`w-36 rounded-md border px-2 py-2 text-center text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${border} bg-codex-card hover:border-codex-gold/40`}
    >
      <span className="font-display font-semibold leading-tight text-codex-text line-clamp-3">
        {tech.name}
      </span>
    </Link>
  );
}
