import { useMemo } from "react";
import type { TechCategory, TechEra } from "../types/technology";
import { loadTechnologySummaries } from "../data/loadTechnologies";
import { layoutTechTree } from "../utils/treeLayout";

export interface TechTreeFilters {
  category: TechCategory | null;
  era: TechEra | null;
  search: string;
}

export function useTechTree(filters: TechTreeFilters) {
  const all = useMemo(() => loadTechnologySummaries(), []);

  const filtered = useMemo(() => {
    let list = all;
    if (filters.category) {
      list = list.filter((t) => t.category === filters.category);
    }
    if (filters.era) {
      list = list.filter((t) => t.era === filters.era);
    }
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [all, filters.category, filters.era, filters.search]);

  const positions = useMemo(
    () => layoutTechTree(filtered),
    [filtered]
  );

  const positionById = useMemo(() => {
    const m = new Map<string, (typeof positions)[0]>();
    for (const p of positions) m.set(p.id, p);
    return m;
  }, [positions]);

  return { all, filtered, positions, positionById };
}
