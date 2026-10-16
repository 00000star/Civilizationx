import { loadTechnologySummaries } from "../data/loadTechnologies";

const unlockedIds = new Set(loadTechnologySummaries().map((t) => t.id));

/**
 * Future: persist unlocked nodes per user / scenario.
 * For v1 the Codex treats all indexed technologies as readable.
 */
export function useUnlockedIds(): ReadonlySet<string> {
  return unlockedIds;
}
