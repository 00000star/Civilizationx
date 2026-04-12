import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCodexMode } from "../../context/useCodexMode";

type Props = {
  onDismiss: () => void;
};

export function TreeWelcomeBanner({ onDismiss }: Props) {
  const { isSpace } = useCodexMode();

  const border = isSpace ? "border-codex-space/35" : "border-codex-gold/30";
  const glow = isSpace
    ? "shadow-[0_0_40px_rgba(0,212,255,0.08)]"
    : "shadow-[0_0_48px_rgba(201,168,76,0.1)]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.22 } }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="pointer-events-none absolute left-3 right-3 top-3 z-[15] mx-auto max-w-2xl print:hidden md:left-6 md:right-6 md:top-4"
    >
      <div
        className={`pointer-events-auto relative overflow-hidden rounded-xl border bg-gradient-to-br from-codex-card/95 via-codex-surface/95 to-codex-bg/90 px-4 py-3 backdrop-blur-md md:px-5 md:py-4 ${border} ${glow}`}
      >
        <div
          className={`pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full blur-3xl ${
            isSpace ? "bg-codex-space/18" : "bg-codex-gold/18"
          }`}
        />
        <div className="relative flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
          <div>
            <p className="font-display text-base font-semibold tracking-tight text-codex-text md:text-lg">
              Welcome to the dependency tree
            </p>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-codex-secondary md:text-sm">
              Pan and zoom to explore. Each node is a capability; edges show what had to exist
              first. Hover to trace paths — on phones, double-tap a node to open its entry.
            </p>
            <p className="mt-2 text-[11px] text-codex-muted">
              <Link
                to="/survive"
                className={`font-medium underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm ${
                  isSpace ? "text-codex-space" : "text-codex-gold"
                }`}
              >
                First 90 days guide
              </Link>
              <span className="mx-1.5 text-codex-border">·</span>
              <Link
                to="/search"
                className="font-medium text-codex-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
              >
                Search the Codex
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 self-start rounded-lg border border-codex-border bg-codex-bg/80 px-3 py-1.5 text-xs font-medium text-codex-secondary transition-colors hover:border-codex-muted hover:text-codex-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          >
            Got it
          </button>
        </div>
      </div>
    </motion.div>
  );
}
