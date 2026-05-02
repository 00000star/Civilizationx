import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import type { TechnologySummary } from "../../types/technology";

type HighlightState = {
  hoverId: string | null;
  highlightId: string | null;
  pathIds: Set<string> | null;
  pathEdgeIds: Set<string> | null;
  hoverBrightIds: Set<string>;
};

const HighlightContext = createContext<{
  state: HighlightState;
  setHoverId: (id: string | null) => void;
} | null>(null);

export function HighlightProvider({ 
  children, 
  highlightId, 
  pathIds, 
  pathEdgeIds,
  techById,
  inSet
}: { 
  children: ReactNode;
  highlightId: string | null;
  pathIds?: Set<string>;
  pathEdgeIds?: Set<string>;
  techById: Map<string, TechnologySummary>;
  inSet: Set<string>;
}) {
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

export function useHighlight() {
  const ctx = useContext(HighlightContext);
  if (!ctx) throw new Error("useHighlight must be used within HighlightProvider");
  return ctx;
}
