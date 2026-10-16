import { useContext } from "react";
import { HighlightContext } from "./highlightContextCore";

export function useHighlight() {
  const ctx = useContext(HighlightContext);
  if (!ctx) throw new Error("useHighlight must be used within HighlightProvider");
  return ctx;
}
