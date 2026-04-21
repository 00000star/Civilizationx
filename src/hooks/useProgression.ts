import { useMemo } from "react";
import { loadTechnologySummaries } from "../data/loadTechnologies";

/**
 * Future: persist unlocked nodes per user / scenario.
 * For v1 the Codex treats all indexed technologies as readable.
 */
export function useUnlockedIds(): ReadonlySet<string> {
  const all = useMemo(() => loadTechnologySummaries(), []);
  return useMemo(() => new Set(all.map((t) => t.id)), [all]);
}
