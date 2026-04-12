import type { RawMaterial } from "../../types/technology";
import { useCodexMode } from "../../context/useCodexMode";

interface Props {
  materials: RawMaterial[];
}

export function LocationMap({ materials }: Props) {
  const { isSpace } = useCodexMode();

  return (
    <div className="space-y-6">
      <p className="text-sm text-codex-secondary">
        Cross-check local geology, regulations, and biosafety before prospecting or processing.
      </p>
      <ul className="space-y-4">
        {materials.map((m) => (
          <li
            key={m.name}
            className={`rounded-lg border border-codex-border bg-codex-card p-4 ${isSpace ? "ring-1 ring-codex-space/40" : ""}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-codex-text">{m.name}</h3>
              {isSpace ? (
                <span className="rounded border border-codex-space px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-codex-space">
                  Space mode
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-codex-secondary">{m.purpose}</p>

            {isSpace && m.spaceAlternatives ? (
              <div className="mt-3">
                <h4 className="font-mono text-[10px] uppercase tracking-wide text-codex-space">
                  Mars / space source
                </h4>
                <p className="mt-1 text-base font-medium leading-relaxed text-codex-text">
                  {m.spaceAlternatives}
                </p>
              </div>
            ) : null}

            <div className={`mt-3 ${isSpace ? "text-xs opacity-80" : ""}`}>
              <h4
                className={`font-mono text-[10px] uppercase tracking-wide ${isSpace ? "text-codex-muted" : "text-codex-muted"}`}
              >
                {isSpace ? "Earth locations (reference)" : "Earth locations"}
              </h4>
              <ul className="mt-1 list-inside list-disc text-sm text-codex-text">
                {m.earthLocations.map((loc) => (
                  <li key={loc}>{loc}</li>
                ))}
              </ul>
            </div>

            {!isSpace && m.spaceAlternatives ? (
              <div className="mt-3 border-t border-codex-border pt-3">
                <h4 className="font-mono text-[10px] uppercase tracking-wide text-codex-blue">
                  Space alternatives
                </h4>
                <p className="mt-1 text-sm text-codex-secondary">{m.spaceAlternatives}</p>
              </div>
            ) : null}

            <div className="mt-3">
              <h4 className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
                Processing
              </h4>
              <p className="mt-1 text-sm text-codex-secondary">{m.processingRequired}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
