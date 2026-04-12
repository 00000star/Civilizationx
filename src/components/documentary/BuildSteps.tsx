import { useCallback, useState } from "react";
import type { BuildStep } from "../../types/technology";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface Props {
  steps: BuildStep[];
}

export function BuildSteps({ steps }: Props) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const isMd = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState<Record<number, boolean>>({});

  const toggle = useCallback((order: number) => {
    setOpen((prev) => ({ ...prev, [order]: !prev[order] }));
  }, []);

  return (
    <ol className="space-y-4">
      {sorted.map((s) => {
        const expanded = isMd || open[s.order];
        return (
          <li
            key={s.order}
            className="rounded-lg border border-codex-border bg-codex-card p-4"
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-xs text-codex-gold" aria-hidden>
                {String(s.order).padStart(2, "0")}
              </span>
              {!isMd ? (
                <button
                  type="button"
                  onClick={() => toggle(s.order)}
                  className="flex-1 text-left font-display text-lg font-semibold text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue md:pointer-events-none"
                  aria-expanded={expanded}
                >
                  {s.title}
                  <span className="ml-2 text-xs font-normal text-codex-muted">
                    {expanded ? "▼" : "▶"}
                  </span>
                </button>
              ) : (
                <h3 className="font-display text-lg font-semibold text-codex-text">
                  {s.title}
                </h3>
              )}
            </div>
            {s.warningNote ? (
              <p className="mt-2 border-l-2 border-codex-gold/60 pl-3 text-sm text-codex-text">
                <span className="font-mono text-[10px] uppercase tracking-wide text-codex-gold">
                  Warning —{" "}
                </span>
                {s.warningNote}
              </p>
            ) : null}
            {expanded ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-codex-secondary">
                  {s.description}
                </p>
                <p className="mt-2 font-mono text-xs text-codex-muted">
                  Tools: {s.prerequisiteTools.join(", ")}
                </p>
              </>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
