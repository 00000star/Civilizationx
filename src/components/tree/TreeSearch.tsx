import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { TechnologySummary } from "../../types/technology";

interface Props {
  technologies: TechnologySummary[];
}

export function TreeSearch({ technologies }: Props) {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const search = q.toLowerCase();
    return technologies
      .filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.tagline.toLowerCase().includes(search)
      )
      .slice(0, 10);
  }, [q, technologies]);

  const select = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("node", id);
    setParams(next);
    setQ("");
    setIsOpen(false);
  };

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Jump to technology..."
          className="w-full rounded-md border border-codex-border bg-codex-surface px-3 py-2 text-sm text-codex-text focus:border-codex-gold focus:outline-none focus:ring-1 focus:ring-codex-gold"
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 z-[60] mt-1 w-full rounded-lg border border-codex-border bg-codex-card/95 shadow-2xl backdrop-blur-xl max-h-64 overflow-y-auto">
          {results.map((t) => (
            <button
              key={t.id}
              onClick={() => select(t.id)}
              className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
            >
              <p className="font-display text-sm font-semibold text-codex-text">{t.name}</p>
              <p className="text-[10px] text-codex-muted truncate uppercase tracking-wide">{t.category} · {t.era.replaceAll("-", " ")}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
