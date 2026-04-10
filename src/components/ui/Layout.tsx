import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
    isActive ? "text-codex-gold" : "text-codex-secondary hover:text-codex-text"
  }`;

export function Layout({ children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-codex-border bg-codex-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-display text-lg font-semibold tracking-tight text-codex-text hover:text-codex-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
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
          </div>
          <p className="hidden max-w-md text-xs leading-snug text-codex-muted md:block">
            Everything humanity knows. Everything humanity built. Nothing forgotten.
          </p>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-codex-border bg-codex-surface px-3 py-4 text-center text-[11px] text-codex-muted md:px-6">
        <p>
          Static data — verify before rebuilding civilisation. Entries are marked{" "}
          <span className="font-mono text-codex-secondary">verified: false</span> until reviewed.
        </p>
      </footer>
    </div>
  );
}
