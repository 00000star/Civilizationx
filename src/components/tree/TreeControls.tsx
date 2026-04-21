import { useState } from "react";
import { Controls, MiniMap } from "@xyflow/react";
import type { TechnologySummary } from "../../types/technology";
import { PathFinderPanel } from "./PathFinderPanel";

interface Props {
  technologies: TechnologySummary[];
  isSpace: boolean;
}

export function TreeControls({ technologies, isSpace }: Props) {
  const [open, setOpen] = useState(false);
  const nodeColor = isSpace ? "rgba(0,212,255,0.45)" : "rgba(201,168,76,0.45)";

  return (
    <>
      <Controls
        showInteractive={false}
        className="!shadow-lg"
        aria-label="Zoom and fit controls"
      />
      <div className="absolute right-4 top-4 z-10 flex max-w-sm flex-col gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded border border-codex-border bg-codex-surface/95 px-3 py-2 text-left text-xs font-medium text-codex-text shadow-lg backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          aria-expanded={open}
        >
          Find path
        </button>
        {open ? (
          <div className="max-h-[70vh] overflow-y-auto shadow-xl">
            <PathFinderPanel technologies={technologies} />
          </div>
        ) : null}
        {isSpace ? (
          <div className="rounded border border-codex-space/40 bg-codex-surface/95 p-2 text-[10px] leading-snug text-codex-secondary backdrop-blur">
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
        className="!bottom-4 !right-4 !left-auto !top-auto"
      />
    </>
  );
}
