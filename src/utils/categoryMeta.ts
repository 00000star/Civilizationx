import type { TechCategory } from "../types/technology";

export const TECH_CATEGORIES: TechCategory[] = [
  "survival",
  "food",
  "materials",
  "energy",
  "tools",
  "transport",
  "construction",
  "medicine",
  "communication",
  "computing",
  "agriculture",
  "warfare",
  "science",
];

export const CATEGORY_LABEL: Record<TechCategory, string> = {
  survival: "Survival",
  food: "Food",
  materials: "Materials",
  energy: "Energy",
  tools: "Tools",
  transport: "Transport",
  construction: "Construction",
  medicine: "Medicine",
  communication: "Communication",
  computing: "Computing",
  agriculture: "Agriculture",
  warfare: "Warfare",
  science: "Science",
};

/** Glow / accent for nodes — paired with borders and labels, not sole cue */
export const CATEGORY_GLOW: Record<TechCategory, string> = {
  survival: "rgba(76, 175, 125, 0.45)",
  food: "rgba(201, 168, 76, 0.45)",
  materials: "rgba(156, 120, 200, 0.45)",
  energy: "rgba(255, 152, 80, 0.45)",
  tools: "rgba(120, 180, 220, 0.45)",
  transport: "rgba(74, 127, 189, 0.55)",
  construction: "rgba(160, 160, 170, 0.45)",
  medicine: "rgba(240, 128, 128, 0.45)",
  communication: "rgba(100, 200, 200, 0.45)",
  computing: "rgba(130, 160, 255, 0.45)",
  agriculture: "rgba(139, 195, 74, 0.45)",
  warfare: "rgba(200, 80, 80, 0.45)",
  science: "rgba(200, 200, 255, 0.45)",
};

export const CATEGORY_ICONS: Record<TechCategory, string> = {
  survival: "flame",
  food: "grain",
  materials: "brick",
  energy: "bolt",
  tools: "wrench",
  transport: "wheel",
  construction: "column",
  medicine: "cross",
  communication: "waves",
  computing: "cpu",
  agriculture: "leaf",
  warfare: "shield",
  science: "atom",
};
