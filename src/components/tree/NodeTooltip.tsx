import type { Technology } from "../../types/technology";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";

interface Props {
  tech: Technology;
  locked: boolean;
}

export function NodeTooltip({ tech, locked }: Props) {
  return (
    <div className="max-w-xs rounded-md border border-codex-border bg-codex-surface px-3 py-2 text-sm shadow-xl">
      <p className="font-display text-base font-semibold text-codex-text">
        {tech.name}
      </p>
      <p className="mt-1 text-xs text-codex-secondary">{tech.tagline}</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-codex-muted">
        <dt className="font-mono uppercase tracking-wide">Category</dt>
        <dd className="text-codex-secondary">
          {CATEGORY_LABEL[tech.category]}
        </dd>
        <dt className="font-mono uppercase tracking-wide">Era</dt>
        <dd className="text-codex-secondary">
          {tech.era.replaceAll("-", " ")}
        </dd>
        <dt className="font-mono uppercase tracking-wide">Difficulty</dt>
        <dd className="text-codex-secondary">
          {tech.difficulty} of 5
          {locked ? " · locked" : ""}
        </dd>
      </dl>
    </div>
  );
}
