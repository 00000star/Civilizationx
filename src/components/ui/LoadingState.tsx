interface Props {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: Props) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-codex-secondary"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-codex-border border-t-codex-gold"
        aria-hidden
      />
      <p className="font-mono text-sm">{label}</p>
    </div>
  );
}
