import type { TechnologySummary } from "../types/technology";

export interface FoundationNode {
  id: string;
  reason: string;
  collapseUse: string;
  spaceUse: string;
}

export interface FoundationChain {
  id: string;
  title: string;
  goal: string;
  ids: string[];
}

export const FOUNDATION_NODES: FoundationNode[] = [
  {
    id: "fire",
    reason: "Heat, light, water treatment, cooking, ceramics, charcoal, and metallurgy start here.",
    collapseUse: "Immediate warmth, signalling, cooking, and boiling water.",
    spaceUse: "The principle layer for thermal processing, combustion control, and heat discipline.",
  },
  {
    id: "stone-knapping",
    reason: "Cutting edges are the first manufacturing tools.",
    collapseUse: "Makes blades, scrapers, points, and basic processing tools from local stone.",
    spaceUse: "A reminder that tool geometry matters even when the material changes to regolith glass or metal scrap.",
  },
  {
    id: "bone-tools",
    reason: "Small precision tools can be made before metalworking exists.",
    collapseUse: "Awls, needles, hooks, and points for clothing, fishing, and repair.",
    spaceUse: "Maps to improvised small tools from habitat waste streams and composites.",
  },
  {
    id: "rope-and-cordage",
    reason: "Cordage turns weak fibres into lifting, binding, shelter, fishing, and transport systems.",
    collapseUse: "Binding shelter, traps, nets, splints, packs, and repairs.",
    spaceUse: "Cable management, soft restraints, repair lashings, and textile manufacturing logic.",
  },
  {
    id: "shelter-construction-basic",
    reason: "Exposure can kill before hunger does.",
    collapseUse: "Protection from cold, rain, wind, heat, and insects.",
    spaceUse: "The same envelope logic applies to pressure, radiation, dust, and thermal control.",
  },
  {
    id: "cooking",
    reason: "Cooking expands food safety, calories, preservation, and social coordination.",
    collapseUse: "Makes more food digestible and reduces pathogen load.",
    spaceUse: "Food processing, crew health, morale, and closed-loop resource discipline.",
  },
  {
    id: "sanitation-and-clean-water",
    reason: "Dirty water and waste mismanagement can destroy a settlement faster than lack of tools.",
    collapseUse: "Prevents diarrhoeal disease, wound infection, and camp contamination.",
    spaceUse: "Closed-loop water and waste systems are survival-critical in habitats.",
  },
  {
    id: "food-preservation",
    reason: "Survival becomes civilization only when food can outlast the harvest or hunt.",
    collapseUse: "Drying, smoking, fermenting, salting, and storing food across seasons.",
    spaceUse: "Shelf life, redundancy, crop failure buffers, and emergency reserves.",
  },
  {
    id: "ceramics-and-pottery",
    reason: "Containers unlock storage, cooking, chemistry, kilns, and high-temperature processing.",
    collapseUse: "Water vessels, cooking pots, storage jars, lamps, and kiln furniture.",
    spaceUse: "Regolith-derived ceramics, insulation, tiles, crucibles, and habitat materials.",
  },
  {
    id: "charcoal",
    reason: "Charcoal is portable, controllable carbon for heat, filtration, and metallurgy.",
    collapseUse: "High-temperature fuel for smithing, pottery, and water filtration support.",
    spaceUse: "Carbon management, filtration, reduction chemistry, and process heat analogies.",
  },
  {
    id: "basic-hand-tools",
    reason: "Reusable tools compound human effort.",
    collapseUse: "Cutting, digging, shaping, fastening, and maintaining everything else.",
    spaceUse: "Tool inventories, repair discipline, and local fabrication priorities.",
  },
  {
    id: "soil-science-and-composting",
    reason: "Agriculture depends on soil fertility, water, nutrients, and microbial life.",
    collapseUse: "Turns waste and local biomass into food security.",
    spaceUse: "Maps to controlled growing media, nutrient loops, and bioregenerative life support.",
  },
  {
    id: "first-aid-and-wound-care",
    reason: "Small wounds become fatal when hospitals and antibiotics are absent.",
    collapseUse: "Bleeding control, wound cleaning, splinting, burns, and infection monitoring.",
    spaceUse: "Crew medical autonomy when evacuation is impossible.",
  },
  {
    id: "writing-early-systems",
    reason: "Civilization scales when knowledge survives memory.",
    collapseUse: "Records maps, harvests, recipes, injuries, laws, and lessons.",
    spaceUse: "Operational logs, maintenance records, experiment traces, and training memory.",
  },
];

export const FOUNDATION_CHAINS: FoundationChain[] = [
  {
    id: "clean-water",
    title: "Clean Water From Nothing",
    goal: "Avoid the disease spiral that destroys camps and habitats.",
    ids: ["fire", "ceramics-and-pottery", "charcoal", "sanitation-and-clean-water"],
  },
  {
    id: "basic-clinic",
    title: "Low-Resource Clinic",
    goal: "Handle injuries, hygiene, isolation, and records before advanced medicine exists.",
    ids: [
      "fire",
      "sanitation-and-clean-water",
      "soap-making",
      "first-aid-and-wound-care",
      "writing-early-systems",
    ],
  },
  {
    id: "food-security",
    title: "Food Security",
    goal: "Move from foraging or stored rations toward durable settlement calories.",
    ids: [
      "fire",
      "cooking",
      "food-preservation",
      "soil-science-and-composting",
      "fishing-net-and-line",
    ],
  },
  {
    id: "materials-stack",
    title: "Materials Stack",
    goal: "Turn local material knowledge into containers, fuel, tools, and metal.",
    ids: [
      "stone-knapping",
      "fire",
      "ceramics-and-pottery",
      "charcoal",
      "smelting-bronze-age",
      "iron-smelting",
    ],
  },
  {
    id: "mechanical-advantage",
    title: "Mechanical Advantage",
    goal: "Multiply human and animal force before engines exist.",
    ids: [
      "rope-and-cordage",
      "lever-system",
      "pulley",
      "wheel-and-axle",
      "cart-and-wagon",
    ],
  },
];

export function resolveFoundationNodes(
  technologies: TechnologySummary[]
): Array<FoundationNode & { tech: TechnologySummary | null }> {
  const byId = new Map(technologies.map((tech) => [tech.id, tech]));
  return FOUNDATION_NODES.map((node) => ({
    ...node,
    tech: byId.get(node.id) ?? null,
  }));
}

export function resolveFoundationChains(
  technologies: TechnologySummary[]
): Array<FoundationChain & { technologies: TechnologySummary[]; missing: string[] }> {
  const byId = new Map(technologies.map((tech) => [tech.id, tech]));
  return FOUNDATION_CHAINS.map((chain) => {
    const found: TechnologySummary[] = [];
    const missing: string[] = [];
    for (const id of chain.ids) {
      const tech = byId.get(id);
      if (tech) found.push(tech);
      else missing.push(id);
    }
    return { ...chain, technologies: found, missing };
  });
}
