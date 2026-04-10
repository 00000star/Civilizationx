import type { RawMaterial } from "../../types/technology";

interface Props {
  materials: RawMaterial[];
}

export function LocationMap({ materials }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-codex-secondary">
        Phase 3 will add an interactive world map. For now, deposits are listed by
        material — cross-check with local geology before prospecting.
      </p>
      <ul className="space-y-4">
        {materials.map((m) => (
          <li
            key={m.name}
            className="rounded-lg border border-codex-border bg-codex-card p-4"
          >
            <h3 className="font-display text-lg font-semibold text-codex-text">
              {m.name}
            </h3>
            <p className="mt-1 text-sm text-codex-secondary">{m.purpose}</p>
            <div className="mt-3">
              <h4 className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
                Earth locations
              </h4>
              <ul className="mt-1 list-inside list-disc text-sm text-codex-text">
                {m.earthLocations.map((loc) => (
                  <li key={loc}>{loc}</li>
                ))}
              </ul>
            </div>
            {m.spaceAlternatives ? (
              <div className="mt-3 border-t border-codex-border pt-3">
                <h4 className="font-mono text-[10px] uppercase tracking-wide text-codex-blue">
                  Space alternatives
                </h4>
                <p className="mt-1 text-sm text-codex-secondary">
                  {m.spaceAlternatives}
                </p>
              </div>
            ) : null}
            <div className="mt-3">
              <h4 className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
                Processing
              </h4>
              <p className="mt-1 text-sm text-codex-secondary">
                {m.processingRequired}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
