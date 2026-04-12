import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";
import { fieldLabel, type SearchResult } from "../../utils/search";
import { useMediaQuery } from "../../hooks/useMediaQuery";

type Props = {
  results: SearchResult[];
  query: string;
  /** Max height of the scroll region (CSS length) */
  maxHeight?: string;
};

function SearchResultCard({ result, query }: { result: SearchResult; query: string }) {
  const { tech, matchedFields } = result;
  const fieldsText =
    query.trim() && matchedFields.length
      ? matchedFields.map(fieldLabel).join(", ")
      : null;

  return (
    <Link
      to={`/tech/${tech.id}`}
      className="block h-full rounded-lg border border-codex-border bg-codex-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-codex-gold/45 hover:shadow-[0_0_0_1px_rgba(201,168,76,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
    >
      <p className="font-display text-lg font-semibold text-codex-text">{tech.name}</p>
      <p className="mt-1 text-sm text-codex-secondary">{tech.tagline}</p>
      {fieldsText ? (
        <p className="mt-2 text-[11px] leading-snug text-codex-muted">Found in: {fieldsText}</p>
      ) : null}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-codex-muted">
        {CATEGORY_LABEL[tech.category]} · {tech.era.replaceAll("-", " ")} · D{tech.difficulty} ·{" "}
        {tech.verification.status.replaceAll("-", " ")}
      </p>
    </Link>
  );
}

/**
 * Windowed list for search hits — keeps DOM small when filters return many rows.
 * Two columns from the `sm` breakpoint up (matches the old grid layout).
 */
export function VirtualizedSearchResults({
  results,
  query,
  maxHeight = "min(72vh, 640px)",
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const twoCols = useMediaQuery("(min-width: 640px)");
  const lanes = twoCols ? 2 : 1;

  const virtualizer = useVirtualizer({
    count: results.length,
    lanes,
    gap: 12,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 156,
    overscan: 8,
  });

  useEffect(() => {
    parentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [query, results.length, lanes]);

  return (
    <div
      ref={parentRef}
      className="mt-4 overflow-y-auto overflow-x-hidden rounded-xl border border-codex-border/80 bg-codex-bg/40 shadow-inner backdrop-blur-[2px]"
      style={{ maxHeight }}
      role="list"
      aria-label="Search results"
    >
      <div
        className="relative w-full p-2 sm:p-3"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((vi) => {
          const row = results[vi.index];
          if (!row) return null;
          const lanePct = 100 / lanes;
          return (
            <div
              key={vi.key}
              data-index={vi.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 box-border px-1 sm:px-1.5"
              style={{
                width: `${lanePct}%`,
                transform: `translateX(${vi.lane * 100}%) translateY(${vi.start}px)`,
              }}
              role="listitem"
            >
              <SearchResultCard result={row} query={query} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
