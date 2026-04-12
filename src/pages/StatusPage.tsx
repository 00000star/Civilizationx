import { useMemo } from "react";
import { Link } from "react-router-dom";
import { loadAllTechnologies } from "../data/loadTechnologies";
import type { TechCategory, VerificationStatus } from "../types/technology";
import { computeCodexScore } from "../utils/codexScore";

const PLANNED: Record<TechCategory, number> = {
  survival: 12,
  food: 12,
  materials: 14,
  energy: 18,
  tools: 12,
  transport: 12,
  construction: 12,
  medicine: 14,
  communication: 14,
  computing: 12,
  agriculture: 12,
  warfare: 8,
  science: 14,
};

const MISSING_CRITICAL: { name: string; score: number; id?: string }[] = [
  { name: "Sanitation and clean water", score: 10, id: "sanitation-and-clean-water" },
  { name: "Human food production (field agriculture entry)", score: 10 },
  { name: "Basic medicine / first aid expansion", score: 10, id: "first-aid-and-wound-care" },
  { name: "Germ theory (dedicated entry)", score: 9 },
  { name: "Vaccines", score: 9 },
  { name: "Concrete and construction", score: 8 },
  { name: "Navigation (celestial covered; maritime expansion)", score: 8, id: "navigation-celestial" },
  { name: "Timekeeping and calendar", score: 7 },
  { name: "Writing systems (deep expansion)", score: 7, id: "writing-early-systems" },
  { name: "Soil science and composting", score: 7, id: "soil-science-and-composting" },
];

