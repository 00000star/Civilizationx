import type { Component } from "../../types/technology";

interface Props {
  component: Component;
}

export function ComponentCard({ component }: Props) {
  return (
    <article className="rounded-lg border border-codex-border bg-codex-card p-4">
      <h3 className="font-display text-base font-semibold text-codex-text">
        {component.name}
      </h3>
      <dl className="mt-2 space-y-2 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
            Function
          </dt>
          <dd className="text-codex-secondary">{component.function}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
            Position
          </dt>
          <dd className="text-codex-secondary">{component.position}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">
            Made from
          </dt>
          <dd className="text-codex-secondary">{component.madeFrom}</dd>
        </div>
        {component.criticalNote ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-codex-gold">
              Critical note
            </dt>
            <dd className="text-codex-text">{component.criticalNote}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
