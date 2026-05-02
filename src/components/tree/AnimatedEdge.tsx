import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { memo } from "react";

export function AnimatedEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const active = data?.active;
  const stroke = active ? "#00D4FF" : "#4A7FBD";
  const strokeWidth = active ? 3 : 1.5;
  const opacity = active ? 0.9 : 0.25;

  return (
    <>
      {/* Background glow for active edges */}
      {active && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke,
            strokeWidth: strokeWidth + 4,
            opacity: 0.15,
            filter: "blur(4px)",
          }}
        />
      )}
      
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke,
          strokeWidth,
          opacity,
          transition: "stroke-width 0.3s, stroke 0.3s, opacity 0.3s",
        }}
      />

      {/* Animated flow overlay */}
      {active && (
        <path
          d={edgePath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={strokeWidth * 0.5}
          strokeDasharray="10, 20"
          strokeLinecap="round"
          style={{
            opacity: 0.8,
            filter: "drop-shadow(0 0 4px #00D4FF)",
          }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="30"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        </path>
      )}
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeInner);
