import type { Technology } from "../types/technology";

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  layer: number;
}

const LAYER_GAP = 140;
const NODE_GAP = 200;
const ORIGIN_X = 80;
const ORIGIN_Y = 100;

/**
 * Layer nodes by prerequisite depth (roots at layer 0).
 * Spreads siblings horizontally for readability on large trees.
 */
export function layoutTechTree(technologies: Technology[]): PositionedNode[] {
  const byId = new Map(technologies.map((t) => [t.id, t]));
  const memo = new Map<string, number>();

  function layerOf(id: string): number {
    if (memo.has(id)) return memo.get(id)!;
    const tech = byId.get(id);
    if (!tech) {
      memo.set(id, 0);
      return 0;
    }
    if (tech.prerequisites.length === 0) {
      memo.set(id, 0);
      return 0;
    }
    const depth =
      1 +
      Math.max(
        ...tech.prerequisites.map((p) => layerOf(p)),
        0
      );
    memo.set(id, depth);
    return depth;
  }

  for (const t of technologies) layerOf(t.id);

  const layers = new Map<number, string[]>();
  for (const t of technologies) {
    const L = memo.get(t.id) ?? 0;
    if (!layers.has(L)) layers.set(L, []);
    layers.get(L)!.push(t.id);
  }

  const sortedLayerKeys = [...layers.keys()].sort((a, b) => a - b);
  const positioned: PositionedNode[] = [];

  for (const L of sortedLayerKeys) {
    const ids = layers.get(L)!;
    ids.sort((a, b) => a.localeCompare(b));
    const width = (ids.length - 1) * NODE_GAP;
    const startX = ORIGIN_X + Math.max(0, 400 - width / 2);

    ids.forEach((id, i) => {
      positioned.push({
        id,
        x: startX + i * NODE_GAP,
        y: ORIGIN_Y + L * LAYER_GAP,
        layer: L,
      });
    });
  }

  return positioned;
}
