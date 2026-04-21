import { Link } from "react-router-dom";
import { loadTechnologySummaries } from "../data/loadTechnologies";
import {
  resolveFoundationChains,
  resolveFoundationNodes,
} from "../utils/foundations";
import { CATEGORY_LABEL } from "../utils/categoryMeta";
import { verificationDotClass } from "../utils/verificationUi";
import { useCodexMode } from "../context/useCodexMode";

export function FoundationsPage() {
  const { isSpace } = useCodexMode();
  const technologies = loadTechnologySummaries();
  const nodes = resolveFoundationNodes(technologies);
  const chains = resolveFoundationChains(technologies);
  const accent = isSpace ? "text-codex-space" : "text-codex-gold";
  const availableCount = nodes.filter((node) => node.tech).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 pb-24 text-codex-text md:px-6 md:pb-10">
      <header className="overflow-hidden rounded-2xl border border-codex-border bg-codex-surface p-6 shadow-2xl md:p-8">
        <p className={`font-mono text-xs uppercase tracking-[0.28em] ${accent}`}>
          Foundations Mode
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight md:text-5xl">
          Start where both collapse recovery and space settlement start: constrained inputs.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-codex-secondary md:text-lg">
          These are the bottom-of-tree capabilities that turn survival into a rebuildable
          system: heat, cutting edges, cordage, containers, clean water, food security,
          medical basics, materials, and durable records.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-codex-border bg-codex-card p-4">
            <p className="font-mono text-2xl font-bold text-codex-text">{availableCount}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-codex-muted">
              foundation nodes present
            </p>
          </div>
          <div className="rounded-lg border border-codex-border bg-codex-card p-4">
            <p className="font-mono text-2xl font-bold text-codex-text">{chains.length}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-codex-muted">
              bootstrap chains
            </p>
          </div>
          <div className="rounded-lg border border-codex-border bg-codex-card p-4">
            <p className="font-mono text-2xl font-bold text-codex-text">
              {isSpace ? "Space" : "Earth"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-codex-muted">
              current interpretation
            </p>
          </div>
        </div>
      </header>

      <section className="mt-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-codex-text">
              Primitive Stack
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-codex-secondary">
              The first priority is not more advanced nodes. It is making these entries
              accurate, diagrammed, source-backed, printable, and reviewed.
            </p>
          </div>
          <Link
            to="/?q=fire"
            className="text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          >
            See them in the tree
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node) => {
            const tech = node.tech;
            return (
              <article
                key={node.id}
                className="flex min-h-full flex-col rounded-xl border border-codex-border bg-codex-card p-4 shadow-lg"
              >
                {tech ? (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-codex-muted">
                          {CATEGORY_LABEL[tech.category]} · difficulty {tech.difficulty}
                        </p>
                        <h3 className="mt-1 font-display text-xl font-semibold text-codex-text">
                          {tech.name}
                        </h3>
                      </div>
                      <span
                        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${verificationDotClass(
                          tech.verification.status
                        )}`}
                        title={tech.verification.status}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-codex-secondary">
                      {node.reason}
                    </p>
                    <dl className="mt-4 space-y-3 text-xs leading-relaxed">
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-codex-muted">
                          Collapse
                        </dt>
                        <dd className="mt-1 text-codex-secondary">{node.collapseUse}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-codex-muted">
                          Space
                        </dt>
                        <dd className="mt-1 text-codex-secondary">{node.spaceUse}</dd>
                      </div>
                    </dl>
                    <div className="mt-auto pt-4">
                      <Link
                        to={`/tech/${tech.id}`}
                        className={`inline-flex rounded border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                          isSpace
                            ? "border-codex-space/60 text-codex-space hover:bg-codex-space/10"
                            : "border-codex-gold/60 text-codex-gold hover:bg-codex-gold/10"
                        }`}
                      >
                        Open documentary
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-display text-xl font-semibold text-red-300">
                      Missing node: {node.id}
                    </h3>
                    <p className="mt-3 text-sm text-codex-secondary">
                      This foundation entry is planned but not present in the technology data.
                    </p>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-codex-text">
          Bootstrap Chains
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-codex-secondary">
          Chains are curated paths for turning primitive capabilities into settlement
          functions. They are the first version of the future pathfinder.
        </p>
        <div className="mt-5 space-y-4">
          {chains.map((chain) => (
            <article
              key={chain.id}
              className="rounded-xl border border-codex-border bg-codex-surface p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-display text-xl font-semibold text-codex-text">
                    {chain.title}
                  </h3>
                  <p className="mt-1 text-sm text-codex-secondary">{chain.goal}</p>
                </div>
                {chain.missing.length ? (
                  <span className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-300">
                    Missing: {chain.missing.join(", ")}
                  </span>
                ) : null}
              </div>
              <ol className="mt-4 flex flex-wrap gap-2">
                {chain.technologies.map((tech, index) => (
                  <li key={tech.id} className="flex items-center gap-2">
                    {index > 0 ? (
                      <span className="text-codex-muted" aria-hidden>
                        →
                      </span>
                    ) : null}
                    <Link
                      to={`/tech/${tech.id}`}
                      className="rounded-full border border-codex-border bg-codex-card px-3 py-1.5 text-xs text-codex-secondary hover:border-codex-blue hover:text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                    >
                      {tech.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
