import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CodexMode = "earth" | "space";

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

type CodexModeContextValue = {
  mode: CodexMode;
  setMode: (m: CodexMode) => void;
  toggleMode: () => void;
  isSpace: boolean;
};

const CodexModeContext = createContext<CodexModeContextValue | null>(null);

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

export function useCodexMode(): CodexModeContextValue {
  const ctx = useContext(CodexModeContext);
  if (!ctx) {
    throw new Error("useCodexMode must be used within CodexModeProvider");
  }
  return ctx;
}
