import type { Technology } from "../types/technology";
import type { TechIndex } from "../types/technology";
import index from "./index.json";

const modules = import.meta.glob<{ default: Technology }>(
  "./technologies/*.json",
  { eager: true }
);

export function loadAllTechnologies(): Technology[] {
  const list: Technology[] = [];
  for (const path in modules) {
    list.push(modules[path].default);
  }
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

export function loadTechnology(id: string): Technology | undefined {
  const path = `./technologies/${id}.json`;
  const mod = modules[path];
  return mod?.default;
}

export function getTechIndex(): TechIndex {
  return index as TechIndex;
}

export function getTechnologyIds(): string[] {
  return (index as TechIndex).nodes.map((n) => n.id);
}
