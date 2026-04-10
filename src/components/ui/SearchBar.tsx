import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  initial?: string;
  compact?: boolean;
}

export function SearchBar({ initial = "", compact }: Props) {
  const [q, setQ] = useState(initial);
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <form
      onSubmit={submit}
      className={compact ? "w-full max-w-xl" : "w-full max-w-2xl"}
      role="search"
      aria-label="Search technologies"
    >
      <label className="sr-only" htmlFor="codex-search">
        Search technologies
      </label>
      <div className="flex gap-2">
        <input
          id="codex-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, tagline, or id…"
          className="min-w-0 flex-1 rounded-md border border-codex-border bg-codex-surface px-3 py-2 text-sm text-codex-text placeholder:text-codex-muted focus:border-codex-gold focus:outline-none focus:ring-1 focus:ring-codex-gold"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md border border-codex-gold/60 bg-codex-card px-4 py-2 text-sm font-medium text-codex-gold hover:bg-codex-border/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-gold"
        >
          Search
        </button>
      </div>
    </form>
  );
}
