import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryFilter } from "../components/ui/CategoryFilter";
import { TechTree } from "../components/tree/TechTree";
import { StarfieldCanvas } from "../components/tree/StarfieldCanvas";
import { TreeWelcomeBanner } from "../components/tree/TreeWelcomeBanner";
import { TreeSearch } from "../components/tree/TreeSearch";
import { TreeCategoryJump } from "../components/tree/TreeCategoryJump";
import { useTechTree } from "../hooks/useTechTree";
import type { TechCategory, TechEra } from "../types/technology";
import { loadTechnologySummaries } from "../data/loadTechnologies";
import { TECH_TREE_ERAS as ERAS } from "../utils/eras";
import { shortestPrerequisitePath } from "../utils/pathfinder";

const TREE_WELCOME_KEY = "codex-tree-welcome-dismissed";

export function TreePage() {
  const [category, setCategory] = useState<TechCategory | null>(null);
  const [era, setEra] = useState<TechEra | null>(null);

  // Pathfinder state
  const [pathfinderMode, setPathfinderMode] = useState(false);
  const [pathStart, setPathStart] = useState<string | null>(null);
  const [pathEnd, setPathEnd] = useState<string | null>(null);

  const all = useMemo(() => loadTechnologySummaries(), []);
  const { positions } = useTechTree({ category: null, era: null, search: "" });

  const matchingIds = useMemo(() => {
    if (!category && !era) return undefined;
    const ids = new Set<string>();
    for (const t of all) {
      const catMatch = !category || t.category === category;
      const eraMatch = !era || t.era === era;
      if (catMatch && eraMatch) ids.add(t.id);
    }
    return ids;
  }, [all, category, era]);

  const pathResult = useMemo(() => {
    if (!pathStart || !pathEnd) return null;
    return shortestPrerequisitePath(all, pathStart, pathEnd);
  }, [all, pathStart, pathEnd]);

  const pathIds = useMemo(() => {
    if (!pathResult) return undefined;
    return new Set(pathResult);
  }, [pathResult]);

  const pathEdgeIds = useMemo(() => {
    if (!pathResult) return undefined;
    const edges = new Set<string>();
    for (let i = 0; i < pathResult.length - 1; i++) {
      edges.add(`${pathResult[i]}->${pathResult[i + 1]}`);
    }
    return edges;
  }, [pathResult]);

  const onNodeClick = useCallback((id: string) => {
    if (!pathfinderMode) return;
    
    if (!pathStart || (pathStart && pathEnd)) {
      setPathStart(id);
      setPathEnd(null);
    } else {
      setPathEnd(id);
    }
  }, [pathfinderMode, pathStart, pathEnd]);

  const eraSliderMax = ERAS.length;
  const eraSliderIndex = useMemo(() => {
    if (!era) return eraSliderMax;
    const i = ERAS.findIndex((e) => e.id === era);
    return i >= 0 ? i : eraSliderMax;
  }, [era, eraSliderMax]);

  const onEraSlider = (index: number) => {
    if (index >= eraSliderMax) setEra(null);
    else setEra((ERAS[index]?.id as TechEra) ?? null);
  };

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(TREE_WELCOME_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    const id = requestAnimationFrame(() => setShowWelcome(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    try {
      sessionStorage.setItem(TREE_WELCOME_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-codex-border bg-codex-surface/80 px-3 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <TreeSearch technologies={all} />
          
          <div className="flex flex-1 flex-col gap-2 lg:items-end">
            <div className="flex items-center gap-4">
               {/* Pathfinder Toggle */}
              <button
                onClick={() => {
                  setPathfinderMode(!pathfinderMode);
                  if (pathfinderMode) {
                    setPathStart(null);
                    setPathEnd(null);
                  }
                }}
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold transition-all ${
                  pathfinderMode 
                    ? "border-codex-gold bg-codex-gold/10 text-codex-gold shadow-lg shadow-codex-gold/10" 
                    : "border-white/10 bg-white/5 text-codex-muted hover:border-white/20 hover:text-codex-text"
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.487V6a2 2 0 011.106-1.789l5.447-2.724a2 2 0 011.894 0l5.447 2.724A2 2 0 0118 6v9.487a2 2 0 01-1.106 1.789L11.447 20a2 2 0 01-1.894 0z" />
                </svg>
                {pathfinderMode ? "PATHFINDER ACTIVE" : "ACTIVATE PATHFINDER"}
              </button>
              <CategoryFilter value={category} onChange={setCategory} />
            </div>
            
            {category || era || pathfinderMode ? (
              <button
                type="button"
                onClick={() => {
                  setCategory(null);
                  setEra(null);
                  setPathfinderMode(false);
                  setPathStart(null);
                  setPathEnd(null);
                }}
                className="self-end text-[10px] uppercase tracking-wider text-codex-gold hover:underline focus-visible:outline-none"
              >
                Reset canvas
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <StarfieldCanvas />
        <AnimatePresence>
          {showWelcome ? <TreeWelcomeBanner onDismiss={dismissWelcome} /> : null}
        </AnimatePresence>
        
        {/* Pathfinder Status Overlay */}
        <AnimatePresence>
          {pathfinderMode && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-4 left-1/2 z-30 -translate-x-1/2 pointer-events-none"
            >
              <div className="rounded-full border border-codex-gold/30 bg-codex-bg/90 px-6 py-2 shadow-2xl backdrop-blur-md flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${pathStart ? "bg-codex-gold" : "bg-white/20 animate-pulse"}`} />
                  <span className="text-[10px] uppercase tracking-widest text-codex-muted">
                    {pathStart ? all.find(t => t.id === pathStart)?.name : "Select Start Node"}
                  </span>
                </div>
                <div className="text-codex-muted text-xs">→</div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${pathEnd ? "bg-codex-gold" : "bg-white/20 animate-pulse"}`} />
                  <span className="text-[10px] uppercase tracking-widest text-codex-muted">
                    {pathEnd ? all.find(t => t.id === pathEnd)?.name : "Select End Node"}
                  </span>
                </div>
                {pathResult && (
                   <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-codex-gold uppercase tracking-tighter">
                        {pathResult.length} steps found
                      </span>
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-[1] min-h-0 flex-1">
          <TechTree 
            technologies={all} 
            positions={positions} 
            matchingIds={matchingIds}
            pathIds={pathIds}
            pathEdgeIds={pathEdgeIds}
            onNodeClick={onNodeClick}
          />
        </div>
        
        {/* Category Jump Bar */}
        {!pathfinderMode && (
          <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 pointer-events-auto">
            <div className="rounded-full border border-white/10 bg-codex-bg/80 shadow-2xl backdrop-blur-md">
              <TreeCategoryJump technologies={all} />
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-auto fixed bottom-6 right-6 z-20 hidden w-56 rounded-xl border border-white/10 bg-codex-surface/90 p-4 shadow-2xl backdrop-blur-xl md:block">
        <label
          htmlFor="era-slider"
          className="font-mono text-[10px] uppercase tracking-widest text-codex-muted"
        >
          Timeline Navigation
        </label>
        <input
          id="era-slider"
          type="range"
          min={0}
          max={eraSliderMax}
          value={eraSliderIndex}
          onChange={(e) => onEraSlider(Number(e.target.value))}
          className="mt-3 w-full accent-codex-gold"
        />
        <p className="mt-2 text-center text-xs font-bold text-codex-gold">
          {era ? ERAS.find((e) => e.id === era)?.label : "Universal Overview"}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
           <span className="text-[10px] text-codex-muted">{all.length} total nodes</span>
           <span className="text-[10px] text-codex-muted">
             {pathIds ? `${pathIds.size} path` : matchingIds ? `${matchingIds.size} filter` : `${all.length} total`}
           </span>
        </div>
      </div>

      <div className="border-t border-codex-border bg-codex-surface px-3 py-2 md:hidden">
        <label
          htmlFor="era-select"
          className="font-mono text-[10px] uppercase tracking-wide text-codex-muted"
        >
          Era
        </label>
        <select
          id="era-select"
          value={era ?? ""}
          onChange={(e) =>
            setEra((e.target.value as TechEra) || null)
          }
          className="mt-1 w-full rounded border border-codex-border bg-codex-bg px-2 py-2 text-sm text-codex-text"
        >
          <option value="">All eras</option>
          {ERAS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
