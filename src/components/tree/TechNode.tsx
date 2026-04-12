import { memo, useCallback, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import type { Technology } from "../../types/technology";
import { CategoryIcon } from "../ui/CategoryIcon";
import { CATEGORY_GLOW, CATEGORY_LABEL } from "../../utils/categoryMeta";
import { verificationDotClass } from "../../utils/verificationUi";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export type TechNodeData = {
  tech: Technology;
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
  const borderGold = locked
    ? "border-codex-locked"
    : selected
      ? "border-codex-gold shadow-node-selected codex-node-selected"
      : spaceGlow
        ? "border-codex-space shadow-[0_0_14px_rgba(0,212,255,0.45)]"
        : "border-codex-gold/70 shadow-node-glow";

  const vDot = verificationDotClass(tech.verification.status);

  return (
    <div className={`relative transition-opacity ${dimmed ? "opacity-30" : "opacity-100"}`}>
      <span
        className={`absolute -right-0.5 -top-0.5 z-10 h-2.5 w-2.5 rounded-full border border-codex-bg ${vDot}`}
        title={`Verification: ${tech.verification.status.replaceAll("-", " ")}`}
        aria-hidden
      />
      {earthOnly && accent === "space" ? (
        <span
          className="absolute -left-1 -top-1 z-10 text-sm"
          title="Contains Earth-constrained raw materials"
          aria-hidden
        >
          ⚠
        </span>
      ) : null}
      <Handle
        type="target"
        position={Position.Top}
        className={`!h-2 !w-2 !border-0 ${edgeActive ? "!bg-codex-space" : "!bg-codex-blue"}`}
        aria-label={`Prerequisites connect here for ${tech.name}`}
      />
      <button
        type="button"
        onClick={onClick}
        onKeyDown={onKeyDown}
        className={`codex-node-ring flex w-[148px] flex-col items-center rounded-lg border-2 bg-codex-card px-2 py-2 text-left outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-codex-blue focus-visible:ring-offset-2 focus-visible:ring-offset-codex-bg ${
          locked ? "opacity-45" : ""
        } ${borderGold}`}
        style={{
          boxShadow:
            locked || selected
              ? undefined
              : `0 0 14px ${edgeActive ? "rgba(0,212,255,0.65)" : glowBase}`,
        }}
        aria-label={`${tech.name}. ${tech.tagline}. Category ${CATEGORY_LABEL[tech.category]}. Era ${tech.era.replaceAll("-", " ")}. Difficulty ${tech.difficulty} of 5.${isMobile ? " Double-tap to open." : " Press Enter to open."}`}
      >
        <CategoryIcon
          category={tech.category}
          className={`mb-1 ${locked ? "text-codex-muted" : accent === "space" ? "text-codex-space" : "text-codex-gold"}`}
          label=""
        />
        <span className="font-display text-center text-sm font-semibold leading-tight text-codex-text">
          {tech.name}
        </span>
        <span className="mt-1 line-clamp-2 text-center text-[10px] leading-snug text-codex-secondary">
          {tech.tagline}
        </span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-wide text-codex-muted">
          {locked ? "locked" : `D${tech.difficulty}`} · {tech.era.replaceAll("-", " ")}
        </span>
      </button>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!h-2 !w-2 !border-0 ${edgeActive ? "!bg-codex-space" : "!bg-codex-blue"}`}
        aria-label={`Unlocks connect from here for ${tech.name}`}
      />
    </div>
  );
}

export const TechNode = memo(TechNodeInner);
