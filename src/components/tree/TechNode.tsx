import { memo, useCallback, useRef } from "react";
import { Handle, Position, type NodeProps, useStore } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { TechnologySummary } from "../../types/technology";
import { CategoryIcon } from "../ui/CategoryIcon";
import { CATEGORY_GLOW, CATEGORY_LABEL } from "../../utils/categoryMeta";
import { verificationDotClass } from "../../utils/verificationUi";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export type TechNodeData = {
  tech: TechnologySummary;
  selected: boolean;
  locked: boolean;
  dimmed: boolean;
  edgeActive: boolean;
  spaceGlow: boolean;
  earthOnly: boolean;
  accent: "gold" | "space";
};

function TechNodeInner({ data }: NodeProps) {
  const { tech, selected, locked, dimmed, edgeActive, spaceGlow, earthOnly, accent } =
    data as TechNodeData;
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const lastTap = useRef<number>(0);

  // Selective selector for zoom thresholds to avoid re-renders on pan/slight-zoom
  const { showContent, showLabels } = useStore((s) => {
    const zoom = s.transform[2];
    return {
      showContent: zoom > 0.6,
      showLabels: zoom > 0.35,
    };
  }, (a, b) => a.showContent === b.showContent && a.showLabels === b.showLabels);

  const open = useCallback(() => {
    navigate(`/tech/${tech.id}`);
  }, [navigate, tech.id]);

  const onClick = useCallback(() => {
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
  }, [isMobile, open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    },
    [open]
  );

  const glowBase = accent === "space" ? "rgba(0,212,255,0.45)" : CATEGORY_GLOW[tech.category];
  const vDot = verificationDotClass(tech.verification.status);

  // Glassmorphism classes
  const glassClass = "backdrop-blur-md bg-codex-card/85 border-white/10";
  const borderClass = locked
    ? "border-codex-locked/40"
    : selected
      ? "border-codex-gold shadow-node-selected"
      : spaceGlow
        ? "border-codex-space/60"
        : "border-white/20";

  return (
    <motion.div
      initial={false}
      animate={{
        scale: selected ? 1.05 : 1,
        opacity: dimmed ? 0.3 : 1,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative"
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
        className={`group relative flex flex-col rounded-lg border p-2.5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-codex-blue/50 ${glassClass} ${borderClass} ${
          locked ? "opacity-60 saturate-50" : "hover:shadow-lg"
        }`}
        style={{
          width: showContent ? 148 : 42,
          height: showContent ? 92 : 42,
          boxShadow: locked || selected ? undefined : `0 0 20px -5px ${edgeActive ? "rgba(0,212,255,0.4)" : glowBase}`,
        }}
        aria-label={`${tech.name}. ${tech.tagline}. Category ${CATEGORY_LABEL[tech.category]}. Era ${tech.era.replaceAll("-", " ")}. Difficulty ${tech.difficulty} of 5.${isMobile ? " Double-tap to open." : " Press Enter to open."}`}
      >
        <div className={`flex items-center ${showContent ? "gap-1.5" : "justify-center"}`}>
          <CategoryIcon
            category={tech.category}
            className={`h-4 w-4 transition-colors ${locked ? "text-codex-muted" : accent === "space" ? "text-codex-space" : "text-codex-gold"}`}
            label=""
          />
          {showContent && (
            <span className="min-w-0 truncate font-mono text-[9px] uppercase tracking-widest text-codex-muted">
              {tech.category}
            </span>
          )}
        </div>

        {showContent && (
          <>
            <span className="mt-1.5 line-clamp-2 min-h-[2.2rem] font-display text-[13px] font-bold leading-tight tracking-tight text-codex-text">
              {tech.name}
            </span>
            <div className="mt-auto flex items-center justify-between gap-2 font-mono text-[8px] uppercase tracking-tighter text-codex-muted/80">
              <span className="flex items-center gap-1">
                {locked ? "locked" : <span className="text-codex-gold/80">rank {tech.difficulty}</span>}
              </span>
              <span className="truncate opacity-60">{tech.maturity.replaceAll("-", " ")}</span>
            </div>
          </>
        )}

        {/* Subtle holographic glare effect on hover */}
        {!locked && (
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>

      <Handle
        type="source"
        position={Position.Right}
        className={`!h-2 !w-2 !border-0 transition-colors ${edgeActive ? "!bg-codex-space" : "!bg-codex-blue/50"}`}
        aria-label={`Unlocks connect from here for ${tech.name}`}
      />
    </motion.div>
  );
}

export const TechNode = memo(TechNodeInner);
