import { lazy, Suspense, useState } from "react";
import { Controls, MiniMap } from "@xyflow/react";
import type { TechnologySummary } from "../../types/technology";

const PathFinderPanel = lazy(() =>
  import("./PathFinderPanel").then((mod) => ({ default: mod.PathFinderPanel }))
);

interface Props {
  technologies: TechnologySummary[];
  isSpace: boolean;
  visibleCount?: number;
}

export function TreeControls({ technologies, isSpace, visibleCount }: Props) {
  const [open, setOpen] = useState(false);
  const nodeColor = isSpace ? "rgba(0,212,255,0.45)" : "rgba(201,168,76,0.45)";
  const shown = visibleCount ?? technologies.length;

  return (
    <>
      <Controls
        showInteractive={false}
        className="!left-4 !top-4 !shadow-2xl"
        aria-label="Zoom and fit controls"
      />
      <div className="absolute right-4 top-4 z-10 flex max-w-sm flex-col gap-2 print:hidden">
        <div className="rounded-xl border border-white/10 bg-codex-bg/75 px-3 py-2 shadow-2xl backdrop-blur-xl">
          <p className="font-mono text-[9px] uppercase tracking-widest text-codex-muted">
            Civilization Graph
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display text-2xl font-semibold leading-none text-codex-text">
              {shown}
            </span>
            <span className="pb-0.5 font-mono text-[10px] uppercase text-codex-muted">
              visible of {technologies.length}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-codex-border/80 bg-codex-surface/90 px-3 py-2 text-left text-xs font-semibold text-codex-text shadow-2xl backdrop-blur-xl transition-colors hover:border-codex-gold/50 hover:text-codex-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          aria-expanded={open}
        >
          Route finder
        </button>
        {open ? (
          <div className="max-h-[70vh] overflow-y-auto rounded-xl shadow-2xl">
            <Suspense
              fallback={
                <div className="rounded-xl border border-codex-border bg-codex-surface/95 p-4 text-xs text-codex-secondary">
                  Loading route finder...
                </div>
              }
            >
              <PathFinderPanel technologies={technologies} />
            </Suspense>
          </div>
        ) : null}
        {isSpace ? (
          <div className="rounded-xl border border-codex-space/40 bg-codex-surface/90 p-3 text-[10px] leading-snug text-codex-secondary shadow-2xl backdrop-blur-xl">
            <p className="font-mono uppercase text-codex-space">Legend</p>
            <p className="mt-1">
              Cyan glow: all raw materials list viable space alternatives. ⚠ on node: at least one
              material is Earth-constrained in text.
            </p>
          </div>
        ) : null}
      </div>
      <MiniMap
        maskColor="rgba(10,10,15,0.85)"
        nodeColor={() => nodeColor}
        pannable
        zoomable
        aria-label="Tree minimap — drag to pan overview"
        className="!bottom-4 !left-4 !right-auto !top-auto !h-32 !w-48"
      />
    </>
  );
}
