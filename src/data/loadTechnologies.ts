import type { Technology, TechnologySummary } from "../types/technology";
import type { TechIndex } from "../types/technology";
import index from "./index.json";
import summaries from "./summaries.json";

const modules = import.meta.glob<{ default: Technology }>(
  "./technologies/*.json"
);

export function loadTechnologySummaries(): TechnologySummary[] {
  return summaries as TechnologySummary[];
}

export async function loadAllTechnologies(): Promise<Technology[]> {
  const list = await Promise.all(
    Object.values(modules).map(async (load) => (await load()).default)
  );
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadTechnology(id: string): Promise<Technology | undefined> {
  const path = `./technologies/${id}.json`;
  const load = modules[path];
  if (!load) return undefined;
  return (await load()).default;
}

export function getTechIndex(): TechIndex {
  return index as TechIndex;
}

export function getTechnologyIds(): string[] {
  return (index as TechIndex).nodes.map((n) => n.id);
}
