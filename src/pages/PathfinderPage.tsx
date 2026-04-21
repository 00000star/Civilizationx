import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { loadTechnologySummaries } from "../data/loadTechnologies";
import { shortestPrerequisitePath } from "../utils/pathfinder";
import { CATEGORY_LABEL } from "../utils/categoryMeta";
import { useCodexMode } from "../context/useCodexMode";

const DEFAULT_FROM = "fire";
const DEFAULT_TO = "radio-broadcast-and-receiver";

export function PathfinderPage() {
  const [params, setParams] = useSearchParams();
  const { isSpace } = useCodexMode();
  const technologies = useMemo(() => loadTechnologySummaries(), []);
  const byId = useMemo(
    () => new Map(technologies.map((tech) => [tech.id, tech])),
    [technologies]
  );

  const from = params.get("from") || DEFAULT_FROM;
  const to = params.get("to") || DEFAULT_TO;
  const path = useMemo(
    () => shortestPrerequisitePath(technologies, from, to),
    [technologies, from, to]
  );

  const setField = (key: "from" | "to", value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  const swap = () => {
    const next = new URLSearchParams(params);
    next.set("from", to);
    next.set("to", from);
    setParams(next, { replace: true });
  };

  const accent = isSpace ? "text-codex-space" : "text-codex-gold";

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 pb-24 text-codex-text md:px-6 md:pb-10">
      <header className="rounded-2xl border border-codex-border bg-codex-surface p-6 shadow-xl md:p-8">
        <p className={`font-mono text-xs uppercase tracking-[0.28em] ${accent}`}>
          Pathfinder
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight md:text-5xl">
          Find the capability chain from one technology to another.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-codex-secondary md:text-lg">
          Pathfinder follows prerequisite edges forward. It answers questions like
          “how do we get from fire to radio?” and exposes the chain that must exist
          before a target capability becomes realistic.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-codex-border bg-codex-card p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-codex-muted">
              Starting capability
            </span>
            <select
              value={from}
              onChange={(event) => setField("from", event.target.value)}
              className="mt-2 w-full rounded border border-codex-border bg-codex-bg px-3 py-2 text-sm text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              {technologies.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={swap}
            className="rounded border border-codex-border px-3 py-2 text-sm text-codex-secondary hover:border-codex-blue hover:text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          >
            Swap
          </button>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-codex-muted">
              Target capability
            </span>
            <select
              value={to}
              onChange={(event) => setField("to", event.target.value)}
              className="mt-2 w-full rounded border border-codex-border bg-codex-bg px-3 py-2 text-sm text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              {technologies.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-6">
        {path ? (
          <div className="rounded-xl border border-codex-border bg-codex-surface p-4 md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-codex-text">
                  {path.length} step{path.length === 1 ? "" : "s"}
                </h2>
                <p className="mt-1 text-sm text-codex-secondary">
                  Shortest currently known chain from{" "}
                  <span className="text-codex-text">{byId.get(from)?.name ?? from}</span>{" "}
                  to <span className="text-codex-text">{byId.get(to)?.name ?? to}</span>.
                </p>
              </div>
              <Link
                to={`/?node=${encodeURIComponent(to)}`}
                className="text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
              >
                Show target in tree
              </Link>
            </div>

            <ol className="mt-6 space-y-4">
              {path.map((id, index) => {
                const tech = byId.get(id);
                if (!tech) return null;
                return (
                  <li key={id} className="relative rounded-lg border border-codex-border bg-codex-card p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-mono text-xs text-codex-muted">
                          Step {index + 1} · {CATEGORY_LABEL[tech.category]} · difficulty{" "}
                          {tech.difficulty}
                        </p>
                        <h3 className="mt-1 font-display text-xl font-semibold text-codex-text">
                          {tech.name}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-codex-secondary">
                          {tech.tagline}
                        </p>
                      </div>
                      <Link
                        to={`/tech/${tech.id}`}
                        className={`shrink-0 rounded border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                          isSpace
                            ? "border-codex-space/60 text-codex-space hover:bg-codex-space/10"
                            : "border-codex-gold/60 text-codex-gold hover:bg-codex-gold/10"
                        }`}
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/60 bg-amber-950/20 p-5">
            <h2 className="font-display text-xl font-semibold text-amber-100">
              No path found
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/80">
              The current graph does not show a prerequisite route from{" "}
              <span className="font-semibold">{byId.get(from)?.name ?? from}</span> to{" "}
              <span className="font-semibold">{byId.get(to)?.name ?? to}</span>. This may
              mean the graph needs alternative routes, missing intermediate technologies, or
              corrected prerequisite relationships.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
