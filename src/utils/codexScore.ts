import type { Technology, VerificationStatus } from "../types/technology";

export type CodexScoreBreakdown = {
  coverage: number;
  depth: number;
  verification: number;
  criticalBonus: number;
  total: number;
  label: string;
  entryCount: number;
};

const CRITICAL_IDS = new Set([
  "sanitation-and-clean-water",
  "first-aid-and-wound-care",
  "soil-science-and-composting",
  "fire",
  "shelter-construction-basic",
  "food-preservation",
  "basic-hand-tools",
  "navigation-celestial",
  "writing-early-systems",
]);

export function computeCodexScore(technologies: Technology[]): CodexScoreBreakdown {
  const n = technologies.length;
  const coverage = Math.min(400, n * 4);

  let depthSum = 0;
  const maxPer = 6;
  for (const t of technologies) {
    let d = 0;
    if (t.problem.length > 1000) d += 1;
    if (t.overview.length > 1000) d += 1;
    if (t.components.length >= 5) d += 1;
    if (t.buildSteps.length >= 5) d += 1;
    if (t.rawMaterials.length >= 3) d += 1;
    if (t.verification.sources.length >= 3) d += 1;
    depthSum += d;
  }
  const depth = n ? Math.round((depthSum / (n * maxPer)) * 300) : 0;

  let vPts = 0;
  for (const t of technologies) {
    const s: VerificationStatus = t.verification.status;
    if (s === "community-reviewed") vPts += 2;
    else if (s === "expert-verified") vPts += 10;
  }
  const verification = Math.min(200, vPts);

  let bonus = 0;
  const ids = new Set(technologies.map((t) => t.id));
  for (const id of CRITICAL_IDS) {
    if (ids.has(id)) bonus += 10;
  }
  const criticalBonus = Math.min(100, bonus);

  const total = Math.min(1000, coverage + depth + verification + criticalBonus);

  let label: string;
  if (total <= 200) label = "Prototype — not yet safe to rely on";
  else if (total <= 400) label = "Early stage — useful for reference only";
  else if (total <= 600) label = "Developing — approaching real utility";
  else if (total <= 800) label = "Substantial — reliable for most scenarios";
  else if (total <= 950) label = "Comprehensive — suitable for serious use";
  else label = "Complete — humanity's knowledge preserved";

  return {
    coverage,
    depth,
    verification,
    criticalBonus,
    total,
    label,
    entryCount: n,
  };
}
