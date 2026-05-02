import type { TechCategory, Technology } from "../types/technology";
import { hazardRiskLevel, inferHazards } from "./hazards";

export type CapabilityStatus = "missing" | "fragile" | "developing" | "serviceable" | "strong";

export type CapabilityDefinition = {
  id: string;
  name: string;
  mission: string;
  targetEntries: number;
  categories: TechCategory[];
  keywords: string[];
  anchorTechIds: string[];
};

export type CapabilityReadiness = CapabilityDefinition & {
  entries: Technology[];
  readiness: number;
  status: CapabilityStatus;
  researchedEntries: number;
  fieldGuideReadyEntries: number;
  sourcedEntries: number;
  hazardousEntries: number;
  missingAnchors: string[];
  gaps: string[];
};

export const CAPABILITIES: CapabilityDefinition[] = [
  {
    id: "water-sanitation",
    name: "Water and sanitation",
    mission: "Keep people alive by making water safe and waste controllable.",
    targetEntries: 8,
    categories: ["survival", "medicine"],
    keywords: ["water", "sanitation", "soap", "steril", "clean", "wound", "dehydration", "rehydration"],
    anchorTechIds: [
      "sanitation-and-clean-water",
      "soap-making",
      "first-aid-and-wound-care",
      "oral-rehydration-therapy",
    ],
  },
  {
    id: "food-agriculture",
    name: "Food and agriculture",
    mission: "Produce, preserve, cook, and replenish food systems.",
    targetEntries: 10,
    categories: ["food", "agriculture"],
    keywords: ["food", "cook", "soil", "compost", "fishing", "preservation", "agriculture", "seed", "crop"],
    anchorTechIds: [
      "cooking",
      "field-agriculture",
      "food-preservation",
      "soil-science-and-composting",
      "fishing-net-and-line",
    ],
  },
  {
    id: "shelter-habitat",
    name: "Shelter and habitat",
    mission: "Create safe built environments from local materials.",
    targetEntries: 8,
    categories: ["construction", "materials"],
    keywords: ["shelter", "construction", "road", "ceramic", "glass", "clay", "structure"],
    anchorTechIds: ["shelter-construction-basic", "ceramics-and-pottery", "road-construction"],
  },
  {
    id: "tools-machines",
    name: "Tools and machines",
    mission: "Make leverage, cutting, lifting, cordage, and repair possible.",
    targetEntries: 10,
    categories: ["tools", "science"],
    keywords: ["tool", "lever", "pulley", "rope", "wheel", "stone", "bone", "mechanic"],
    anchorTechIds: ["stone-knapping", "basic-hand-tools", "rope-and-cordage", "lever-system", "pulley"],
  },
  {
    id: "materials-industry",
    name: "Materials and industry",
    mission: "Transform raw matter into metals, ceramics, glass, conductors, and structural materials.",
    targetEntries: 12,
    categories: ["materials"],
    keywords: ["iron", "steel", "bronze", "copper", "glass", "charcoal", "smelting", "material"],
    anchorTechIds: ["charcoal", "smelting-bronze-age", "iron-smelting", "steel-production", "glass-making"],
  },
  {
    id: "energy-power",
    name: "Energy and power",
    mission: "Convert heat, sunlight, fuel, and electricity into usable work.",
    targetEntries: 14,
    categories: ["energy"],
    keywords: ["fire", "steam", "electric", "power", "motor", "battery", "solar", "fuel", "grid"],
    anchorTechIds: ["fire", "steam-engine", "electric-motor", "electrical-power-grid"],
  },
  {
    id: "health-medicine",
    name: "Health and medicine",
    mission: "Prevent infection, treat injuries, and support public health.",
    targetEntries: 10,
    categories: ["medicine", "survival"],
    keywords: ["first aid", "wound", "soap", "sanitation", "medical", "infection", "steril", "dehydration"],
    anchorTechIds: [
      "first-aid-and-wound-care",
      "soap-making",
      "sanitation-and-clean-water",
      "oral-rehydration-therapy",
    ],
  },
  {
    id: "transport-logistics",
    name: "Transport and logistics",
    mission: "Move people, materials, and heavy loads across land, sea, air, and settlements.",
    targetEntries: 10,
    categories: ["transport", "construction"],
    keywords: ["transport", "wheel", "cart", "bicycle", "road", "locomotive", "aircraft", "navigation"],
    anchorTechIds: ["wheel-and-axle", "cart-and-wagon", "road-construction", "navigation-celestial"],
  },
  {
    id: "communication-records",
    name: "Communication and records",
    mission: "Preserve knowledge and coordinate people across distance and time.",
    targetEntries: 12,
    categories: ["communication"],
    keywords: ["language", "writing", "paper", "printing", "telegraph", "telephone", "radio", "fiber", "internet"],
    anchorTechIds: ["spoken-language", "writing-early-systems", "paper-and-ink-media", "printing-press-movable-type"],
  },
  {
    id: "computing-automation",
    name: "Computing and automation",
    mission: "Build the electronics path toward control systems, networks, and computation.",
    targetEntries: 10,
    categories: ["computing", "communication", "energy"],
    keywords: ["vacuum tube", "transistor", "semiconductor", "internet", "protocol", "electronics", "computing"],
    anchorTechIds: ["vacuum-tube-electronics", "transistor", "semiconductor-crystal-growing-doping"],
  },
  {
    id: "science-measurement",
    name: "Science and measurement",
    mission: "Make experimentation, navigation, standards, and reproducible knowledge possible.",
    targetEntries: 10,
    categories: ["science", "communication"],
    keywords: ["science", "navigation", "measurement", "writing", "principle", "calendar", "survey"],
    anchorTechIds: ["navigation-celestial", "writing-early-systems", "lever-system"],
  },
  {
    id: "space-isru",
    name: "Space ISRU readiness",
    mission: "Prefer technologies that can be rebuilt, repaired, or substituted away from Earth supply chains.",
    targetEntries: 12,
    categories: ["materials", "energy", "survival", "construction", "medicine", "food"],
    keywords: ["space", "lunar", "mars", "regolith", "asteroid", "in-situ", "closed-loop", "substitute"],
    anchorTechIds: ["sanitation-and-clean-water", "solar-photovoltaic-power-systems", "glass-making", "steel-production"],
  },
];

