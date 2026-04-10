import { Controls, MiniMap } from "@xyflow/react";

export function TreeControls() {
  return (
    <>
      <Controls
        showInteractive={false}
        className="!shadow-lg"
        aria-label="Zoom and fit controls"
      />
      <MiniMap
        maskColor="rgba(10,10,15,0.85)"
        nodeColor={() => "rgba(201,168,76,0.45)"}
        pannable
        zoomable
        aria-label="Tree minimap — drag to pan overview"
        className="!bottom-4 !left-4 !top-auto"
      />
    </>
  );
}
