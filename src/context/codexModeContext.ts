import { createContext } from "react";

export type CodexMode = "earth" | "space";

export type CodexModeContextValue = {
  mode: CodexMode;
  setMode: (m: CodexMode) => void;
  toggleMode: () => void;
  isSpace: boolean;
};

export const CodexModeContext = createContext<CodexModeContextValue | null>(null);