export function StatusPage() {
  const techs = useMemo(() => loadAllTechnologies(), []);
  const score = useMemo(() => computeCodexScore(techs), [techs]);

  const byCategory = useMemo(() => {
    const m = new Map<TechCategory, number>();
    for (const c of Object.keys(PLANNED) as TechCategory[]) m.set(c, 0);
    for (const t of techs) m.set(t.category, (m.get(t.category) ?? 0) + 1);
    return m;
  }, [techs]);

  const verificationCounts = useMemo(() => {
    const u: Record<VerificationStatus, number> = {
      unverified: 0,
      "community-reviewed": 0,
      "expert-verified": 0,
    };
    for (const t of techs) u[t.verification.status] += 1;
    return u;
  }, [techs]);

  const expertVerified = verificationCounts["expert-verified"];
  const withSources = useMemo(
    () => techs.filter((t) => t.verification.sources.length >= 3).length,
    [techs]
  );

  const branchesCovered = useMemo(() => {
    const s = new Set(techs.map((t) => t.category));
    return s.size;
  }, [techs]);

  const branchesWithZero = useMemo(
    () => (Object.keys(PLANNED) as TechCategory[]).filter((c) => (byCategory.get(c) ?? 0) === 0).length,
    [byCategory]
  );

  const attention = useMemo(() => {
    const rows: { id: string; name: string; issue: string; action: string }[] = [];
    for (const t of techs) {
      if (t.verification.sources.length < 3) {
        rows.push({
          id: t.id,
          name: t.name,
          issue: "Fewer than three verification sources",
          action: "Add peer-reviewed or standards references",
        });
      }
      if (t.components.length < 3) {
        rows.push({
          id: t.id,
          name: t.name,
          issue: "Fewer than three components",
          action: "Expand component list to match depth standard",
        });
      }
      if (t.buildSteps.length < 3) {
        rows.push({
          id: t.id,
          name: t.name,
          issue: "Fewer than three build steps",
          action: "Add instructional build steps with warnings",
        });
      }
      if (t.problem.length < 500 || t.overview.length < 500) {
        rows.push({
          id: t.id,
          name: t.name,
          issue: "Problem or overview under 500 characters",
          action: "Deepen narrative to multi-paragraph standard",
        });
      }
    }
    return rows;
  }, [techs]);

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-codex-text">Codex Status</h1>
      <p className="mt-3 max-w-3xl text-sm text-codex-secondary">
        An honest account of what this project covers and what still needs to be built.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Technologies documented" value={String(techs.length)} />
        <StatCard label="Expert-verified entries" value={String(expertVerified)} />
        <StatCard label="Knowledge branches represented" value={String(branchesCovered)} />
        <StatCard label="Branches with zero entries (of 13 categories)" value={String(branchesWithZero)} />
        <StatCard label="Entries with ≥3 sources" value={String(withSources)} />
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Branch coverage</h2>
        <p className="mt-2 text-xs text-codex-muted">
          Percent compares current entries to a conservative planned depth per branch (not a promise of final catalogue
          size).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(Object.keys(PLANNED) as TechCategory[]).map((cat) => {
            const n = byCategory.get(cat) ?? 0;
            const plan = PLANNED[cat];
            const pct = Math.min(100, Math.round((n / plan) * 100));
            const status = n === 0 ? "Missing" : pct >= 80 ? "Active" : pct >= 30 ? "Partial" : "Early";
            return (
              <div key={cat} className="rounded-lg border border-codex-border bg-codex-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold capitalize text-codex-text">
                    {cat.replaceAll("-", " ")}
                  </span>
                  <span className="text-xs text-codex-muted">{status}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-codex-border">
                  <div className="h-full bg-codex-gold" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 font-mono text-xs text-codex-secondary">
                  {pct}% ({n}/{plan} planned)
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Verification status</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-codex-border bg-codex-surface p-4">
            <p className="font-mono text-xs text-codex-muted">Unverified</p>
            <p className="mt-1 text-2xl font-semibold text-codex-text">{verificationCounts.unverified}</p>
          </div>
          <div className="rounded border border-codex-border bg-codex-surface p-4">
            <p className="font-mono text-xs text-codex-muted">Community reviewed</p>
            <p className="mt-1 text-2xl font-semibold text-codex-text">
              {verificationCounts["community-reviewed"]}
            </p>
          </div>
          <div className="rounded border border-codex-border bg-codex-surface p-4">
            <p className="font-mono text-xs text-codex-muted">Expert verified</p>
            <p className="mt-1 text-2xl font-semibold text-codex-text">{verificationCounts["expert-verified"]}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-codex-secondary">
          Are you an expert? Help verify entries in your field — see{" "}
          <Link to="/contribute" className="text-codex-blue underline">
            Contribute
          </Link>{" "}
          and the repository CONTRIBUTING guide.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Codex score</h2>
        <p className="mt-2 text-4xl font-bold text-codex-gold">
          {score.total}{" "}
          <span className="text-xl font-normal text-codex-muted">/ 1000</span>
        </p>
        <p className="mt-2 text-sm text-codex-secondary">{score.label}</p>
        <ul className="mt-4 space-y-2 text-sm text-codex-secondary">
          <li>Coverage: {score.coverage} / 400 (4 points per entry, cap at 100 entries)</li>
          <li>Depth: {score.depth} / 300 (per-entry narrative, components, steps, materials, sources)</li>
          <li>Verification: {score.verification} / 200 (community +2, expert +10 each)</li>
          <li>Critical coverage bonus: {score.criticalBonus} / 100 (key survival technologies present)</li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Entries needing attention</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-codex-border text-xs uppercase text-codex-muted">
                <th className="py-2 pr-4">Entry</th>
                <th className="py-2 pr-4">Issue</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {attention.map((r, i) => (
                <tr key={`${r.id}-${i}`} className="border-b border-codex-border/60">
                  <td className="py-2 pr-4">
                    <Link to={`/tech/${r.id}`} className="text-codex-blue hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-codex-secondary">{r.issue}</td>
                  <td className="py-2 text-codex-secondary">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {attention.length === 0 ? (
            <p className="mt-4 text-sm text-codex-muted">No automated issues detected — human review still required.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Critical gaps (prioritised)</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-codex-secondary">
          {MISSING_CRITICAL.map((m) => (
            <li key={m.name}>
              <span className="font-medium text-codex-text">{m.name}</span>{" "}
              <span className="font-mono text-codex-gold">[{m.score}/10]</span>{" "}
              {m.id && techs.some((t) => t.id === m.id) ? (
                <Link to={`/tech/${m.id}`} className="ml-2 text-codex-blue underline">
                  Open entry
                </Link>
              ) : (
                <span className="text-codex-muted">Missing</span>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-codex-border bg-codex-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-codex-text">{value}</p>
    </div>
  );
}
