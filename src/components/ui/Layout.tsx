import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
}

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
    isActive ? "text-codex-gold" : "text-codex-secondary hover:text-codex-text"
  }`;

const INSTALL_DISMISS_KEY = "codex-pwa-install-dismissed";

export function Layout({ children }: Props) {
  const [online, setOnline] = useState(
    () => (typeof navigator !== "undefined" ? navigator.onLine : true)
  );
  const [deferred, setDeferred] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      const bip = e as unknown as {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: string }>;
      };
      setDeferred(bip);
      try {
        if (sessionStorage.getItem(INSTALL_DISMISS_KEY) === "1") return;
      } catch {
        /* ignore */
      }
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismissInstall = useCallback(() => {
    setShowInstall(false);
    try {
      sessionStorage.setItem(INSTALL_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const runInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setShowInstall(false);
    setDeferred(null);
  }, [deferred]);

  return (
    <div className="codex-app-shell flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-codex-border bg-codex-bg/90 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="rounded-sm font-display text-lg font-semibold tracking-tight text-codex-text hover:text-codex-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              The Codex
            </Link>
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
              <NavLink to="/" className={navCls} end>
                Tree
              </NavLink>
              <NavLink to="/search" className={navCls}>
                Search
              </NavLink>
              <NavLink to="/about" className={navCls}>
                About
              </NavLink>
            </nav>
            <div
              className="flex items-center gap-2 text-xs text-codex-muted"
              role="status"
              aria-live="polite"
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500"}`}
                aria-hidden
              />
              <span>{online ? "Online" : "Offline — cached data"}</span>
            </div>
          </div>
          <p className="hidden max-w-md text-xs leading-snug text-codex-muted md:block">
            Everything humanity knows. Everything humanity built. Nothing forgotten.
          </p>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-codex-border bg-codex-surface px-3 py-4 text-center text-[11px] text-codex-muted print:hidden md:px-6">
        <p>
          Static data — verify before rebuilding civilisation. Entries use a verification status
          (unverified, community-reviewed, or expert-verified); treat unverified material as
          provisional.
        </p>
      </footer>

      {showInstall && deferred ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-codex-border bg-codex-surface/95 p-3 shadow-lg print:hidden md:px-6"
          role="region"
          aria-label="Install application"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-codex-secondary">
              Install The Codex for offline access — works without internet after installation
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={runInstall}
                className="rounded-md border border-codex-gold bg-codex-gold/10 px-3 py-2 text-sm font-medium text-codex-gold hover:bg-codex-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismissInstall}
                className="rounded-md border border-codex-border px-3 py-2 text-sm text-codex-secondary hover:border-codex-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
