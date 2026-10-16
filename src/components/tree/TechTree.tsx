import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useSearchParams } from "react-router-dom";
import type { TechnologySummary } from "../../types/technology";
import { TechNode, type TechNodeData } from "./TechNode";
import { AnimatedEdge } from "./AnimatedEdge";
import { NodeTooltip } from "./NodeTooltip";
import { TreeControls } from "./TreeControls";
import { useUnlockedIds } from "../../hooks/useProgression";
import { useCodexMode } from "../../context/useCodexMode";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { HighlightProvider } from "./HighlightContext";
import { useHighlight } from "./useHighlight";

const nodeTypes = { tech: TechNode };
const edgeTypes = { animated: AnimatedEdge };
const NODE_CENTER = { x: 78, y: 48 };

interface Props {
  technologies: TechnologySummary[];
  positions: { id: string; x: number; y: number }[];
  matchingIds?: Set<string>;
  pathIds?: Set<string>;
  pathEdgeIds?: Set<string>;
  selectionMode?: boolean;
  onNodeClick?: (id: string) => void;
}

function TechTreeInner({ 
  technologies, 
  positions, 
  matchingIds, 
  selectionMode,
  onNodeClick,
  techById
}: Props & { techById: Map<string, TechnologySummary> }) {
  const [params] = useSearchParams();
  const highlightId = params.get("node");
  const unlocked = useUnlockedIds();
  const { isSpace } = useCodexMode();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [treeReady, setTreeReady] = useState(false);
  const [edgesReady, setEdgesReady] = useState(false);
  
  const { state } = useHighlight();
  const { hoverId } = state;

  const [rf, setRf] = useState<ReactFlowInstance<Node<TechNodeData>, Edge> | null>(null);
  const [hoverPt, setHoverPt] = useState<{ x: number; y: number } | null>(null);

  const posMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const p of positions) m.set(p.id, { x: p.x, y: p.y });
    return m;
  }, [positions]);

  const inSet = useMemo(() => new Set(technologies.map((t) => t.id)), [technologies]);

  const nodes: Node<TechNodeData>[] = useMemo(
    () =>
      technologies.map((tech) => ({
        id: tech.id,
        type: "tech",
        position: posMap.get(tech.id) ?? { x: 0, y: 0 },
        data: {
          tech,
          locked: !unlocked.has(tech.id),
          spaceGlow: isSpace && tech.spaceReadiness.fullAlternatives,
          earthOnly: isSpace && tech.spaceReadiness.earthOnly,
          accent: isSpace ? "space" : "gold",
          isMatch: !matchingIds || matchingIds.has(tech.id),
          selectionMode: Boolean(selectionMode),
          onSelect: onNodeClick,
        },
        draggable: false,
        selectable: false,
      })),
    [technologies, posMap, unlocked, isSpace, matchingIds, selectionMode, onNodeClick]
  );

  const allEdges: Edge[] = useMemo(() => {
    const e: Edge[] = [];
    for (const t of technologies) {
      for (const p of t.prerequisites) {
        if (!inSet.has(p)) continue;
        e.push({
          id: `${p}->${t.id}`,
          source: p,
          target: t.id,
          type: "animated",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#4A7FBD",
            width: 16,
            height: 16,
          },
        });
      }
    }
    return e;
  }, [technologies, inSet]);

  useEffect(() => {
    setEdgesReady(false);
    if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setEdgesReady(true), { timeout: 900 });
      return () => window.cancelIdleCallback(id);
    }

    const id = globalThis.setTimeout(() => setEdgesReady(true), 80);
    return () => globalThis.clearTimeout(id);
  }, [technologies]);

  const edges = edgesReady ? allEdges : [];

  const onPointerMove = useCallback((event: React.MouseEvent) => {
    if (!hoverId) {
      setHoverPt(null);
      return;
    }
    setHoverPt({ x: event.clientX + 12, y: event.clientY + 12 });
  }, [hoverId]);

  const onInit = useCallback((instance: ReactFlowInstance<Node<TechNodeData>, Edge>) => {
    setRf(instance);
    setTreeReady(true);
    if (highlightId) {
      const p = posMap.get(highlightId);
      if (p) {
        setTimeout(() => instance.setCenter(p.x + NODE_CENTER.x, p.y + NODE_CENTER.y, { zoom: isMobile ? 0.72 : 0.95, duration: 800 }), 100);
        return;
      }
    }
    instance.fitView({
      padding: isMobile ? 0.03 : 0.05,
      duration: 450,
      maxZoom: isMobile ? 0.34 : 0.82,
      minZoom: isMobile ? 0.035 : 0.04,
    });
  }, [isMobile, highlightId, posMap]);

  useEffect(() => {
    if (!treeReady || !highlightId || !rf) return;
    const p = posMap.get(highlightId);
    if (p) rf.setCenter(p.x + NODE_CENTER.x, p.y + NODE_CENTER.y, { zoom: isMobile ? 0.72 : 0.95, duration: 800 });
  }, [highlightId, treeReady, rf, posMap, isMobile]);

  const hoverTech = hoverId ? techById.get(hoverId) : undefined;
  const visibleCount = matchingIds?.size ?? technologies.length;

  return (
    <div className="codex-tree-stage relative h-[calc(100dvh-4.5rem)] min-h-[420px] w-full overflow-hidden md:h-[calc(100dvh-5rem)]" onMouseMove={onPointerMove}>
      {!treeReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-codex-bg/55 backdrop-blur-sm">
          <div className="h-10 w-10 animate-pulse rounded-full border-2 border-codex-gold border-t-transparent" />
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        minZoom={isMobile ? 0.035 : 0.04}
        maxZoom={1.35}
        proOptions={{ hideAttribution: true }}
        onNodeClick={selectionMode ? undefined : (_, node) => onNodeClick?.(node.id)}
        nodesDraggable={false}
        elevateEdgesOnSelect
        className={`codex-tree-flow !bg-transparent ${selectionMode ? "codex-tree-selecting" : ""}`}
      >
        <Background variant={BackgroundVariant.Lines} gap={96} size={0.45} color="rgba(201,168,76,0.07)" />
        <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="rgba(154,152,136,0.13)" />
        <TreeControls technologies={technologies} isSpace={isSpace} visibleCount={visibleCount} />
      </ReactFlow>

      {hoverTech && hoverPt && (
        <div className="pointer-events-none fixed z-50" style={{ left: hoverPt.x, top: hoverPt.y }} role="tooltip">
          <NodeTooltip tech={hoverTech} locked={!unlocked.has(hoverTech.id)} />
        </div>
      )}

      <span className="sr-only" aria-live="polite">{rf ? "Tree loaded." : ""}</span>
    </div>
  );
}

export function TechTree(props: Props) {
  const inSet = useMemo(() => new Set(props.technologies.map((t) => t.id)), [props.technologies]);
  const techById = useMemo(() => {
    const m = new Map<string, TechnologySummary>();
    for (const t of props.technologies) m.set(t.id, t);
    return m;
  }, [props.technologies]);

  const [params] = useSearchParams();
  const highlightId = params.get("node");

  return (
    <HighlightProvider 
      highlightId={highlightId} 
      pathIds={props.pathIds} 
      pathEdgeIds={props.pathEdgeIds}
      techById={techById}
      inSet={inSet}
    >
      <TechTreeInner {...props} techById={techById} />
    </HighlightProvider>
  );
}
