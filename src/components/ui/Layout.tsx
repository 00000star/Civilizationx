import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useCodexMode } from "../../context/useCodexMode";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { CodexCacheBadge } from "./CodexCacheBadge";

const INSTALL_DISMISS_KEY = "codex-pwa-install-dismissed";

export function Layout() {
  const { setMode, isSpace } = useCodexMode();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [online, setOnline] = useState(
    () => (typeof navigator !== "undefined" ? navigator.onLine : true)
  );
  const [deferred, setDeferred] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  } | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [swUpdate, setSwUpdate] = useState(false);

  const tagline = isSpace
    ? "The knowledge to build civilisation. Anywhere."
    : "Everything humanity knows. Everything humanity built. Nothing forgotten.";

  const navCls = ({ isActive }: { isActive: boolean }) => {
    const accent = isSpace ? "text-codex-space" : "text-codex-gold";
    return `rounded px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
      isActive ? `${accent} underline decoration-2 underline-offset-4` : "text-codex-secondary hover:text-codex-text"
    }`;
  };

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

  useEffect(() => {
    const onNeed = () => setSwUpdate(true);
    window.addEventListener("codex-pwa-need-refresh", onNeed);
    return () => window.removeEventListener("codex-pwa-need-refresh", onNeed);
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

  const applyUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  const bottomActive = (path: string) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  return (
    <div className="codex-app-shell flex min-h-dvh flex-col">
      <header
        className={`sticky top-0 z-30 border-b border-codex-border bg-codex-bg/90 backdrop-blur-md print:hidden ${isSpace ? "border-codex-space/30" : ""}`}
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Link
              to="/"
              className={`rounded-sm font-display text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                isSpace ? "text-codex-space hover:text-codex-space" : "text-codex-text hover:text-codex-gold"
              }`}
            >
              The Codex
            </Link>
            <div className="flex items-center gap-1 rounded border border-codex-border bg-codex-surface px-1 py-0.5">
              <button
                type="button"
                onClick={() => setMode("earth")}
                className={`rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                  !isSpace ? "bg-codex-card text-codex-gold" : "text-codex-muted"
                }`}
                aria-pressed={!isSpace}
              >
                Earth
              </button>
              <button
                type="button"
                onClick={() => setMode("space")}
                className={`rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                  isSpace ? "bg-codex-card text-codex-space" : "text-codex-muted"
                }`}
                aria-pressed={isSpace}
              >
                Space
              </button>
            </div>
            <nav className="hidden flex-wrap items-center gap-1 lg:flex" aria-label="Primary">
              <NavLink to="/" className={navCls} end>
                Tree
              </NavLink>
              <NavLink to="/survive" className={navCls}>
                Survive
              </NavLink>
              <NavLink to="/foundations" className={navCls}>
                Foundations
              </NavLink>
              <NavLink to="/pathfinder" className={navCls}>
                Pathfinder
              </NavLink>
              <NavLink to="/search" className={navCls}>
                Search
              </NavLink>
              <NavLink to="/atlas" className={navCls}>
                Atlas
              </NavLink>
              <NavLink to="/status" className={navCls}>
                Status
              </NavLink>
              <NavLink to="/contribute" className={navCls}>
                Contribute
              </NavLink>
              <NavLink to="/about" className={navCls}>
                About
              </NavLink>
            </nav>
            <div
              className="ml-auto flex flex-wrap items-center justify-end gap-2 text-xs text-codex-muted lg:ml-0"
              role="status"
              aria-live="polite"
            >
              <CodexCacheBadge />
              <span
                className={`inline-block h-2 w-2 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500"}`}
                aria-hidden
              />
              <span className="hidden sm:inline">
                {online ? "Online" : "Offline — cached data"}
              </span>
            </div>
          </div>
          <p className="hidden max-w-md text-xs leading-snug text-codex-muted md:block">{tagline}</p>
        </div>
      </header>

      <main
        className={`flex min-h-0 flex-1 flex-col ${isMobile ? "pb-[calc(56px+env(safe-area-inset-bottom,0px))]" : ""}`}
      >
        <Outlet />
      </main>

      <footer className="hidden border-t border-codex-border bg-codex-surface px-3 py-4 text-center text-[11px] text-codex-muted print:hidden md:block md:px-6">
        <p>
          Static data — verify before rebuilding civilisation. Entries use verification status;
          treat unverified material as provisional.
        </p>
      </footer>

      {isMobile ? (
        <>
          {!online ? (
            <div
              className="fixed bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-amber-600/50 bg-amber-950/90 px-3 py-1 text-center text-[11px] text-amber-100 print:hidden"
              role="status"
            >
              Offline — showing cached content
            </div>
          ) : null}
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-stretch border-t border-codex-border bg-codex-surface pb-[env(safe-area-inset-bottom,0px)] print:hidden"
            aria-label="Mobile primary"
          >
            <Link
              to="/"
              className={`flex flex-1 flex-col items-center justify-center text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-codex-blue ${
                bottomActive("/") && location.pathname !== "/survive"
                  ? isSpace
                    ? "text-codex-space underline decoration-2 underline-offset-4"
                    : "text-codex-gold underline decoration-2 underline-offset-4"
                  : "text-codex-secondary"
              }`}
              aria-current={location.pathname === "/" ? "page" : undefined}
            >
              <span className="text-base" aria-hidden>
                🌳
              </span>
              Tree
            </Link>
            <Link
              to="/survive"
              className={`flex flex-1 flex-col items-center justify-center text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-codex-blue ${
                bottomActive("/survive")
                  ? isSpace
                    ? "text-codex-space underline decoration-2 underline-offset-4"
                    : "text-codex-gold underline decoration-2 underline-offset-4"
                  : "text-codex-secondary"
              }`}
              aria-current={location.pathname === "/survive" ? "page" : undefined}
            >
              <span className="text-base" aria-hidden>
                ⚠️
              </span>
              Survive
            </Link>
            <Link
              to="/search"
              className={`flex flex-1 flex-col items-center justify-center text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-codex-blue ${
                bottomActive("/search")
                  ? isSpace
                    ? "text-codex-space underline decoration-2 underline-offset-4"
                    : "text-codex-gold underline decoration-2 underline-offset-4"
                  : "text-codex-secondary"
              }`}
              aria-current={location.pathname === "/search" ? "page" : undefined}
            >
              <span className="text-base" aria-hidden>
                🔍
              </span>
              Search
            </Link>
            <Link
              to="/status"
              className={`flex flex-1 flex-col items-center justify-center text-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-codex-blue ${
                bottomActive("/status")
                  ? isSpace
                    ? "text-codex-space underline decoration-2 underline-offset-4"
                    : "text-codex-gold underline decoration-2 underline-offset-4"
                  : "text-codex-secondary"
              }`}
              aria-current={location.pathname === "/status" ? "page" : undefined}
            >
              <span className="text-base" aria-hidden>
                📊
              </span>
              Status
            </Link>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex flex-1 flex-col items-center justify-center text-[10px] text-codex-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-codex-blue"
              aria-expanded={moreOpen}
            >
              <span className="text-base" aria-hidden>
                ☰
              </span>
              More
            </button>
          </nav>
          {moreOpen ? (
            <div
              className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/70 print:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="More navigation"
            >
              <div className="rounded-t-lg border border-codex-border bg-codex-surface p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-display text-sm font-semibold text-codex-text">More</span>
                  <button
                    type="button"
                    onClick={() => setMoreOpen(false)}
                    className="rounded border border-codex-border px-2 py-1 text-xs text-codex-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                  >
                    Close
                  </button>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/foundations"
                      onClick={() => setMoreOpen(false)}
                      className="block rounded px-2 py-2 text-codex-text hover:bg-codex-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                    >
                      Foundations
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/pathfinder"
                      onClick={() => setMoreOpen(false)}
                      className="block rounded px-2 py-2 text-codex-text hover:bg-codex-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                    >
                      Pathfinder
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/atlas"
                      onClick={() => setMoreOpen(false)}
                      className="block rounded px-2 py-2 text-codex-text hover:bg-codex-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                    >
                      Atlas
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contribute"
                      onClick={() => setMoreOpen(false)}
                      className="block rounded px-2 py-2 text-codex-text hover:bg-codex-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                    >
                      Contribute
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      onClick={() => setMoreOpen(false)}
                      className="block rounded px-2 py-2 text-codex-text hover:bg-codex-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                    >
                      About
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {showInstall && deferred ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-codex-border bg-codex-surface/95 p-3 shadow-lg print:hidden md:bottom-auto md:left-auto md:right-4 md:top-20 md:max-w-sm md:rounded-lg md:border md:px-4"
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

      {swUpdate ? (
        <div className="fixed left-0 right-0 top-16 z-40 border-b border-codex-border bg-codex-surface/95 px-3 py-2 text-center text-xs text-codex-secondary print:hidden md:top-20">
          A new version of The Codex is available.{" "}
          <button
            type="button"
            onClick={applyUpdate}
            className="ml-2 rounded border border-codex-blue px-2 py-0.5 text-codex-blue hover:bg-codex-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
          >
            Update now
          </button>
        </div>
      ) : null}
    </div>
  );
}
