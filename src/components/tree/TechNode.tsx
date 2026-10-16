import {
  memo,
  useCallback,
  useRef,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { Handle, Position, type NodeProps, useStore } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import type { TechnologySummary } from "../../types/technology";
import { CategoryIcon } from "../ui/CategoryIcon";
import { CATEGORY_GLOW, CATEGORY_LABEL } from "../../utils/categoryMeta";
import { verificationDotClass } from "../../utils/verificationUi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useHighlight } from "./useHighlight";

export type TechNodeData = {
  tech: TechnologySummary;
  locked: boolean;
  spaceGlow: boolean;
  earthOnly: boolean;
  accent: "gold" | "space";
  isMatch: boolean;
  selectionMode: boolean;
  onSelect?: (id: string) => void;
};

function TechNodeInner({ data }: NodeProps) {
  const { tech, locked, spaceGlow, earthOnly, accent, isMatch, selectionMode, onSelect } =
    data as TechNodeData;
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const lastTap = useRef<number>(0);

  // Consume Highlight Context
  const { state, setHoverId } = useHighlight();
  const { hoverId, highlightId, pathIds, hoverBrightIds } = state;

  // Selective selector for zoom thresholds to avoid re-renders on pan/slight-zoom
  const { showContent, showLabels } = useStore((s) => {
    const zoom = s.transform[2];
    return {
      showContent: zoom > 0.6,
      showLabels: zoom > 0.35,
    };
  }, (a, b) => a.showContent === b.showContent && a.showLabels === b.showLabels);

  const isSelected = useMemo(() => Boolean(tech.id === highlightId || pathIds?.has(tech.id)), [tech.id, highlightId, pathIds]);
  const isPath = useMemo(() => Boolean(pathIds?.has(tech.id)), [tech.id, pathIds]);

  const dimmed = useMemo(() => {
    if (hoverId) return !hoverBrightIds.has(tech.id);
    if (pathIds) return !isPath;
    return !isMatch;
  }, [hoverId, hoverBrightIds, tech.id, pathIds, isPath, isMatch]);

  // Check if any connected edge is active (this node is either source or target of an active edge)
  // This is a bit complex to do per-node efficiently without passing more data, 
  // so we'll simplify: edgeActive is true if this node is hovered or a direct neighbor of a hovered node.
  const edgeActive = useMemo(() => hoverBrightIds.has(tech.id), [hoverBrightIds, tech.id]);

  const open = useCallback(() => {
    navigate(`/tech/${tech.id}`);
  }, [navigate, tech.id]);

  const selectForPath = useCallback(() => {
    onSelect?.(tech.id);
  }, [onSelect, tech.id]);

  const onClick = useCallback(() => {
    if (selectionMode) {
      selectForPath();
      return;
    }
    if (!isMobile) {
      open();
      return;
    }
    const now = Date.now();
    if (now - lastTap.current < 350) {
      open();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [isMobile, open, selectForPath, selectionMode]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (selectionMode) selectForPath();
        else open();
      }
    },
    [open, selectForPath, selectionMode]
  );

  const glowBase = accent === "space" ? "rgba(0,212,255,0.45)" : CATEGORY_GLOW[tech.category];
  const vDot = verificationDotClass(tech.verification.status);

  const nodeAccent = accent === "space" ? "rgba(0,212,255,0.52)" : glowBase;
  const nodeStyle = useMemo<CSSProperties>(
    () => ({
      width: showContent ? 156 : 46,
      height: showContent ? 96 : 46,
      background:
        "linear-gradient(145deg, rgba(35,35,51,0.96), rgba(16,16,25,0.94) 58%, rgba(8,8,13,0.98))",
      boxShadow:
        locked || isSelected
          ? undefined
          : `0 16px 40px -28px rgba(0,0,0,0.9), 0 0 26px -12px ${edgeActive ? "rgba(0,212,255,0.72)" : nodeAccent}`,
    }),
    [edgeActive, isSelected, locked, nodeAccent, showContent]
  );

  const borderClass = locked
    ? "border-codex-locked/40"
    : isSelected
      ? "border-codex-gold/90 shadow-node-selected"
      : spaceGlow
        ? "border-codex-space/60"
        : "border-white/15";

  const wrapperStyle = useMemo<CSSProperties>(
    () => ({
      opacity: dimmed ? 0.3 : 1,
      transform: isSelected ? "scale(1.05)" : undefined,
    }),
    [dimmed, isSelected]
  );

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setHoverId(tech.id)}
      onMouseLeave={() => setHoverId(null)}
      className="relative transition-[opacity,transform] duration-150 hover:-translate-y-0.5 hover:scale-[1.02]"
    >
      <span
        className={`absolute -right-0.5 -top-0.5 z-10 h-2.5 w-2.5 rounded-full border border-codex-bg shadow-sm ${vDot}`}
        title={`Verification: ${tech.verification.status.replaceAll("-", " ")}`}
        aria-hidden
      />
      
      {earthOnly && accent === "space" && showLabels ? (
        <span
          className="absolute -left-2 -top-2 z-10 text-xs text-orange-400 drop-shadow-md"
          title="Contains Earth-constrained raw materials"
          aria-hidden
        >
          ⚠
        </span>
      ) : null}

      <Handle
        type="target"
        position={Position.Left}
        className={`!h-2 !w-2 !border-0 transition-colors ${edgeActive ? "!bg-codex-space" : "!bg-codex-blue/50"}`}
        aria-label={`Prerequisites connect here for ${tech.name}`}
      />

      <button
        type="button"
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={`group relative flex overflow-hidden rounded-xl border p-2.5 text-left outline-none backdrop-blur-md transition-all duration-300 focus-visible:ring-2 focus-visible:ring-codex-blue/50 ${borderClass} ${
          selectionMode ? "cursor-crosshair" : ""
        } ${
          locked ? "opacity-60 saturate-50" : "hover:border-white/30"
        }`}
        style={nodeStyle}
        aria-label={`${tech.name}. ${tech.tagline}. Category ${CATEGORY_LABEL[tech.category]}. Era ${tech.era.replaceAll("-", " ")}. Difficulty ${tech.difficulty} of 5.${selectionMode ? " Select for pathfinding." : isMobile ? " Double-tap to open." : " Press Enter to open."}`}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-80"
          style={{
            background: `linear-gradient(90deg, transparent, ${nodeAccent}, transparent)`,
          }}
        />
        <span
          className="pointer-events-none absolute bottom-0 left-0 top-0 w-1 opacity-80"
          style={{
            background: `linear-gradient(180deg, transparent, ${nodeAccent}, transparent)`,
          }}
        />
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl transition-opacity group-hover:opacity-45"
          style={{ background: nodeAccent }}
        />
        {isSelected ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              boxShadow: `inset 0 0 0 1px ${nodeAccent}, 0 0 32px -8px ${nodeAccent}`,
            }}
          />
        ) : null}

        <div className={`relative z-[1] flex items-center ${showContent ? "gap-2" : "justify-center"}`}>
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
              locked ? "border-white/5 bg-white/[0.03]" : "border-white/10 bg-white/[0.06]"
            }`}
            style={{ boxShadow: locked ? undefined : `inset 0 0 18px -12px ${nodeAccent}` }}
          >
            <CategoryIcon
              category={tech.category}
              className={`h-4 w-4 transition-colors ${locked ? "text-codex-muted" : accent === "space" ? "text-codex-space" : "text-codex-gold"}`}
              label=""
            />
          </span>
          {showContent ? (
            <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-widest text-codex-muted">
              {CATEGORY_LABEL[tech.category]}
            </span>
          ) : null}
        </div>

        {showContent && (
          <>
            <span className="relative z-[1] mt-2 line-clamp-2 min-h-[2.1rem] font-display text-[13px] font-bold leading-tight tracking-tight text-codex-text">
              {tech.name}
            </span>
            <div className="relative z-[1] mt-auto flex items-center justify-between gap-2 font-mono text-[8px] uppercase text-codex-muted/85">
              <span
                className={`rounded-full border px-1.5 py-0.5 ${
                  locked
                    ? "border-white/5 text-codex-muted"
                    : "border-codex-gold/25 bg-codex-gold/10 text-codex-gold/90"
                }`}
              >
                {locked ? "locked" : `rank ${tech.difficulty}`}
              </span>
              <span className="truncate opacity-65">{tech.maturity.replaceAll("-", " ")}</span>
            </div>
          </>
        )}

        {!locked && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      <Handle
        type="source"
        position={Position.Right}
        className={`!h-2 !w-2 !border-0 transition-colors ${edgeActive ? "!bg-codex-space" : "!bg-codex-blue/50"}`}
        aria-label={`Unlocks connect from here for ${tech.name}`}
      />
    </div>
  );
}

export const TechNode = memo(TechNodeInner);
