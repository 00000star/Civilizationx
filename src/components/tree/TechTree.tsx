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
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { TechnologySummary } from "../../types/technology";
import { TechNode, type TechNodeData } from "./TechNode";
import { AnimatedEdge } from "./AnimatedEdge";
import { NodeTooltip } from "./NodeTooltip";
import { TreeControls } from "./TreeControls";
import { useUnlockedIds } from "../../hooks/useProgression";
import { useCodexMode } from "../../context/useCodexMode";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const nodeTypes = { tech: TechNode };
const edgeTypes = { animated: AnimatedEdge };

interface Props {
  technologies: TechnologySummary[];
  positions: { id: string; x: number; y: number }[];
  matchingIds?: Set<string>;
}

export function TechTree({ technologies, positions, matchingIds }: Props) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const highlightId = params.get("node");
  const unlocked = useUnlockedIds();
  const { isSpace } = useCodexMode();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [treeReady, setTreeReady] = useState(false);

  const [rf, setRf] = useState<ReactFlowInstance<
    Node<TechNodeData>,
    Edge
  > | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [hoverPt, setHoverPt] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<TechnologySummary | null>(null);

  const posMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const p of positions) m.set(p.id, { x: p.x, y: p.y });
    return m;
  }, [positions]);

  const inSet = useMemo(
    () => new Set(technologies.map((t) => t.id)),
    [technologies]
  );

  const techById = useMemo(() => {
    const m = new Map<string, TechnologySummary>();
    for (const t of technologies) m.set(t.id, t);
    return m;
  }, [technologies]);

  const hoverBright = useMemo(() => {
    const s = new Set<string>();
    if (!hoverId) return s;
    s.add(hoverId);
    const h = techById.get(hoverId);
    if (!h) return s;
    for (const p of h.prerequisites) {
      if (inSet.has(p)) s.add(p);
    }
    for (const u of h.unlocks) {
      if (inSet.has(u)) s.add(u);
    }
    return s;
  }, [hoverId, techById, inSet]);

  const nodes: Node<TechNodeData>[] = useMemo(
    () =>
      technologies.map((tech) => {
        const p = posMap.get(tech.id) ?? { x: 0, y: 0 };
        const locked = !unlocked.has(tech.id);
        const isMatch = !matchingIds || matchingIds.has(tech.id);
        const dimmed = Boolean((hoverId && !hoverBright.has(tech.id)) || (!isMatch));
        const accent = isSpace ? "space" : "gold";

        const incomingEdgeActive =
          Boolean(hoverId) &&
          tech.prerequisites.some((pid) => {
            if (!inSet.has(pid)) return false;
            const parent = techById.get(pid);
            return (
              hoverId === tech.id ||
              (hoverId === pid && (parent?.unlocks.includes(tech.id) ?? false))
            );
          });
        const outgoingEdgeActive =
          Boolean(hoverId) &&
          tech.unlocks.some((uid) => {
            if (!inSet.has(uid)) return false;
            return (
              hoverId === uid ||
              (hoverId === tech.id && tech.unlocks.includes(uid))
            );
          });
        const edgeActive = incomingEdgeActive || outgoingEdgeActive;

        return {
          id: tech.id,
          type: "tech",
          position: p,
          data: {
            tech,
            locked,
            selected: tech.id === highlightId,
            dimmed,
            edgeActive,
            spaceGlow: isSpace && tech.spaceReadiness.fullAlternatives,
            earthOnly: isSpace && tech.spaceReadiness.earthOnly,
            accent,
          },
          draggable: false,
          selectable: false,
        };
      }),
    [
      technologies,
      posMap,
      unlocked,
      highlightId,
      hoverId,
      hoverBright,
      isSpace,
      inSet,
      techById,
      matchingIds,
    ]
  );

  const edges: Edge[] = useMemo(() => {
    const e: Edge[] = [];
    for (const t of technologies) {
      for (const p of t.prerequisites) {
        if (!inSet.has(p)) continue;
        const parent = techById.get(p);
        const active =
          Boolean(hoverId) &&
          (hoverId === t.id || (hoverId === p && (parent?.unlocks.includes(t.id) ?? false)));
        
        e.push({
          id: `${p}->${t.id}`,
          source: p,
          target: t.id,
          type: "animated",
          data: { active },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: active ? "#00D4FF" : "#4A7FBD",
            width: 16,
            height: 16,
          },
        });
      }
    }
    return e;
  }, [technologies, inSet, hoverId, techById]);

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
      setTreeReady(true);
      
      if (highlightId) {
        const p = posMap.get(highlightId);
        if (p) {
          setTimeout(() => {
            instance.setCenter(p.x + 74, p.y + 46, { zoom: isMobile ? 0.8 : 1.1, duration: 800 });
          }, 100);
          return;
        }
      }

      instance.fitView({
        padding: 0.15,
        duration: 400,
        maxZoom: isMobile ? 0.42 : 1.1,
        minZoom: isMobile ? 0.25 : 0.1,
      });
    },
    [isMobile, highlightId, posMap]
  );

  useEffect(() => {
    if (!treeReady || !highlightId || !rf) return;
    const p = posMap.get(highlightId);
    if (p) {
      rf.setCenter(p.x + 74, p.y + 46, { zoom: isMobile ? 0.8 : 1.1, duration: 800 });
    }
  }, [highlightId, treeReady, rf, posMap, isMobile]);

  return (
    <div
      className="relative h-[calc(100dvh-4.5rem)] min-h-[420px] w-full md:h-[calc(100dvh-5rem)] overflow-hidden"
      onMouseMove={onPointerMove}
    >
      {!treeReady ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-codex-bg/55 backdrop-blur-sm"
          aria-busy="true"
          aria-label="Loading technology tree"
        >
          <div className="h-10 w-10 animate-pulse rounded-full border-2 border-codex-gold border-t-transparent" />
        </div>
      ) : null}
      
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
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodesDraggable={false}
        elevateEdgesOnSelect
        className="!bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1}
          color="rgba(154,152,136,0.1)"
        />
        <TreeControls technologies={technologies} isSpace={isSpace} />
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
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 right-0 top-16 z-40 flex w-full max-w-[320px] flex-col border-l border-white/10 bg-codex-surface/90 p-5 shadow-2xl backdrop-blur-xl md:top-20"
            aria-label="Technology quick preview"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-xl font-bold leading-tight text-codex-text">
                {preview.name}
              </h2>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full bg-white/5 p-1 text-codex-secondary hover:bg-white/10 hover:text-codex-text transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-codex-secondary/90 italic">
              {preview.tagline}
            </p>
            <div className="mt-6 flex-1 space-y-4">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-codex-muted">Category</p>
                <p className="mt-1 text-sm font-medium text-codex-text capitalize">{preview.category}</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-codex-muted">Era</p>
                <p className="mt-1 text-sm font-medium text-codex-text">{preview.era.replaceAll("-", " ")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/tech/${preview.id}`)}
              className="mt-8 w-full rounded-lg bg-codex-gold py-3 text-sm font-bold text-codex-bg shadow-lg shadow-codex-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Access Full Documentary
            </button>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <span className="sr-only" aria-live="polite">
        {rf
          ? "Tree loaded. Use mouse to pan, scroll to zoom. On small screens, double-tap a node to open."
          : ""}
      </span>
    </div>
  );
}
