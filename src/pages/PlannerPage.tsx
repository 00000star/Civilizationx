import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/ui/LoadingState";
import { useCodexMode } from "../context/useCodexMode";
import { useTechnologies } from "../hooks/useTechnologies";
import {
  PLANNER_GOALS,
  PLANNER_SCENARIOS,
  makeCodexPlan,
  type CodexPlan,
} from "../utils/codexPlanner";

const DEFAULT_SCENARIO = "primitive-camp";
const DEFAULT_GOAL = "clean-water";

export function PlannerPage() {
  const { technologies, loading } = useTechnologies();
  const { isSpace } = useCodexMode();
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO);
  const [goalId, setGoalId] = useState(DEFAULT_GOAL);

  const plan = useMemo(
    () => makeCodexPlan(technologies, scenarioId, goalId),
    [technologies, scenarioId, goalId]
  );

  const accent = isSpace ? "text-codex-space" : "text-codex-gold";

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-8 pb-24 text-codex-text md:px-6 md:pb-10">
      <header className="rounded-2xl border border-codex-border bg-codex-surface p-6 shadow-xl md:p-8">
        <p className={`font-mono text-xs uppercase tracking-[0.28em] ${accent}`}>
          Build planner
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight md:text-5xl">
          What can we build next, and what blocks us?
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-codex-secondary md:text-lg">
          The planner turns The Codex from a reference into an operating manual. Choose a starting
          condition and a goal; it calculates prerequisite chains, immediate builds, material
          bottlenecks, hazards, and weak documentation that must not be trusted blindly.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-codex-border bg-codex-card p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-codex-muted">
              Starting condition
            </span>
            <select
              value={scenarioId}
              onChange={(event) => setScenarioId(event.target.value)}
              className="mt-2 w-full rounded border border-codex-border bg-codex-bg px-3 py-2 text-sm text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              {PLANNER_SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-codex-secondary">{plan.scenario.context}</p>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-codex-muted">
              Goal
            </span>
            <select
              value={goalId}
              onChange={(event) => setGoalId(event.target.value)}
              className="mt-2 w-full rounded border border-codex-border bg-codex-bg px-3 py-2 text-sm text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              {PLANNER_GOALS.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-relaxed text-codex-secondary">{plan.goal.problem}</p>
          </label>
        </div>
      </section>

      {loading ? <LoadingState label="Loading planner data..." /> : null}

      {!loading ? (
        <>
          <PlanSummary plan={plan} isSpace={isSpace} />
          <BuildSequence plan={plan} isSpace={isSpace} />
          <PlannerDiagnostics plan={plan} isSpace={isSpace} />
        </>
      ) : null}
    </div>
  );
}

