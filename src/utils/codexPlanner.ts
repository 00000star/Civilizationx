import type { Technology } from "../types/technology";
import { hazardDefinition, hazardRiskLevel, inferHazards } from "./hazards";

export type PlannerScenario = {
  id: string;
  name: string;
  context: string;
  ownedTechIds: string[];
};

export type PlannerGoal = {
  id: string;
  name: string;
  problem: string;
  targetTechIds: string[];
};

export type PlannerChain = {
  target: Technology;
  steps: Technology[];
};

export type PlannerBottleneck = {
  name: string;
  count: number;
  usedBy: Technology[];
  spaceNotes: string[];
};

export type PlannerHazard = {
  tech: Technology;
  risk: "critical" | "high" | "moderate" | "low";
  hazards: string[];
};

export type PlannerGap = {
  tech: Technology;
  gaps: string[];
};

export type CodexPlan = {
  scenario: PlannerScenario;
  goal: PlannerGoal;
  owned: Technology[];
  chains: PlannerChain[];
  buildSequence: Technology[];
  immediatelyBuildable: Technology[];
  nearTermUnlocks: Technology[];
  bottlenecks: PlannerBottleneck[];
  hazards: PlannerHazard[];
  contentGaps: PlannerGap[];
};

export const PLANNER_SCENARIOS: PlannerScenario[] = [
  {
    id: "primitive-camp",
    name: "Primitive camp",
    context:
      "Assume a small group with basic human knowledge, no grid power, no metalworking, and only the most primitive tools.",
    ownedTechIds: [
      "spoken-language",
      "fire",
      "stone-knapping",
      "bone-tools",
      "rope-and-cordage",
      "shelter-construction-basic",
    ],
  },
  {
    id: "salvage-settlement",
    name: "Post-collapse salvage settlement",
    context:
      "Assume survivors can salvage ruins, reuse parts, write records, and run simple workshops but cannot depend on modern supply chains.",
    ownedTechIds: [
      "spoken-language",
      "fire",
      "stone-knapping",
      "bone-tools",
      "rope-and-cordage",
      "shelter-construction-basic",
      "cooking",
      "sanitation-and-clean-water",
      "first-aid-and-wound-care",
      "writing-early-systems",
      "paper-and-ink-media",
      "basic-hand-tools",
      "lever-system",
      "pulley",
      "wheel-and-axle",
      "cart-and-wagon",
      "field-agriculture",
      "food-preservation",
    ],
  },
  {
    id: "powered-workshop",
    name: "Powered workshop",
    context:
      "Assume a settlement has metals, wire, batteries, motors, and basic electrical generation but still needs local repair and documentation.",
    ownedTechIds: [
      "spoken-language",
      "fire",
      "stone-knapping",
      "rope-and-cordage",
      "shelter-construction-basic",
      "sanitation-and-clean-water",
      "writing-early-systems",
      "paper-and-ink-media",
      "basic-hand-tools",
      "charcoal",
      "smelting-bronze-age",
      "iron-smelting",
      "steel-production",
      "copper-wire-and-cable",
      "steam-engine",
      "electric-motor",
      "high-capacity-electrochemical-batteries",
      "electric-lighting-systems",
    ],
  },
  {
    id: "mars-habitat",
    name: "Mars habitat",
    context:
      "Assume a pressurised habitat with imported electronics, stored knowledge, solar power, strict recycling, and severe mass constraints.",
    ownedTechIds: [
      "spoken-language",
      "writing-early-systems",
      "paper-and-ink-media",
      "sanitation-and-clean-water",
      "first-aid-and-wound-care",
      "solar-photovoltaic-power-systems",
      "high-capacity-electrochemical-batteries",
      "radio-broadcast-and-receiver",
      "data-storage-systems",
      "programming-languages",
      "stored-program-computer",
    ],
  },
];

