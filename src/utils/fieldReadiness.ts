import type { Technology } from "../types/technology";
import { hazardDefinition, hazardRiskLevel, inferHazards } from "./hazards";

export type ReadinessBand =
  | "field-ready"
  | "review-gate"
  | "research-needed"
  | "draft";

export interface FieldReadinessResult {
  id: string;
  name: string;
  score: number;
  band: ReadinessBand;
  blockers: string[];
  warnings: string[];
  nextActions: string[];
  risk: ReturnType<typeof hazardRiskLevel>;
  hazards: string[];
}

const MEDICAL_REVIEW_WARNING = "Professional verification is required before use on a human being.";

function addScore(score: number, amount: number): number {
  return Math.min(100, score + amount);
}

export function assessFieldReadiness(tech: Technology): FieldReadinessResult {
  const hazards = inferHazards(tech);
  const risk = hazardRiskLevel(hazards);
  const blockers: string[] = [];
  const warnings: string[] = [];
  const nextActions: string[] = [];
  let score = 0;

  score = addScore(score, Math.min(16, tech.verification.sources.length * 4));
  if (tech.verification.status === "community-reviewed") score = addScore(score, 8);
  if (tech.verification.status === "expert-verified") score = addScore(score, 16);

  score = addScore(score, Math.min(12, Math.floor(tech.problem.length / 120)));
  score = addScore(score, Math.min(14, Math.floor(tech.overview.length / 120)));
  score = addScore(score, Math.min(8, tech.principles.length * 2));
  score = addScore(score, Math.min(10, tech.components.length * 2));
  score = addScore(score, Math.min(10, tech.rawMaterials.length * 2));
  score = addScore(score, Math.min(12, tech.buildSteps.length * 2));
  score = addScore(score, Math.min(6, tech.verification.warnings.length * 2));
  score = addScore(score, Math.min(4, tech.images.length + tech.videos.length));
  score = addScore(score, Math.min(4, tech.prerequisites.length + tech.unlocks.length));

  if (tech.spaceReadiness.fullAlternatives) score = addScore(score, 4);
  if (tech.maturity === "researched") score = addScore(score, 4);
  if (tech.maturity === "review-needed") score = addScore(score, 6);
  if (tech.maturity === "field-guide-ready") score = addScore(score, 8);

  if (tech.verification.sources.length < 3) {
    blockers.push("Needs at least three credible verification sources.");
    nextActions.push("Add primary, institutional, standards, or strong reference sources.");
  }
  if (tech.problem.length < 500 || tech.overview.length < 800) {
    blockers.push("Problem/overview narrative is below field-guide depth.");
    nextActions.push("Expand the entry with context, constraints, and failure modes.");
  }
  if (tech.principles.length < 3) {
    blockers.push("Needs at least three operating principles.");
    nextActions.push("Document the core principles a reader must understand before acting.");
  }
  if (tech.components.length < 5) {
    blockers.push("Needs a fuller component list.");
    nextActions.push("List the physical, procedural, and control components of the capability.");
  }
  if (tech.rawMaterials.length < 3) {
    blockers.push("Needs fuller raw material/input coverage.");
    nextActions.push("Add required inputs, sources, processing, and local substitutions.");
  }
  if (tech.buildSteps.length < 5) {
    blockers.push("Needs a deeper step sequence.");
    nextActions.push("Add ordered steps with tools, checks, and stop conditions.");
  }
  if (risk === "critical" || risk === "high") {
    if (tech.verification.status !== "expert-verified") {
      blockers.push(`High-risk entry requires expert review before field-ready use.`);
      nextActions.push("Get domain review before promoting this entry.");
    }
    if (tech.verification.warnings.length < 2) {
      blockers.push("High-risk entry needs explicit safety warnings.");
      nextActions.push("Add warnings for hazards, PPE, contraindications, and stop conditions.");
    }
  }
  if (tech.category === "medicine") {
    const warningText = tech.verification.warnings.join(" ");
    for (const required of ["Contraindications", "Overdose", "Sterility"]) {
      if (!warningText.toLowerCase().includes(required.toLowerCase())) {
        blockers.push(`Medical entry needs ${required.toLowerCase()} warning coverage.`);
      }
    }
    if (!warningText.includes(MEDICAL_REVIEW_WARNING)) {
      blockers.push("Medical entry needs professional-verification warning.");
    }
  }
  if (tech.maturity === "field-guide-ready" && tech.verification.status === "unverified") {
    blockers.push("Field-guide-ready label cannot be used on an unverified entry.");
  }
  if (!tech.images.length) {
    warnings.push("No diagrams or images attached.");
    nextActions.push("Add field diagrams, schematics, or inspection photos.");
  }
  if (tech.spaceReadiness.earthOnly) {
    warnings.push("Contains Earth-constrained materials or processes.");
  }

  const uniqueActions = [...new Set(nextActions)].slice(0, 5);
  const hazardLabels = hazards.map((hazard) => hazardDefinition(hazard).label);
  const band: ReadinessBand =
    blockers.length === 0 && score >= 88
      ? "field-ready"
      : blockers.length <= 2 && score >= 72
        ? "review-gate"
        : score >= 50
          ? "research-needed"
          : "draft";

  return {
    id: tech.id,
    name: tech.name,
    score,
    band,
    blockers,
    warnings,
    nextActions: uniqueActions,
    risk,
    hazards: hazardLabels,
  };
}

export function assessCodexReadiness(technologies: Technology[]) {
  const rows = technologies.map(assessFieldReadiness).sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.name.localeCompare(b.name);
  });
  const average = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length)
    : 0;
  const counts: Record<ReadinessBand, number> = {
    "field-ready": 0,
    "review-gate": 0,
    "research-needed": 0,
    draft: 0,
  };
  for (const row of rows) counts[row.band] += 1;

  return {
    average,
    counts,
    rows,
    topBlockers: rows.filter((row) => row.blockers.length > 0).slice(0, 20),
    nearReady: rows
      .filter((row) => row.band === "review-gate")
      .sort((a, b) => b.score - a.score)
      .slice(0, 12),
  };
}