function PlanSummary({ plan, isSpace }: { plan: CodexPlan; isSpace: boolean }) {
  const accentText = isSpace ? "text-codex-space" : "text-codex-gold";

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-3">
      <MetricCard label="Known capabilities" value={String(plan.owned.length)} />
      <MetricCard label="Required build steps" value={String(plan.buildSequence.length)} />
      <MetricCard label="Target capabilities" value={String(plan.chains.length)} />

      <div className="rounded-xl border border-codex-border bg-codex-surface p-4 md:col-span-3">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Owned baseline</h2>
        <p className="mt-2 text-sm text-codex-secondary">
          These are treated as already available in the selected scenario.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {plan.owned.slice(0, 18).map((tech) => (
            <Link
              key={tech.id}
              to={`/tech/${tech.id}`}
              className={`rounded-full border px-3 py-1 text-xs hover:bg-codex-card ${
                isSpace
                  ? "border-codex-space/40 text-codex-space"
                  : "border-codex-gold/40 text-codex-gold"
              }`}
            >
              {tech.name}
            </Link>
          ))}
          {plan.owned.length > 18 ? (
            <span className="rounded-full border border-codex-border px-3 py-1 text-xs text-codex-muted">
              +{plan.owned.length - 18} more
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-codex-border bg-codex-surface p-4 md:col-span-3">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Immediately buildable</h2>
        <p className="mt-2 text-sm text-codex-secondary">
          The current graph says these entries have all prerequisites satisfied by the selected
          scenario. This does not guarantee materials, labor, or safety.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plan.immediatelyBuildable.slice(0, 9).map((tech) => (
            <TechnologyCard key={tech.id} tech={tech} accentText={accentText} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BuildSequence({ plan, isSpace }: { plan: CodexPlan; isSpace: boolean }) {
  const accentBorder = isSpace ? "border-codex-space/60" : "border-codex-gold/60";

  return (
    <section className="mt-10 rounded-xl border border-codex-border bg-codex-surface p-4 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-codex-text">Recommended build sequence</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-codex-secondary">
            This is a dependency-ordered sequence for the selected goal, with already-owned
            capabilities removed. It is a planning order, not a safe construction procedure.
          </p>
        </div>
        <Link
          to={`/pathfinder?to=${encodeURIComponent(plan.goal.targetTechIds.at(-1) ?? "")}`}
          className="text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
        >
          Open pathfinder
        </Link>
      </div>

      {plan.buildSequence.length > 0 ? (
        <ol className="mt-6 grid gap-3">
          {plan.buildSequence.slice(0, 32).map((tech, index) => (
            <li key={tech.id} className={`rounded-lg border ${accentBorder} bg-codex-card p-4`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-codex-muted">
                    Step {index + 1} · difficulty {tech.difficulty} · {tech.category}
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
                  className="shrink-0 rounded border border-codex-border px-3 py-2 text-sm text-codex-blue hover:border-codex-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 rounded border border-emerald-500/40 bg-emerald-950/20 p-4 text-sm text-emerald-100">
          The selected scenario already owns the target capabilities in the current graph.
        </p>
      )}

      {plan.buildSequence.length > 32 ? (
        <p className="mt-4 text-xs text-codex-muted">
          Showing 32 of {plan.buildSequence.length} required steps.
        </p>
      ) : null}
    </section>
  );
}

function PlannerDiagnostics({ plan, isSpace }: { plan: CodexPlan; isSpace: boolean }) {
  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <DiagnosticPanel title="Material bottlenecks">
        {plan.bottlenecks.length > 0 ? (
          <div className="space-y-3">
            {plan.bottlenecks.map((item) => (
              <div key={item.name} className="rounded border border-codex-border bg-codex-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-codex-text">{item.name}</h3>
                  <span className="rounded bg-codex-bg px-2 py-1 font-mono text-xs text-codex-muted">
                    {item.count} use{item.count === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-codex-secondary">
                  Used by {item.usedBy.slice(0, 4).map((tech) => tech.name).join(", ")}
                </p>
                {isSpace && item.spaceNotes.length > 0 ? (
                  <p className="mt-2 text-xs leading-relaxed text-codex-space">
                    Space note: {item.spaceNotes[0]}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No material bottlenecks detected for this plan." />
        )}
      </DiagnosticPanel>

      <DiagnosticPanel title="Hazard warnings">
        {plan.hazards.length > 0 ? (
          <div className="space-y-3">
            {plan.hazards.map((item) => (
              <Link
                key={item.tech.id}
                to={`/tech/${item.tech.id}`}
                className="block rounded border border-red-500/40 bg-red-950/10 p-3 hover:border-red-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-codex-text">{item.tech.name}</h3>
                  <span className="rounded bg-red-950/60 px-2 py-1 font-mono text-xs uppercase text-red-100">
                    {item.risk}
                  </span>
                </div>
                <p className="mt-2 text-xs text-red-100/80">{item.hazards.join(", ")}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="No inferred hazards detected. Human review is still required." />
        )}
      </DiagnosticPanel>

      <DiagnosticPanel title="Near-term unlocks">
        {plan.nearTermUnlocks.length > 0 ? (
          <div className="grid gap-3">
            {plan.nearTermUnlocks.map((tech) => (
              <TechnologyCard
                key={tech.id}
                tech={tech}
                accentText={isSpace ? "text-codex-space" : "text-codex-gold"}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="No near-term unlocks detected after the first planning steps." />
        )}
      </DiagnosticPanel>

      <DiagnosticPanel title="Content gaps blocking trust">
        {plan.contentGaps.length > 0 ? (
          <div className="space-y-3">
            {plan.contentGaps.map((item) => (
              <Link
                key={item.tech.id}
                to={`/tech/${item.tech.id}`}
                className="block rounded border border-amber-500/40 bg-amber-950/10 p-3 hover:border-amber-400"
              >
                <h3 className="font-display text-lg font-semibold text-codex-text">{item.tech.name}</h3>
                <p className="mt-2 text-xs text-amber-100/80">{item.gaps.join(", ")}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="No automated content gaps detected for this plan." />
        )}
      </DiagnosticPanel>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-codex-border bg-codex-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-codex-text">{value}</p>
    </div>
  );
}

function TechnologyCard({
  tech,
  accentText,
}: {
  tech: { id: string; name: string; tagline: string; difficulty: number; category: string };
  accentText: string;
}) {
  return (
    <Link
      to={`/tech/${tech.id}`}
      className="block rounded-lg border border-codex-border bg-codex-card p-4 hover:border-codex-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
    >
      <p className={`font-mono text-[10px] uppercase tracking-wide ${accentText}`}>
        {tech.category} · difficulty {tech.difficulty}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-codex-text">{tech.name}</h3>
      <p className="mt-2 text-xs leading-relaxed text-codex-secondary">{tech.tagline}</p>
    </Link>
  );
}

function DiagnosticPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-codex-border bg-codex-surface p-4">
      <h2 className="font-display text-2xl font-semibold text-codex-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded border border-codex-border bg-codex-card p-4 text-sm text-codex-muted">{text}</p>;
}
