import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Technology } from "../../types/technology";
import { TechNode, type TechNodeData } from "./TechNode";
import { NodeTooltip } from "./NodeTooltip";
import { TreeControls } from "./TreeControls";
import { useUnlockedIds } from "../../hooks/useProgression";

const nodeTypes = { tech: TechNode };

interface Props {
  technologies: Technology[];
  positions: { id: string; x: number; y: number }[];
}

export function TechTree({ technologies, positions }: Props) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const highlightId = params.get("node");
  const unlocked = useUnlockedIds();

  const [rf, setRf] = useState<ReactFlowInstance<
    Node<TechNodeData>,
    Edge
  > | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverPt, setHoverPt] = useState<{ x: number; y: number } | null>(
    null
  );
  const [preview, setPreview] = useState<Technology | null>(null);

  const posMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const p of positions) m.set(p.id, { x: p.x, y: p.y });
    return m;
  }, [positions]);

  const inSet = useMemo(
    () => new Set(technologies.map((t) => t.id)),
    [technologies]
  );

  const nodes: Node<TechNodeData>[] = useMemo(
    () =>
      technologies.map((tech) => {
        const p = posMap.get(tech.id) ?? { x: 0, y: 0 };
        const locked = !unlocked.has(tech.id);
        return {
          id: tech.id,
          type: "tech",
          position: p,
          style: { width: 148 },
          data: {
            tech,
            locked,
            selected: tech.id === highlightId,
          },
          draggable: false,
          selectable: false,
        };
      }),
    [technologies, posMap, unlocked, highlightId]
  );

  const edges: Edge[] = useMemo(() => {
    const e: Edge[] = [];
    for (const t of technologies) {
      for (const p of t.prerequisites) {
        if (!inSet.has(p)) continue;
        e.push({
          id: `${p}->${t.id}`,
          source: p,
          target: t.id,
          animated: true,
          className: "codex-edge animated",
          style: { stroke: "#4A7FBD", strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#4A7FBD",
            width: 18,
            height: 18,
          },
        });
      }
    }
    return e;
  }, [technologies, inSet]);

  const techById = useMemo(() => {
    const m = new Map<string, Technology>();
    for (const t of technologies) m.set(t.id, t);
    return m;
  }, [technologies]);

  const hoverTech = hoverId ? techById.get(hoverId) : undefined;

  const onPointerMove = useCallback(
    (event: React.MouseEvent) => {
      if (!hoverId) {
        setHoverPt(null);
        return;
      }
      setHoverPt({ x: event.clientX + 12, y: event.clientY + 12 });
    },
    [hoverId]
  );

  const onNodeMouseEnter = useCallback(
    (_: React.MouseEvent, node: Node<TechNodeData>) => {
      setHoverId(node.id);
    },
    []
  );

  const onNodeMouseLeave = useCallback(() => {
    setHoverId(null);
    setHoverPt(null);
  }, []);

  const onNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: Node<TechNodeData>) => {
      e.preventDefault();
      setPreview(node.data.tech);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setPreview(null);
  }, []);

  const onInit = useCallback(
    (instance: ReactFlowInstance<Node<TechNodeData>, Edge>) => {
      setRf(instance);
      instance.fitView({ padding: 0.2, duration: 200 });
    },
    []
  );

  return (
    <div
      className="relative h-[calc(100dvh-4.5rem)] min-h-[420px] w-full md:h-[calc(100dvh-5rem)]"
      onMouseMove={onPointerMove}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        minZoom={0.15}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodesDraggable={false}
        elevateEdgesOnSelect
        className="!bg-codex-bg"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="rgba(154,152,136,0.2)"
        />
        <TreeControls />
      </ReactFlow>

      {hoverTech && hoverPt ? (
        <div
          className="pointer-events-none fixed z-50"
          style={{ left: hoverPt.x, top: hoverPt.y }}
          role="tooltip"
        >
          <NodeTooltip
            tech={hoverTech}
            locked={!unlocked.has(hoverTech.id)}
          />
        </div>
      ) : null}

      <AnimatePresence>
        {preview ? (
          <motion.aside
            key="preview"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className="fixed bottom-0 right-0 top-16 z-40 flex w-full max-w-[300px] flex-col border-l border-codex-border bg-codex-surface/95 p-4 shadow-2xl backdrop-blur-md md:top-20"
            aria-label="Technology quick preview"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg font-semibold leading-snug text-codex-text">
                {preview.name}
              </h2>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded border border-codex-border px-2 py-1 text-xs text-codex-secondary hover:bg-codex-card hover:text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
              >
                Close
              </button>
            </div>
            <p className="mt-2 text-sm text-codex-secondary">{preview.tagline}</p>
            <p className="mt-3 line-clamp-6 text-xs leading-relaxed text-codex-muted">
              {preview.overview}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/tech/${preview.id}`)}
              className="mt-4 w-full rounded border border-codex-gold/60 bg-codex-card py-2 text-sm font-medium text-codex-gold hover:bg-codex-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-gold"
            >
              Open documentary
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* Hidden utility for keyboard users: focus canvas then use tab to nodes — nodes are buttons inside */}
      <span className="sr-only" aria-live="polite">
        {rf
          ? "Tree loaded. Use mouse to pan, scroll to zoom. Nodes are buttons — Tab into the canvas in supporting browsers."
          : ""}
      </span>
    </div>
  );
}
