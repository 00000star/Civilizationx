import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/ui/SearchBar";
import { CategoryFilter } from "../components/ui/CategoryFilter";
import { TechTree } from "../components/tree/TechTree";
import { useTechTree } from "../hooks/useTechTree";
import type { TechCategory, TechEra } from "../types/technology";
import { loadAllTechnologies } from "../data/loadTechnologies";

const ERAS: { id: TechEra; label: string }[] = [
  { id: "prehistoric", label: "Prehistoric" },
  { id: "ancient", label: "Ancient" },
  { id: "medieval", label: "Medieval" },
  { id: "early-modern", label: "Early modern" },
  { id: "industrial", label: "Industrial" },
  { id: "early-20th", label: "Early 20th" },
  { id: "mid-20th", label: "Mid 20th" },
  { id: "late-20th", label: "Late 20th" },
  { id: "21st-century", label: "21st c." },
];

export function TreePage() {
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState<TechCategory | null>(null);
  const [era, setEra] = useState<TechEra | null>(null);
  const search = params.get("q") ?? "";

  const filters = useMemo(
    () => ({ category, era, search }),
    [category, era, search]
  );

  const { filtered, positions } = useTechTree(filters);

  const eraSliderMax = ERAS.length;

  const eraSliderIndex = useMemo(() => {
    if (!era) return eraSliderMax;
    const i = ERAS.findIndex((e) => e.id === era);
    return i >= 0 ? i : eraSliderMax;
  }, [era, eraSliderMax]);

  const onEraSlider = (index: number) => {
    if (index >= eraSliderMax) setEra(null);
    else setEra((ERAS[index]?.id as TechEra) ?? null);
  };

  const all = loadAllTechnologies();
  const erasPresent = useMemo(() => {
    const s = new Set(all.map((t) => t.era));
    return ERAS.filter((e) => s.has(e.id));
  }, [all]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-codex-border bg-codex-surface/80 px-3 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <SearchBar compact />
          <div className="flex flex-1 flex-col gap-2 lg:items-end">
            <CategoryFilter value={category} onChange={setCategory} />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setParams({});
                }}
                className="self-end text-xs text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
              >
                Clear search query
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <TechTree technologies={filtered} positions={positions} />

      <div className="pointer-events-auto fixed bottom-4 right-4 z-20 hidden w-56 rounded-lg border border-codex-border bg-codex-surface/95 p-3 shadow-xl backdrop-blur md:block">
        <label
          htmlFor="era-slider"
          className="font-mono text-[10px] uppercase tracking-wide text-codex-muted"
        >
          Era filter
        </label>
        <input
          id="era-slider"
          type="range"
          min={0}
          max={eraSliderMax}
          value={eraSliderIndex}
          onChange={(e) => onEraSlider(Number(e.target.value))}
          className="mt-2 w-full accent-codex-gold"
          aria-valuetext={
            era ? ERAS.find((e) => e.id === era)?.label ?? "All eras" : "All eras"
          }
        />
        <p className="mt-1 text-center text-xs text-codex-secondary">
          {era ? ERAS.find((e) => e.id === era)?.label : "All eras"}
        </p>
        <p className="mt-2 text-[10px] leading-snug text-codex-muted">
          Showing {filtered.length} of {all.length} indexed nodes
          {erasPresent.length ? ` · ${erasPresent.length} eras in data` : ""}.
        </p>
      </div>

      <div className="border-t border-codex-border bg-codex-surface px-3 py-2 md:hidden">
        <label
          htmlFor="era-select"
          className="font-mono text-[10px] uppercase tracking-wide text-codex-muted"
        >
          Era
        </label>
        <select
          id="era-select"
          value={era ?? ""}
          onChange={(e) =>
            setEra((e.target.value as TechEra) || null)
          }
          className="mt-1 w-full rounded border border-codex-border bg-codex-bg px-2 py-2 text-sm text-codex-text"
        >
          <option value="">All eras</option>
          {ERAS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