export const PLANNER_GOALS: PlannerGoal[] = [
  {
    id: "clean-water",
    name: "Keep people alive with clean water",
    problem: "Make water safe, reduce disease, and establish sanitation discipline.",
    targetTechIds: ["sanitation-and-clean-water", "soap-making", "germ-theory"],
  },
  {
    id: "preserve-food",
    name: "Preserve food and extend calories",
    problem: "Prevent starvation by producing crops, cooking safely, preserving food, and using controlled fermentation.",
    targetTechIds: ["cooking", "field-agriculture", "food-preservation", "fermentation-basic"],
  },
  {
    id: "make-metal",
    name: "Bootstrap metalworking",
    problem: "Move from stone and bone tools into charcoal, smelting, iron, and steel.",
    targetTechIds: ["charcoal", "smelting-bronze-age", "iron-smelting", "steel-production"],
  },
  {
    id: "generate-electricity",
    name: "Generate and distribute electricity",
    problem: "Create reliable mechanical-to-electrical power and distribute it safely.",
    targetTechIds: [
      "steam-engine",
      "steam-turbine-electric-generation",
      "electrical-power-grid",
      "electric-motor",
    ],
  },
  {
    id: "build-radio",
    name: "Restore long-distance radio",
    problem: "Coordinate settlements beyond line of sight without relying on cellular networks.",
    targetTechIds: ["copper-wire-and-cable", "vacuum-tube-electronics", "radio-broadcast-and-receiver"],
  },
  {
    id: "repair-transport",
    name: "Restore practical transport",
    problem: "Move people, food, ore, tools, and medical supplies with repairable transport.",
    targetTechIds: ["wheel-and-axle", "cart-and-wagon", "road-construction", "bicycle"],
  },
  {
    id: "bootstrap-computing",
    name: "Rebuild computing",
    problem: "Move from electrical systems through electronics into stored-program computation.",
    targetTechIds: [
      "vacuum-tube-electronics",
      "transistor",
      "integrated-circuit",
      "microprocessor",
      "stored-program-computer",
    ],
  },
  {
    id: "ai-from-scratch",
    name: "Build AI from scratch",
    problem:
      "Expose the full chain from mathematics and electronics to data, models, training, evaluation, and governance.",
    targetTechIds: [
      "linear-algebra",
      "calculus-and-optimization",
      "probability-and-statistics",
      "programming-languages",
      "data-storage-systems",
      "machine-learning",
      "neural-networks",
      "backpropagation",
      "gpu-accelerated-computing",
      "dataset-curation",
      "tokenization",
      "transformer-models",
      "model-evaluation",
      "ai-safety-and-governance",
    ],
  },
  {
    id: "mars-materials",
    name: "Make Mars habitat materials",
    problem: "Prioritise power, water, glass, ceramics, steel, concrete alternatives, and local repair paths.",
    targetTechIds: [
      "sanitation-and-clean-water",
      "solar-photovoltaic-power-systems",
      "glass-making",
      "ceramics-and-pottery",
      "steel-production",
      "concrete-portland-cement",
    ],
  },
];

const RISK_RANK = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
} as const;

function uniqueTechnologies(ids: Iterable<string>, byId: Map<string, Technology>): Technology[] {
  const out: Technology[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const tech = byId.get(id);
    if (!tech) continue;
    seen.add(id);
    out.push(tech);
  }
  return out;
}

function collectDependencyOrdered(
  id: string,
  byId: Map<string, Technology>,
  seen: Set<string>,
  out: string[]
) {
  if (seen.has(id)) return;
  const tech = byId.get(id);
  if (!tech) return;
  seen.add(id);
  for (const prereq of tech.prerequisites) collectDependencyOrdered(prereq, byId, seen, out);
  out.push(id);
}

function directlyBuildable(technologies: Technology[], ownedIds: Set<string>): Technology[] {
  return technologies
    .filter((tech) => !ownedIds.has(tech.id))
    .filter((tech) => tech.prerequisites.length > 0 && tech.prerequisites.every((id) => ownedIds.has(id)))
    .sort((a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name));
}

function nearTerm(technologies: Technology[], ownedIds: Set<string>, buildSequence: Technology[]): Technology[] {
  const simulated = new Set(ownedIds);
  for (const tech of buildSequence.slice(0, 8)) simulated.add(tech.id);
  return directlyBuildable(technologies, simulated)
    .filter((tech) => !buildSequence.some((step) => step.id === tech.id))
    .slice(0, 10);
}

