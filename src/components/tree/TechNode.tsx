import { memo, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import type { Technology } from "../../types/technology";
import { CategoryIcon } from "../ui/CategoryIcon";
import { CATEGORY_GLOW, CATEGORY_LABEL } from "../../utils/categoryMeta";

export type TechNodeData = {
  tech: Technology;
  selected: boolean;
  locked: boolean;
};

function TechNodeInner({ data }: NodeProps) {
  const { tech, selected, locked } = data as TechNodeData;
  const navigate = useNavigate();

  const open = useCallback(() => {
    navigate(`/tech/${tech.id}`);
  }, [navigate, tech.id]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    },
    [open]
  );

  const glow = CATEGORY_GLOW[tech.category];
  const border = locked
    ? "border-codex-locked"
    : selected
      ? "border-codex-gold shadow-node-selected codex-node-selected"
      : "border-codex-gold/70 shadow-node-glow";

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-codex-blue"
        aria-label={`Prerequisites connect here for ${tech.name}`}
      />
      <button
        type="button"
        onClick={open}
        onKeyDown={onKeyDown}
        className={`codex-node-ring flex w-[148px] flex-col items-center rounded-lg border-2 bg-codex-card px-2 py-2 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-codex-blue focus-visible:ring-offset-2 focus-visible:ring-offset-codex-bg ${
          locked ? "opacity-45" : "opacity-100"
        } ${border}`}
        style={{
          boxShadow: locked
            ? undefined
            : selected
              ? undefined
              : `0 0 14px ${glow}`,
        }}
        aria-label={`${tech.name}. ${tech.tagline}. Category ${CATEGORY_LABEL[tech.category]}. Era ${tech.era.replaceAll("-", " ")}. Difficulty ${tech.difficulty} of 5. Press Enter to open documentary.`}
      >
        <CategoryIcon
          category={tech.category}
          className={`mb-1 ${locked ? "text-codex-muted" : "text-codex-gold"}`}
          label=""
        />
        <span className="font-display text-center text-sm font-semibold leading-tight text-codex-text">
          {tech.name}
        </span>
        <span className="mt-1 line-clamp-2 text-center text-[10px] leading-snug text-codex-secondary">
          {tech.tagline}
        </span>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-wide text-codex-muted">
          {locked ? "locked" : `D${tech.difficulty}`} ·{" "}
          {tech.era.replaceAll("-", " ")}
        </span>
      </button>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-codex-blue"
        aria-label={`Unlocks connect from here for ${tech.name}`}
      />
    </div>
  );
}

export const TechNode = memo(TechNodeInner);
