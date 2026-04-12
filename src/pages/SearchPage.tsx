import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/ui/SearchBar";
import { searchTechnologies } from "../utils/search";
import { VirtualizedSearchResults } from "../components/search/VirtualizedSearchResults";
import { loadAllTechnologies } from "../data/loadTechnologies";
import { TECH_TREE_ERAS } from "../utils/eras";
import type { TechEra } from "../types/technology";

type VerificationFilter = "all" | "expert" | "unverified";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const all = useMemo(() => loadAllTechnologies(), []);

  const [diffMin, setDiffMin] = useState(1);
  const [diffMax, setDiffMax] = useState(5);
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("all");
  const [selectedEras, setSelectedEras] = useState<Set<TechEra>>(new Set());

  const rawResults = useMemo(() => searchTechnologies(all, q), [all, q]);

  const filtered = useMemo(() => {
    return rawResults.filter(({ tech }) => {
      if (tech.difficulty < diffMin || tech.difficulty > diffMax) return false;
      if (selectedEras.size > 0 && !selectedEras.has(tech.era)) return false;
      if (verificationFilter === "expert") {
        if (tech.verification.status !== "expert-verified") return false;
      }
      if (verificationFilter === "unverified") {
        if (tech.verification.status !== "unverified") return false;
      }
      return true;
    });
  }, [rawResults, diffMin, diffMax, selectedEras, verificationFilter]);

  const setQuery = useCallback(
    (next: string) => {
      const p = new URLSearchParams(params);
      if (next) p.set("q", next);
      else p.delete("q");
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

  const toggleEra = useCallback((era: TechEra) => {
    setSelectedEras((prev) => {
      const n = new Set(prev);
      if (n.has(era)) n.delete(era);
      else n.add(era);
      return n;
    });
  }, []);

  const clearEras = useCallback(() => setSelectedEras(new Set()), []);

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-codex-text">
        Search
      </h1>
      <p className="mt-2 text-sm text-codex-secondary">
        Search across names, narratives, components, materials, build steps, history,
        inventors, and recorded sources. Cross-check all results against primary references
        before acting.
      </p>

      <div className="mt-6 max-w-xl">
        <SearchBar initial={q} />
      </div>

      <section className="mt-8 space-y-6 rounded-lg border border-codex-border bg-codex-card p-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-codex-muted">
          Filters
        </h2>

        <div>
          <label className="block text-xs font-medium text-codex-secondary">
            Difficulty ({diffMin}–{diffMax})
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-codex-muted">Minimum</span>
              <input
                type="range"
                min={1}
                max={5}
                value={diffMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDiffMin(v);
                  if (v > diffMax) setDiffMax(v);
                }}
                className="w-40 accent-codex-gold"
                aria-label="Minimum difficulty"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-codex-muted">Maximum</span>
              <input
                type="range"
                min={1}
                max={5}
                value={diffMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDiffMax(v);
                  if (v < diffMin) setDiffMin(v);
                }}
                className="w-40 accent-codex-gold"
                aria-label="Maximum difficulty"
              />
            </div>
          </div>
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-codex-secondary">
            Verification
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {(
              [
                ["all", "All entries"],
                ["expert", "Verified only"],
                ["unverified", "Unverified only"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-codex-secondary"
              >
                <input
                  type="radio"
                  name="verification-filter"
                  checked={verificationFilter === value}
                  onChange={() => setVerificationFilter(value)}
                  className="accent-codex-gold"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-codex-secondary">Era</span>
            {selectedEras.size > 0 ? (
              <button
                type="button"
                onClick={clearEras}
                className="text-xs text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
              >
                Clear eras
              </button>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {TECH_TREE_ERAS.map((e) => {
              const on = selectedEras.has(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleEra(e.id)}
                  aria-pressed={on}
                  className={`rounded-md border px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                    on
                      ? "border-codex-gold bg-codex-gold/10 text-codex-gold"
                      : "border-codex-border text-codex-secondary hover:border-codex-muted"
                  }`}
                >
                  {e.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <p className="mt-6 font-mono text-xs text-codex-muted">
        <span className="text-codex-secondary">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : " (empty query — showing all entries matching filters)"}
        </span>
        <span className="mx-2 text-codex-border">|</span>
        Difficulty {diffMin}–{diffMax}
        <span className="mx-2 text-codex-border">|</span>
        {verificationFilter === "all"
          ? "All verification states"
          : verificationFilter === "expert"
            ? "Expert-verified only"
            : "Unverified only"}
        <span className="mx-2 text-codex-border">|</span>
        {selectedEras.size === 0
          ? "All eras"
          : `Eras: ${Array.from(selectedEras)
              .map((id) => TECH_TREE_ERAS.find((x) => x.id === id)?.label ?? id)
              .join(", ")}`}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-lg border border-codex-border bg-codex-surface p-6 text-sm text-codex-secondary">
          <p className="font-medium text-codex-text">
            No results for {q ? `“${q}”` : "the current filters"}.
          </p>
          <p className="mt-3">
            Try searching for a component, material, or inventor name. Widen the difficulty
            range, clear era filters, or switch verification to “All entries”.
          </p>
          {q ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              Clear search query
            </button>
          ) : null}
        </div>
      ) : (
        <VirtualizedSearchResults results={filtered} query={q} />
      )}
    </div>
  );
}
