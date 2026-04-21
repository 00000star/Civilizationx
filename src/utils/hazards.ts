import type { HazardCategory, Technology } from "../types/technology";

export interface HazardDefinition {
  id: HazardCategory;
  label: string;
  severity: "caution" | "danger" | "critical";
  description: string;
  keywords: string[];
}

export const HAZARD_DEFINITIONS: HazardDefinition[] = [
  {
    id: "medical",
    label: "Medical",
    severity: "critical",
    description: "Can affect diagnosis, treatment, wounds, infection, drugs, or human bodies.",
    keywords: ["wound", "medicine", "medical", "sterile", "infection", "dosage", "patient", "burn"],
  },
  {
    id: "chemical",
    label: "Chemical",
    severity: "danger",
    description: "Involves corrosive, toxic, reactive, or hazardous substances.",
    keywords: ["chemical", "lye", "acid", "alkali", "toxic", "corrosive", "solvent", "poison"],
  },
  {
    id: "electrical",
    label: "Electrical",
    severity: "danger",
    description: "Involves electricity, shock, batteries, grids, motors, or energized conductors.",
    keywords: ["electric", "voltage", "current", "battery", "wire", "grid", "motor", "transformer"],
  },
  {
    id: "fire",
    label: "Fire",
    severity: "danger",
    description: "Involves flame, combustion, smoke, ignition, or uncontrolled burning.",
    keywords: ["fire", "flame", "burning", "combustion", "smoke", "ignite", "charcoal"],
  },
  {
    id: "pressure",
    label: "Pressure",
    severity: "critical",
    description: "Involves boilers, compressed gases, pressurized systems, or pressure vessels.",
    keywords: ["pressure", "boiler", "compressed", "pressurised", "pressurized", "steam", "vessel"],
  },
  {
    id: "structural",
    label: "Structural",
    severity: "danger",
    description: "Involves loads, collapse, shelter, bridges, buildings, or load-bearing systems.",
    keywords: ["structural", "load", "collapse", "shelter", "building", "bridge", "roof", "foundation"],
  },
  {
    id: "biological",
    label: "Biological",
    severity: "danger",
    description: "Involves pathogens, waste, contamination, fermentation, infection, or living systems.",
    keywords: ["pathogen", "bacteria", "virus", "biological", "waste", "contamination", "ferment", "compost"],
  },
  {
    id: "radiation",
    label: "Radiation",
    severity: "critical",
    description: "Involves ionizing radiation, nuclear systems, shielding, or radiological exposure.",
    keywords: ["radiation", "nuclear", "fission", "radioactive", "reactor", "shielding"],
  },
  {
    id: "sharp-tools",
    label: "Sharp tools",
    severity: "caution",
    description: "Involves cutting edges, blades, needles, splinters, or puncture hazards.",
    keywords: ["sharp", "blade", "knife", "cutting", "needle", "splinter", "scissors"],
  },
  {
    id: "high-temperature",
    label: "High temperature",
    severity: "danger",
    description: "Involves high heat, molten materials, kilns, furnaces, smelting, or burns.",
    keywords: ["furnace", "kiln", "molten", "smelting", "high temperature", "heat", "boil", "weld"],
  },
  {
    id: "confined-space",
    label: "Confined space",
    severity: "critical",
    description: "Involves oxygen depletion, toxic atmosphere, enclosed work, or habitat envelope risks.",
    keywords: ["confined", "oxygen", "co2", "carbon monoxide", "ventilation", "habitat", "enclosed"],
  },
];

const definitionById = new Map(HAZARD_DEFINITIONS.map((h) => [h.id, h]));

export function hazardDefinition(id: HazardCategory): HazardDefinition {
  return definitionById.get(id)!;
}

export function inferHazards(tech: Technology): HazardCategory[] {
  const text = [
    tech.id,
    tech.name,
    tech.tagline,
    tech.category,
    tech.problem,
    tech.overview,
    tech.impact,
    ...tech.verification.warnings,
    ...tech.rawMaterials.flatMap((m) => [
      m.name,
      m.purpose,
      m.processingRequired,
      m.spaceAlternatives ?? "",
    ]),
    ...tech.buildSteps.flatMap((s) => [
      s.title,
      s.description,
      s.warningNote ?? "",
      ...s.prerequisiteTools,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  const hazards = new Set<HazardCategory>();
  if (tech.category === "medicine") hazards.add("medical");
  if (tech.category === "construction") hazards.add("structural");
  if (tech.category === "energy") hazards.add("electrical");

  for (const def of HAZARD_DEFINITIONS) {
    if (def.keywords.some((keyword) => text.includes(keyword))) {
      hazards.add(def.id);
    }
  }

  return [...hazards].sort((a, b) =>
    hazardDefinition(a).label.localeCompare(hazardDefinition(b).label)
  );
}

export function hazardRiskLevel(
  hazards: HazardCategory[]
): "low" | "moderate" | "high" | "critical" {
  if (hazards.some((h) => hazardDefinition(h).severity === "critical")) {
    return "critical";
  }
  if (hazards.filter((h) => hazardDefinition(h).severity === "danger").length >= 2) {
    return "high";
  }
  if (hazards.some((h) => hazardDefinition(h).severity === "danger")) {
    return "moderate";
  }
  return hazards.length ? "moderate" : "low";
}
