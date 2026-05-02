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
import { HighlightProvider, useHighlight } from "./HighlightContext";

const nodeTypes = { tech: TechNode };
const edgeTypes = { animated: AnimatedEdge };

interface Props {
  technologies: TechnologySummary[];
  positions: { id: string; x: number; y: number }[];
  matchingIds?: Set<string>;
  pathIds?: Set<string>;
  pathEdgeIds?: Set<string>;
  onNodeClick?: (id: string) => void;
}

function TechTreeInner({ 
  technologies, 
  positions, 
  matchingIds, 
  onNodeClick,
  techById
}: Props & { techById: Map<string, TechnologySummary> }) {
  const [params] = useSearchParams();
  const highlightId = params.get("node");
  const unlocked = useUnlockedIds();
  const { isSpace } = useCodexMode();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [treeReady, setTreeReady] = useState(false);
  
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
        },
        draggable: false,
        selectable: false,
      })),
    [technologies, posMap, unlocked, isSpace, matchingIds]
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
        setTimeout(() => instance.setCenter(p.x + 74, p.y + 46, { zoom: isMobile ? 0.8 : 1.1, duration: 800 }), 100);
        return;
      }
    }
    instance.fitView({ padding: 0.15, duration: 400, maxZoom: isMobile ? 0.42 : 1.1, minZoom: isMobile ? 0.25 : 0.1 });
  }, [isMobile, highlightId, posMap]);

  useEffect(() => {
    if (!treeReady || !highlightId || !rf) return;
    const p = posMap.get(highlightId);
    if (p) rf.setCenter(p.x + 74, p.y + 46, { zoom: isMobile ? 0.8 : 1.1, duration: 800 });
  }, [highlightId, treeReady, rf, posMap, isMobile]);

  const hoverTech = hoverId ? techById.get(hoverId) : undefined;

  return (
    <div className="relative h-[calc(100dvh-4.5rem)] min-h-[420px] w-full md:h-[calc(100dvh-5rem)] overflow-hidden" onMouseMove={onPointerMove}>
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
        minZoom={0.05}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        nodesDraggable={false}
        elevateEdgesOnSelect
        className="!bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="rgba(154,152,136,0.1)" />
        <TreeControls technologies={technologies} isSpace={isSpace} />
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
