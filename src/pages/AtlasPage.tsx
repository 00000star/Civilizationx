import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LoadingState } from "../components/ui/LoadingState";
import { useTechnologies } from "../hooks/useTechnologies";
import { aggregateRawMaterials, type AtlasMaterial } from "../utils/atlasAggregator";

type Filter = "all" | "critical" | "hazardous" | "space" | "earth";
type Sort = "alpha" | "used" | "critical";

export function AtlasPage() {
  const { technologies: all, loading } = useTechnologies();
  const materials = useMemo(() => aggregateRawMaterials(all), [all]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("alpha");

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    let list = materials;
    if (nq) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(nq) ||
          m.purpose.toLowerCase().includes(nq) ||
          m.processingRequired.toLowerCase().includes(nq)
      );
    }
    if (filter === "critical") list = list.filter((m) => m.critical);
    if (filter === "hazardous") list = list.filter((m) => m.hazardous);
    if (filter === "space") list = list.filter((m) => m.spaceAvailable);
    if (filter === "earth") list = list.filter((m) => m.earthOnly);
    const out = [...list];
    if (sort === "alpha") out.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "used") out.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    if (sort === "critical") {
      out.sort((a, b) => Number(b.critical) - Number(a.critical) || b.count - a.count);
    }
    return out;
  }, [materials, q, filter, sort]);

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "critical", label: "Critical (3+)" },
    { id: "hazardous", label: "Hazardous" },
    { id: "space", label: "Space-available" },
    { id: "earth", label: "Earth-only" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 md:px-6">
      <h1 className="font-display text-3xl font-bold text-codex-text">Raw Material Atlas</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-codex-secondary">
        Every material needed to rebuild civilisation. Where to find it. How to process it. What it builds. Data is
        aggregated live from all technology entries — no duplicate catalogue.
      </p>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="block max-w-xl flex-1 text-xs text-codex-muted">
          Search materials
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1 w-full rounded border border-codex-border bg-codex-surface px-3 py-2 text-sm text-codex-text focus:border-codex-gold focus:outline-none focus:ring-1 focus:ring-codex-gold"
            autoComplete="off"
          />
        </label>
        <div>
          <span className="text-xs text-codex-muted">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="mt-1 block w-full rounded border border-codex-border bg-codex-bg px-2 py-2 text-sm text-codex-text md:w-48"
          >
            <option value="alpha">Alphabetical</option>
            <option value="used">Most used</option>
            <option value="critical">Critical first</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
              filter === c.id
                ? "border-codex-gold bg-codex-gold/15 text-codex-gold"
                : "border-codex-border text-codex-secondary hover:border-codex-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-4 font-mono text-xs text-codex-muted">
        {filtered.length} material{filtered.length === 1 ? "" : "s"}
        {q ? ` matching “${q}”` : ""}
      </p>

      {loading ? (
        <LoadingState label="Loading material atlas..." />
      ) : (
        <ul className="mt-6 space-y-4">
          {filtered.map((m) => (
            <AtlasCard key={m.key} m={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AtlasCard({ m }: { m: AtlasMaterial }) {
  return (
    <li className="rounded-lg border border-codex-border bg-codex-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-codex-text">{m.name}</h2>
        <div className="flex flex-wrap gap-2">
          {m.critical ? (
            <span className="rounded border border-amber-500/60 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-200">
              Critical
            </span>
          ) : null}
          {m.hazardous ? (
            <span className="rounded border border-red-500/60 px-2 py-0.5 font-mono text-[10px] uppercase text-red-200">
              Hazardous
            </span>
          ) : null}
          <span className="rounded border border-codex-border px-2 py-0.5 font-mono text-[10px] uppercase text-codex-muted">
            {m.count} uses
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-codex-secondary">{m.purpose}</p>
      <div className="mt-4">
        <h3 className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">Earth locations</h3>
        <ul className="mt-1 list-disc pl-5 text-sm text-codex-text">
          {m.earthLocations.map((loc) => (
            <li key={loc}>{loc}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 border-t border-codex-border pt-4">
        <h3 className="font-mono text-[10px] uppercase tracking-wide text-codex-blue">Space alternative</h3>
        <p className="mt-1 text-sm text-codex-secondary">{m.spaceAlternatives || "Not specified in source entries."}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">Processing</h3>
        <p className="mt-1 whitespace-pre-wrap text-sm text-codex-secondary">{m.processingRequired}</p>
      </div>
      <div className="mt-4">
        <h3 className="font-mono text-[10px] uppercase tracking-wide text-codex-muted">Used by</h3>
        <p className="mt-2 flex flex-wrap gap-2 text-sm">
          {m.techIds.slice(0, 8).map((id, i) => (
            <Link
              key={id}
              to={`/tech/${id}`}
              className="rounded border border-codex-border px-2 py-0.5 text-codex-blue hover:border-codex-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              {m.techNames[i]}
            </Link>
          ))}
          {m.techIds.length > 8 ? (
            <span className="text-codex-muted">+{m.techIds.length - 8} more</span>
          ) : null}
        </p>
      </div>
    </li>
  );
}
