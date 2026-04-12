import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Technology } from "../../types/technology";
import {
  directUnlocks,
  shortestPrerequisitePath,
  unlocksWithinSteps,
} from "../../utils/pathfinder";

interface Props {
  technologies: Technology[];
}

export function PathFinderPanel({ technologies }: Props) {
  const sorted = useMemo(
    () => [...technologies].sort((a, b) => a.name.localeCompare(b.name)),
    [technologies]
  );
  const ids = useMemo(() => sorted.map((t) => t.id), [sorted]);
  const defaultFrom = useMemo(
    () => sorted.find((t) => t.id === "fire")?.id ?? ids[0] ?? "",
    [sorted, ids]
  );
  const defaultTo = useMemo(
    () =>
      sorted.find((t) => t.id === "internet-protocols-and-web")?.id ??
      ids[ids.length - 1] ??
      "",
    [sorted, ids]
  );
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  useEffect(() => {
    setFrom(defaultFrom);
    setTo(defaultTo);
  }, [defaultFrom, defaultTo]);
  const [path, setPath] = useState<string[] | null>(null);
  const [ownedSel, setOwnedSel] = useState<Set<string>>(() => new Set());

  const pathTechs = useMemo(() => {
    if (!path) return [];
    return path.map((id) => sorted.find((t) => t.id === id)).filter(Boolean) as Technology[];
  }, [path, sorted]);

  const direct = useMemo(
    () => directUnlocks(technologies, ownedSel),
    [technologies, ownedSel]
  );
  const twoStep = useMemo(
    () => unlocksWithinSteps(technologies, ownedSel, 2),
    [technologies, ownedSel]
  );

  const findPath = () => {
    const p = shortestPrerequisitePath(technologies, from, to);
    setPath(p);
  };

  const toggleOwned = (id: string) => {
    setOwnedSel((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <div className="rounded-lg border border-codex-border bg-codex-card p-4">
      <h2 className="font-display text-lg font-semibold text-codex-text">
        Pathfinder
      </h2>
      <p className="mt-1 text-xs text-codex-secondary">
        Shortest prerequisite chain between two technologies (each step unlocks the next).
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-codex-muted">
          From
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded border border-codex-border bg-codex-bg px-2 py-2 text-sm text-codex-text"
          >
            {sorted.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-codex-muted">
          To
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded border border-codex-border bg-codex-bg px-2 py-2 text-sm text-codex-text"
          >
            {sorted.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        onClick={findPath}
        className="mt-3 w-full rounded border border-codex-gold/60 bg-codex-surface py-2 text-sm font-medium text-codex-gold hover:bg-codex-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-gold"
      >
        Find path
      </button>
      {path === null ? null : path.length === 0 ? (
        <p className="mt-3 text-sm text-codex-muted">No path found.</p>
      ) : (
        <div className="mt-4 rounded border border-codex-border bg-codex-bg p-3">
          <p className="font-mono text-[10px] uppercase text-codex-muted">
            {path.length - 1} step{path.length === 2 ? "" : "s"} · complexity sum D
            {pathTechs.reduce((s, t) => s + t.difficulty, 0)}
          </p>
          <ol className="mt-3 space-y-2">
            {pathTechs.map((t, i) => (
              <li key={t.id} className="text-sm">
                <Link
                  to={`/tech/${t.id}`}
                  className="font-medium text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
                >
                  {t.name}
                </Link>
                {i < pathTechs.length - 1 ? (
                  <span className="mt-1 block text-xs text-codex-muted">↓ enables</span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}

      <h3 className="mt-8 font-display text-base font-semibold text-codex-text">
        What can I build?
      </h3>
      <p className="mt-1 text-xs text-codex-secondary">
        Select technologies you already have; see direct unlocks and items within two steps.
      </p>
      <div className="mt-3 max-h-40 overflow-y-auto rounded border border-codex-border p-2">
        <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {sorted.slice(0, 80).map((t) => (
            <li key={t.id}>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-codex-secondary">
                <input
                  type="checkbox"
                  checked={ownedSel.has(t.id)}
                  onChange={() => toggleOwned(t.id)}
                  className="accent-codex-gold"
                />
                <span className="truncate">{t.name}</span>
              </label>
            </li>
          ))}
        </ul>
        {sorted.length > 80 ? (
          <p className="mt-2 text-[10px] text-codex-muted">
            Showing first 80 for performance — refine with search on the tree page filters.
          </p>
        ) : null}
      </div>
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-codex-text">Directly unlocked</h4>
        <ul className="mt-1 space-y-1 text-sm text-codex-blue">
          {direct.length ? (
            direct.map((t) => (
              <li key={t.id}>
                <Link to={`/tech/${t.id}`} className="hover:underline">
                  {t.name}
                </Link>
              </li>
            ))
          ) : (
            <li className="text-codex-muted">None with current selection.</li>
          )}
        </ul>
      </div>
      <div className="mt-3">
        <h4 className="text-xs font-semibold text-codex-text">Within 2 steps</h4>
        <ul className="mt-1 space-y-1 text-sm text-codex-secondary">
          {twoStep.length ? (
            twoStep.map(({ tech: t, steps }) => (
              <li key={t.id}>
                <Link to={`/tech/${t.id}`} className="text-codex-blue hover:underline">
                  {t.name}
                </Link>
                <span className="ml-2 text-xs text-codex-muted">({steps} steps)</span>
              </li>
            ))
          ) : (
            <li className="text-codex-muted">None with current selection.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
