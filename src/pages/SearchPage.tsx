import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SearchBar } from "../components/ui/SearchBar";
import { searchTechnologies } from "../utils/search";
import { loadAllTechnologies } from "../data/loadTechnologies";
import { CATEGORY_LABEL } from "../utils/categoryMeta";

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const all = useMemo(() => loadAllTechnologies(), []);
  const results = useMemo(() => searchTechnologies(all, q), [all, q]);

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-codex-text">
        Search
      </h1>
      <p className="mt-2 text-sm text-codex-secondary">
        Filter the archive by name, id, tagline, category, era, or overview text.
      </p>
      <div className="mt-6 max-w-xl">
        <SearchBar initial={q} />
      </div>

      <p className="mt-6 font-mono text-xs text-codex-muted">
        {results.length} result{results.length === 1 ? "" : "s"}
        {q ? ` for “${q}”` : ""}
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {results.map((t) => (
          <li key={t.id}>
            <Link
              to={`/tech/${t.id}`}
              className="block h-full rounded-lg border border-codex-border bg-codex-card p-4 hover:border-codex-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              <p className="font-display text-lg font-semibold text-codex-text">
                {t.name}
              </p>
              <p className="mt-1 text-sm text-codex-secondary">{t.tagline}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-codex-muted">
                {CATEGORY_LABEL[t.category]} ·{" "}
                {t.era.replaceAll("-", " ")} · D{t.difficulty}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
