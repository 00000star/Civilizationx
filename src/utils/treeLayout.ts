import type { TechCategory, TechnologySummary } from "../types/technology";

const NODE_WIDTH = 156;
const NODE_HEIGHT = 96;
const COLUMN_GAP = 42;
const ROW_GAP = 16;
const MAX_ROWS_PER_COLUMN = 20;

const CATEGORY_ORDER: TechCategory[] = [
  "survival",
  "food",
  "agriculture",
  "medicine",
  "materials",
  "tools",
  "construction",
  "energy",
  "transport",
  "communication",
  "computing",
  "science",
  "warfare",
];

const categoryRank = new Map(CATEGORY_ORDER.map((category, index) => [category, index]));

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  layer: number;
}

/**
 * Compact left-to-right atlas layout.
 *
 * The tree has hundreds of entries, so a strict graph layout can produce a
 * very tall canvas. This keeps dependency depth readable while wrapping large
 * depth layers into neighboring columns so the whole civilization map can be
 * seen at overview zoom.
 */
export function layoutTechTree(technologies: TechnologySummary[]): PositionedNode[] {
  const byId = new Map(technologies.map((tech) => [tech.id, tech]));
  const inSet = new Set(byId.keys());
  const depthMemo = new Map<string, number>();

  const depthOf = (id: string, visiting = new Set<string>()): number => {
    const cached = depthMemo.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;

    const tech = byId.get(id);
    if (!tech) return 0;

    visiting.add(id);
    const prerequisiteDepths = tech.prerequisites
      .filter((pid) => inSet.has(pid))
      .map((pid) => depthOf(pid, visiting));
    visiting.delete(id);

    const depth = prerequisiteDepths.length ? Math.max(...prerequisiteDepths) + 1 : 0;
    depthMemo.set(id, depth);
    return depth;
  };

  const layers = new Map<number, TechnologySummary[]>();
  for (const tech of technologies) {
    const depth = depthOf(tech.id);
    const layer = layers.get(depth) ?? [];
    layer.push(tech);
    layers.set(depth, layer);
  }

  const rowPitch = NODE_HEIGHT + ROW_GAP;
  const columnPitch = NODE_WIDTH + COLUMN_GAP;
  const positioned = new Map<string, PositionedNode>();
  let column = 0;

  for (const depth of [...layers.keys()].sort((a, b) => a - b)) {
    const layer = [...(layers.get(depth) ?? [])].sort((a, b) => {
      const byCategory =
        (categoryRank.get(a.category) ?? 999) - (categoryRank.get(b.category) ?? 999);
      if (byCategory) return byCategory;
      const byEra = a.era.localeCompare(b.era);
      if (byEra) return byEra;
      return a.name.localeCompare(b.name);
    });

    const chunkCount = Math.max(1, Math.ceil(layer.length / MAX_ROWS_PER_COLUMN));
    for (let chunk = 0; chunk < chunkCount; chunk++) {
      const start = chunk * MAX_ROWS_PER_COLUMN;
      const items = layer.slice(start, start + MAX_ROWS_PER_COLUMN);
      const yOffset = ((MAX_ROWS_PER_COLUMN - items.length) * rowPitch) / 2;

      for (let row = 0; row < items.length; row++) {
        const tech = items[row];
        positioned.set(tech.id, {
          id: tech.id,
          x: 48 + (column + chunk) * columnPitch,
          y: 48 + yOffset + row * rowPitch,
          layer: depth,
        });
      }
    }

    column += chunkCount + 1;
  }

  return technologies.map((tech) => positioned.get(tech.id) ?? {
    id: tech.id,
    x: 48,
    y: 48,
    layer: 0,
  });
}
