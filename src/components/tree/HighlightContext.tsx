import { useMemo, useState } from "react";
import {
  HighlightContext,
  type HighlightProviderProps,
} from "./highlightContextCore";

export function HighlightProvider({ 
  children, 
  highlightId, 
  pathIds, 
  pathEdgeIds,
  techById,
  inSet
}: HighlightProviderProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const hoverBrightIds = useMemo(() => {
    const s = new Set<string>();
    if (!hoverId) return s;
    s.add(hoverId);
    const h = techById.get(hoverId);
    if (!h) return s;
    for (const p of h.prerequisites) if (inSet.has(p)) s.add(p);
    for (const u of h.unlocks) if (inSet.has(u)) s.add(u);
    return s;
  }, [hoverId, techById, inSet]);

  const value = useMemo(() => ({
    state: {
      hoverId,
      highlightId,
      pathIds: pathIds ?? null,
      pathEdgeIds: pathEdgeIds ?? null,
      hoverBrightIds
    },
    setHoverId
  }), [hoverId, highlightId, pathIds, pathEdgeIds, hoverBrightIds]);

  return (
    <HighlightContext.Provider value={value}>
      {children}
    </HighlightContext.Provider>
  );
}
