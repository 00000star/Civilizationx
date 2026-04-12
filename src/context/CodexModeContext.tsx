import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CodexModeContext,
  type CodexMode,
} from "./codexModeContext";

const STORAGE_KEY = "codex-mode";

function readMode(): CodexMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "space") return "space";
  } catch {
    /* ignore */
  }
  return "earth";
}

export function CodexModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<CodexMode>(() =>
    typeof window !== "undefined" ? readMode() : "earth"
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.codexMode = mode;
  }, [mode]);

  const setMode = useCallback((m: CodexMode) => {
    setModeState(m);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((m) => (m === "earth" ? "space" : "earth"));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isSpace: mode === "space",
    }),
    [mode, setMode, toggleMode]
  );

  return (
    <CodexModeContext.Provider value={value}>{children}</CodexModeContext.Provider>
  );
}
