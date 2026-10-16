import { createContext, type ReactNode } from "react";
import type { TechnologySummary } from "../../types/technology";

export type HighlightState = {
  hoverId: string | null;
  highlightId: string | null;
  pathIds: Set<string> | null;
  pathEdgeIds: Set<string> | null;
  hoverBrightIds: Set<string>;
};

export type HighlightContextValue = {
  state: HighlightState;
  setHoverId: (id: string | null) => void;
};

export type HighlightProviderProps = {
  children: ReactNode;
  highlightId: string | null;
  pathIds?: Set<string>;
  pathEdgeIds?: Set<string>;
  techById: Map<string, TechnologySummary>;
  inSet: Set<string>;
};

export const HighlightContext = createContext<HighlightContextValue | null>(null);