function materialBottlenecks(buildSequence: Technology[]): PlannerBottleneck[] {
  const materialMap = new Map<string, PlannerBottleneck>();
  for (const tech of buildSequence.slice(0, 18)) {
    for (const material of tech.rawMaterials) {
      const key = material.name.trim().toLowerCase();
      const existing =
        materialMap.get(key) ??
        ({
          name: material.name,
          count: 0,
          usedBy: [],
          spaceNotes: [],
        } satisfies PlannerBottleneck);
      existing.count += 1;
      if (!existing.usedBy.some((item) => item.id === tech.id)) existing.usedBy.push(tech);
      if (material.spaceAlternatives && !existing.spaceNotes.includes(material.spaceAlternatives)) {
        existing.spaceNotes.push(material.spaceAlternatives);
      }
      materialMap.set(key, existing);
    }
  }
  return [...materialMap.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 10);
}

function hazardWarnings(buildSequence: Technology[]): PlannerHazard[] {
  return buildSequence
    .map((tech) => {
      const hazards = inferHazards(tech);
      return {
        tech,
        risk: hazardRiskLevel(hazards),
        hazards: hazards.map((hazard) => hazardDefinition(hazard).label),
      };
    })
    .filter((row) => row.hazards.length > 0)
    .sort((a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk] || a.tech.name.localeCompare(b.tech.name))
    .slice(0, 12);
}

function contentGaps(buildSequence: Technology[]): PlannerGap[] {
  return buildSequence
    .map((tech) => {
      const gaps: string[] = [];
      if (tech.verification.sources.length < 3) gaps.push("needs stronger sources");
      if (tech.verification.status === "unverified") gaps.push("unverified");
      if (tech.maturity !== "field-guide-ready") gaps.push(`maturity: ${tech.maturity}`);
      if (tech.images.length === 0) gaps.push("no images");
      if (tech.videos.length === 0) gaps.push("no video reference");
      if (tech.buildSteps.length < 4) gaps.push("thin build steps");
      return { tech, gaps };
    })
    .filter((row) => row.gaps.length > 0)
    .sort((a, b) => b.gaps.length - a.gaps.length || a.tech.name.localeCompare(b.tech.name))
    .slice(0, 12);
}

export function makeCodexPlan(
  technologies: Technology[],
  scenarioId: string,
  goalId: string
): CodexPlan {
  const scenario = PLANNER_SCENARIOS.find((item) => item.id === scenarioId) ?? PLANNER_SCENARIOS[0];
  const goal = PLANNER_GOALS.find((item) => item.id === goalId) ?? PLANNER_GOALS[0];
  const byId = new Map(technologies.map((tech) => [tech.id, tech]));
  const ownedIds = new Set(scenario.ownedTechIds.filter((id) => byId.has(id)));
  const owned = uniqueTechnologies(ownedIds, byId);

  const chains = goal.targetTechIds.flatMap((id) => {
    const target = byId.get(id);
    if (!target) return [];
    const orderedIds: string[] = [];
    collectDependencyOrdered(id, byId, new Set<string>(), orderedIds);
    return [{ target, steps: uniqueTechnologies(orderedIds, byId) }];
  });

  const mergedIds: string[] = [];
  const seen = new Set<string>();
  for (const chain of chains) {
    for (const step of chain.steps) {
      if (seen.has(step.id) || ownedIds.has(step.id)) continue;
      seen.add(step.id);
      mergedIds.push(step.id);
    }
  }
  const buildSequence = uniqueTechnologies(mergedIds, byId);

  return {
    scenario,
    goal,
    owned,
    chains,
    buildSequence,
    immediatelyBuildable: directlyBuildable(technologies, ownedIds).slice(0, 12),
    nearTermUnlocks: nearTerm(technologies, ownedIds, buildSequence),
    bottlenecks: materialBottlenecks(buildSequence),
    hazards: hazardWarnings(buildSequence),
    contentGaps: contentGaps(buildSequence),
  };
}