const MATURITY_SCORE = {
  stub: 0,
  draft: 1,
  researched: 2,
  "review-needed": 2,
  "field-guide-ready": 3,
} as const;

function searchableText(tech: Technology): string {
  return [
    tech.id,
    tech.name,
    tech.tagline,
    tech.category,
    tech.problem,
    tech.overview,
    tech.impact,
    ...tech.rawMaterials.map((m) => `${m.name} ${m.purpose} ${m.spaceAlternatives ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();
}

function matchesCapability(tech: Technology, capability: CapabilityDefinition): boolean {
  if (capability.anchorTechIds.includes(tech.id)) return true;
  if (capability.categories.includes(tech.category)) return true;
  const haystack = searchableText(tech);
  return capability.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

function capabilityStatus(readiness: number, entryCount: number): CapabilityStatus {
  if (entryCount === 0) return "missing";
  if (readiness >= 80) return "strong";
  if (readiness >= 60) return "serviceable";
  if (readiness >= 35) return "developing";
  return "fragile";
}

function uniqById(entries: Technology[]): Technology[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

export function computeCapabilityReadiness(technologies: Technology[]): CapabilityReadiness[] {
  const byId = new Map(technologies.map((tech) => [tech.id, tech]));

  return CAPABILITIES.map((capability) => {
    const entries = uniqById(technologies.filter((tech) => matchesCapability(tech, capability))).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    const researchedEntries = entries.filter((tech) => MATURITY_SCORE[tech.maturity] >= 2).length;
    const fieldGuideReadyEntries = entries.filter((tech) => tech.maturity === "field-guide-ready").length;
    const sourcedEntries = entries.filter((tech) => tech.verification.sources.length >= 3).length;
    const hazardousEntries = entries.filter((tech) => {
      const risk = hazardRiskLevel(inferHazards(tech));
      return risk === "critical" || risk === "high";
    }).length;
    const missingAnchors = capability.anchorTechIds.filter((id) => !byId.has(id));

    const coverage = Math.min(100, (entries.length / capability.targetEntries) * 100);
    const maturity = entries.length === 0 ? 0 : (researchedEntries / entries.length) * 100;
    const sourceDepth = entries.length === 0 ? 0 : (sourcedEntries / entries.length) * 100;
    const anchorPenalty = (missingAnchors.length / capability.anchorTechIds.length) * 20;
    const hazardPenalty = Math.min(15, hazardousEntries * 2);
    const readiness = Math.max(
      0,
      Math.min(100, Math.round(coverage * 0.45 + maturity * 0.3 + sourceDepth * 0.25 - anchorPenalty - hazardPenalty))
    );

    const gaps: string[] = [];
    if (entries.length < capability.targetEntries) gaps.push(`${capability.targetEntries - entries.length} more entries`);
    if (missingAnchors.length > 0) gaps.push(`${missingAnchors.length} missing anchor entries`);
    if (sourcedEntries < entries.length) gaps.push("source depth");
    if (fieldGuideReadyEntries === 0) gaps.push("no field-guide-ready entry");
    if (hazardousEntries > 0) gaps.push("high-risk review needed");

    return {
      ...capability,
      entries,
      readiness,
      status: capabilityStatus(readiness, entries.length),
      researchedEntries,
      fieldGuideReadyEntries,
      sourcedEntries,
      hazardousEntries,
      missingAnchors,
      gaps,
    };
  }).sort((a, b) => b.readiness - a.readiness || a.name.localeCompare(b.name));
}

export type ScenarioDefinition = {
  id: string;
  name: string;
  description: string;
  requiredCapIds: string[];
};

export type ScenarioReadiness = ScenarioDefinition & {
  readiness: number;
  status: CapabilityStatus;
  primaryGaps: string[];
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "grid-collapse",
    name: "EMP / Grid Collapse",
    description: "Modern power and electronics are disabled. Recovery depends on mechanical leverage, basic metallurgy, and localized energy production.",
    requiredCapIds: ["tools-machines", "energy-power", "materials-industry", "water-sanitation"],
  },
  {
    id: "global-famine",
    name: "Global Famine",
    description: "Industrial fertilizer chains and global logistics are severed. Survival depends on soil science, seed saving, and traditional irrigation.",
    requiredCapIds: ["food-agriculture", "water-sanitation", "health-medicine"],
  },
  {
    id: "mars-settlement",
    name: "Mars Habitat",
    description: "Survival in a sealed, hostile environment with no local biosphere. Depends on closed-loop life support, electronics, and space ISRU.",
    requiredCapIds: ["space-isru", "computing-automation", "energy-power", "health-medicine"],
  },
];

export function computeScenarioReadiness(caps: CapabilityReadiness[]): ScenarioReadiness[] {
  const capMap = new Map(caps.map((c) => [c.id, c]));

  return SCENARIOS.map((scenario): ScenarioReadiness => {
    const required = scenario.requiredCapIds.map((id) => capMap.get(id)).filter(Boolean) as CapabilityReadiness[];
    
    if (required.length === 0) {
      return { ...scenario, readiness: 0, status: "missing", primaryGaps: ["Infrastructure data missing"] };
    }

    const readinessAvg = Math.round(required.reduce((sum, c) => sum + c.readiness, 0) / required.length);
    const minReadiness = Math.min(...required.map((c) => c.readiness));
    
    // Bottleneck Logic: Survival depends on the weakest link.
    // We weight the minimum capability score more heavily than the average.
    const readiness = Math.round((readinessAvg * 0.3) + (minReadiness * 0.7));

    const primaryGaps = required
      .filter((c) => c.readiness < 60 || c.readiness === minReadiness)
      .sort((a, b) => a.readiness - b.readiness)
      .map((c) => c.name);

    return {
      ...scenario,
      readiness,
      status: capabilityStatus(readiness, required.length) as CapabilityStatus,
      primaryGaps: primaryGaps.slice(0, 3),
    };
  }).sort((a, b) => b.readiness - a.readiness);
}
