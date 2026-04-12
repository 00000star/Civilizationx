import type { Technology } from "../types/technology";

export type SearchMatchedField =
  | "id"
  | "name"
  | "tagline"
  | "category"
  | "era"
  | "overview"
  | "problem"
  | "impact"
  | "components"
  | "rawMaterials"
  | "buildSteps"
  | "history"
  | "inventors"
  | "principles"
  | "verification.sources";

export interface SearchResult {
  tech: Technology;
  matchedFields: SearchMatchedField[];
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

function pushField(
  set: Set<SearchMatchedField>,
  field: SearchMatchedField,
  haystack: string,
  q: string
): void {
  if (haystack && norm(haystack).includes(q)) set.add(field);
}

export function searchTechnologies(
  items: Technology[],
  query: string
): SearchResult[] {
  const q = norm(query);
  if (!q) {
    return items.map((tech) => ({ tech, matchedFields: [] as SearchMatchedField[] }));
  }

  const out: SearchResult[] = [];

  for (const t of items) {
    const matched = new Set<SearchMatchedField>();

    pushField(matched, "id", t.id, q);
    pushField(matched, "name", t.name, q);
    pushField(matched, "tagline", t.tagline, q);
    pushField(matched, "category", t.category, q);
    pushField(matched, "era", t.era, q);
    pushField(matched, "overview", t.overview, q);
    pushField(matched, "problem", t.problem, q);
    pushField(matched, "impact", t.impact, q);

    for (const p of t.principles) {
      if (norm(p.name).includes(q) || norm(p.explanation).includes(q)) {
        matched.add("principles");
        break;
      }
    }

    for (const c of t.components) {
      const blob = `${c.name} ${c.function} ${c.position} ${c.madeFrom} ${c.criticalNote ?? ""}`;
      if (norm(blob).includes(q)) {
        matched.add("components");
        break;
      }
    }

    for (const r of t.rawMaterials) {
      const blob = `${r.name} ${r.purpose} ${(r.spaceAlternatives ?? "")} ${r.processingRequired} ${r.earthLocations.join(" ")}`;
      if (norm(blob).includes(q)) {
        matched.add("rawMaterials");
        break;
      }
    }

    for (const b of t.buildSteps) {
      const blob = `${b.title} ${b.description} ${(b.warningNote ?? "")} ${b.prerequisiteTools.join(" ")}`;
      if (norm(blob).includes(q)) {
        matched.add("buildSteps");
        break;
      }
    }

    for (const h of t.history) {
      const blob = `${String(h.year)} ${h.event} ${h.location} ${h.person ?? ""}`;
      if (norm(blob).includes(q)) {
        matched.add("history");
        break;
      }
    }

    for (const inv of t.inventors) {
      const blob = `${inv.name} ${inv.contribution} ${inv.years} ${inv.nationality}`;
      if (norm(blob).includes(q)) {
        matched.add("inventors");
        break;
      }
    }

    for (const s of t.verification.sources) {
      const blob = `${s.title} ${s.note ?? ""} ${s.url ?? ""} ${s.type}`;
      if (norm(blob).includes(q)) {
        matched.add("verification.sources");
        break;
      }
    }

    if (matched.size > 0) {
      out.push({
        tech: t,
        matchedFields: Array.from(matched).sort() as SearchMatchedField[],
      });
    }
  }

  return out;
}

export function fieldLabel(f: SearchMatchedField): string {
  switch (f) {
    case "verification.sources":
      return "sources";
    case "buildSteps":
      return "build steps";
    case "rawMaterials":
      return "raw materials";
    default:
      return f;
  }
}
