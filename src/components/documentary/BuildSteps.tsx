import type { BuildStep } from "../../types/technology";

interface Props {
  steps: BuildStep[];
}

export function BuildSteps({ steps }: Props) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  return (
    <ol className="space-y-4">
      {sorted.map((s) => (
        <li
          key={s.order}
          className="rounded-lg border border-codex-border bg-codex-card p-4"
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <span
              className="font-mono text-xs text-codex-gold"
              aria-hidden
            >
              {String(s.order).padStart(2, "0")}
            </span>
            <h3 className="font-display text-lg font-semibold text-codex-text">
              {s.title}
            </h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-codex-secondary">
            {s.description}
          </p>
          <p className="mt-2 font-mono text-xs text-codex-muted">
            Tools: {s.prerequisiteTools.join(", ")}
          </p>
          {s.warningNote ? (
            <p className="mt-2 border-l-2 border-codex-gold/60 pl-3 text-sm text-codex-text">
              <span className="font-mono text-[10px] uppercase tracking-wide text-codex-gold">
                Warning —{" "}
              </span>
              {s.warningNote}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
