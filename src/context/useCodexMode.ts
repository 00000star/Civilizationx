import { useContext } from "react";
import { CodexModeContext, type CodexModeContextValue } from "./codexModeContext";

export function useCodexMode(): CodexModeContextValue {
  const ctx = useContext(CodexModeContext);
  if (!ctx) {
    throw new Error("useCodexMode must be used within CodexModeProvider");
  }
  return ctx;
}
