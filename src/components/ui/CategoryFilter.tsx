import type { TechCategory } from "../../types/technology";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";

const ALL: (TechCategory | "all")[] = [
  "all",
  "survival",
  "food",
  "materials",
  "energy",
  "tools",
  "transport",
  "construction",
  "medicine",
  "communication",
  "computing",
  "agriculture",
  "warfare",
  "science",
];

interface Props {
  value: TechCategory | null;
  onChange: (v: TechCategory | null) => void;
}

export function CategoryFilter({ value, onChange }: Props) {
  return (
    <div
          className="flex flex-wrap items-center justify-end gap-1.5"
          role="group"
          aria-label="Filter by category"
        >
      {ALL.map((key) => {
        const active = key === "all" ? value === null : value === key;
        const label = key === "all" ? "All" : CATEGORY_LABEL[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key === "all" ? null : key)}
            aria-pressed={active}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
              active
                ? "border-codex-gold bg-codex-card text-codex-gold"
                : "border-codex-border bg-codex-surface text-codex-secondary hover:border-codex-gold/40 hover:text-codex-text"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
