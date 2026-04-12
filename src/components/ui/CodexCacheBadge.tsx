/**
 * Shows a stable build id injected at compile time — a practical stand-in for
 * “which precache / app bundle am I running” when debugging offline behaviour.
 */
export function CodexCacheBadge() {
  const id = import.meta.env.VITE_CODEX_BUILD_ID ?? "local";
  const short = id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;

  return (
    <span
      className="inline-flex max-w-[5.5rem] items-center gap-1 truncate rounded border border-codex-border/80 bg-codex-surface/60 px-1 py-0.5 font-mono text-[9px] text-codex-muted sm:max-w-none sm:px-1.5 sm:text-[10px]"
      title={`App bundle id: ${id}. Shown after install so you can confirm updates.`}
    >
      <span className="text-codex-muted/80" aria-hidden>
        build
      </span>
      <span className="max-w-[7rem] truncate text-codex-secondary">{short}</span>
    </span>
  );
}
