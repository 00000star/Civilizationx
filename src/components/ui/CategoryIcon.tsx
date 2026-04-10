import type { TechCategory } from "../../types/technology";
import { CATEGORY_ICONS } from "../../utils/categoryMeta";

const paths: Record<string, JSX.Element> = {
  flame: (
    <path
      d="M12 3c2 4 4 6 4 9a4 4 0 1 1-8 0c0-2 1.5-4.5 3-7 .5 2 1.5 3.2 2 4.5.8-1.2 1.5-2.7 1-6.5z"
      fill="currentColor"
    />
  ),
  grain: (
    <path
      d="M6 10c1-3 3-5 6-5 2 0 3.5 1 4.5 2.5M6 14c1 3 3 5 6 5 2 0 3.5-1 4.5-2.5M10 6c-1 2-1 4 0 6M14 6c1 2 1 4 0 6M8 12h8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
  brick: (
    <path
      d="M4 8h6v4H4V8zm8 0h8v4h-8V8zM8 12h4v4H8v-4zm6 0h6v4h-6v-4z"
      fill="currentColor"
    />
  ),
  bolt: (
    <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" fill="currentColor" />
  ),
  wrench: (
    <path
      d="M14.7 6.3a4 4 0 0 0-6.3 4.5L3 16l2 2 5.4-5.4a4 4 0 0 0 4.3-6.3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  wheel: (
    <circle
      cx="12"
      cy="12"
      r="7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  ),
  column: (
    <path
      d="M9 4h6v2H9V4zm0 4h6v12H9V8zm-2 12h10v2H7v-2z"
      fill="currentColor"
    />
  ),
  cross: (
    <path
      d="M12 5v14M7 10h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
  waves: (
    <path
      d="M4 12c2-2 4-2 6 0s4 2 6 0M4 8c2-2 4-2 6 0s4 2 6 0M4 16c2-2 4-2 6 0s4 2 6 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
  cpu: (
    <rect
      x="7"
      y="7"
      width="10"
      height="10"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  ),
  leaf: (
    <path
      d="M6 18c6-1 10-6 10-12-6 0-11 4-12 10 3 1 5 2 2 2z"
      fill="currentColor"
    />
  ),
  shield: (
    <path
      d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  atom: (
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="8" ry="3.5" />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(-60 12 12)" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </g>
  ),
};

interface Props {
  category: TechCategory;
  className?: string;
  label: string;
}

export function CategoryIcon({ category, className, label }: Props) {
  const key = CATEGORY_ICONS[category];
  const inner = paths[key] ?? paths.atom;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
    >
      {label ? <title>{label}</title> : null}
      {inner}
    </svg>
  );
}
