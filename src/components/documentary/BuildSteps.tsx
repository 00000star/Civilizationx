import { useCallback, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BuildStep } from "../../types/technology";

interface Props {
  steps: BuildStep[];
}

export function BuildSteps({ steps }: Props) {
  const sorted = useMemo(() => [...steps].sort((a, b) => a.order - b.order), [steps]);
  
  // Mission Control State
  const [missionActive, setMissionActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const progress = useMemo(() => {
    if (sorted.length === 0) return 0;
    return Math.round((completedSteps.size / sorted.length) * 100);
  }, [completedSteps, sorted]);

  const toggleStep = useCallback((order: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
    
    // Auto-advance if we complete the current step
    if (order === currentStep && currentStep < sorted.length) {
      setCurrentStep(order + 1);
    }
  }, [currentStep, sorted.length]);

  if (sorted.length === 0) {
    return <p className="text-codex-muted italic text-sm">No build sequence recorded for this entry.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Mission Control Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-codex-card/30 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
             <div className={`h-2 w-2 rounded-full ${missionActive ? "bg-green-500 animate-pulse" : "bg-white/20"}`} />
             <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-codex-gold">
               {missionActive ? "Mission Execution: Active" : "Operational Protocol"}
             </h3>
          </div>
          <p className="mt-2 text-xs text-codex-secondary max-w-md">
            Follow the serialized operational sequence. Validate all prerequisites before initialization of each step.
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-3 md:items-end">
          {!missionActive ? (
            <button
              onClick={() => setMissionActive(true)}
              className="w-full rounded border border-codex-gold/40 bg-codex-gold/10 px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-codex-gold transition-all hover:bg-codex-gold/20 active:scale-95 md:w-auto"
            >
              Initialize Build Mode
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2 w-full md:w-64">
               <div className="flex justify-between w-full font-mono text-[10px] uppercase tracking-tighter">
                  <span className="text-codex-muted">Overall Progress</span>
                  <span className="text-codex-gold font-bold">{progress}%</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-codex-gold shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  />
               </div>
               <button 
                 onClick={() => {
                   setMissionActive(false);
                   setCompletedSteps(new Set());
                   setCurrentStep(1);
                 }}
                 className="mt-2 text-[10px] font-mono text-red-400/60 uppercase tracking-widest hover:text-red-400 transition-colors"
               >
                 Abort Execution
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Steps List */}
      <ol className="space-y-4">
        {sorted.map((s) => {
          const isActive = missionActive && s.order === currentStep;
          const isCompleted = completedSteps.has(s.order);
          const isLocked = missionActive && s.order > currentStep && !isCompleted;
          
          return (
            <li
              key={s.order}
              className={`relative overflow-hidden rounded-lg border transition-all duration-500 ${
                isActive 
                  ? "border-codex-gold bg-codex-gold/5 shadow-lg shadow-codex-gold/5" 
                  : isCompleted 
                    ? "border-green-500/20 bg-green-500/5 opacity-80" 
                    : isLocked
                      ? "border-white/5 bg-transparent opacity-30 grayscale"
                      : "border-white/10 bg-codex-card/50"
              }`}
            >
              {/* Progress Line for Active Step */}
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1 bg-codex-gold shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              )}

              <div className="flex p-5 gap-4">
                <div className="flex flex-col items-center gap-2 pt-1">
                   <button
                     disabled={!missionActive || isLocked}
                     onClick={() => toggleStep(s.order)}
                     className={`flex h-6 w-6 items-center justify-center rounded border transition-all ${
                       isCompleted 
                         ? "bg-green-500 border-green-500 text-codex-bg" 
                         : isActive 
                           ? "border-codex-gold text-codex-gold hover:bg-codex-gold/20" 
                           : "border-white/20 text-transparent"
                     }`}
                   >
                     {isCompleted ? "✓" : ""}
                   </button>
                   <div className="w-px flex-1 bg-white/5" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-[10px] font-bold ${isActive ? "text-codex-gold" : "text-codex-muted"}`}>
                        STEP {String(s.order).padStart(2, "0")}
                      </span>
                      <h3 className={`font-display text-lg font-bold tracking-tight ${isActive ? "text-codex-text" : "text-codex-secondary"}`}>
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  {s.warningNote && (
                    <div className={`mt-3 rounded border px-4 py-3 text-xs leading-relaxed ${
                      isActive ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-white/10 bg-white/5 text-codex-muted"
                    }`}>
                      <span className="font-mono font-bold uppercase tracking-widest block mb-1">Safety Warning</span>
                      {s.warningNote}
                    </div>
                  )}

                  <AnimatePresence>
                    {(!missionActive || isActive || isCompleted) && (
                      <motion.div
                        initial={missionActive ? { height: 0, opacity: 0 } : false}
                        animate={{ height: "auto", opacity: 1 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-4 text-sm leading-relaxed text-codex-secondary">
                          {s.description}
                        </p>
                        
                        {s.prerequisiteTools.length > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[9px] uppercase tracking-widest text-codex-muted mr-2">Required Tools:</span>
                            {s.prerequisiteTools.map(tool => (
                              <span key={tool} className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[9px] text-codex-text border border-white/5 capitalize">
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
