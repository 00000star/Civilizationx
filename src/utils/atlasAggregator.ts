import type { Technology } from "../types/technology";

export type AtlasMaterial = {
  key: string;
  name: string;
  purpose: string;
  earthLocations: string[];
  spaceAlternatives: string;
  processingRequired: string;
  techIds: string[];
  techNames: string[];
  count: number;
  critical: boolean;
  hazardous: boolean;
  spaceAvailable: boolean;
  earthOnly: boolean;
};

const HAZARD = /\b(toxic|corrosive|acid|alkali|flammable|radiation|poison|fume)\b/i;

function normKey(name: string): string {
  return name.trim().toLowerCase();
}

export function aggregateRawMaterials(technologies: Technology[]): AtlasMaterial[] {
  const map = new Map<string, AtlasMaterial>();

  for (const tech of technologies) {
    for (const m of tech.rawMaterials) {
      const key = normKey(m.name);
      const existing = map.get(key);
      const spaceAlt = (m.spaceAlternatives ?? "").trim();
      const earthOnly =
        spaceAlt.length > 0 &&
        /\b(no practical|no substitute|none for|earth-only|terrestrial only|cannot)\b/i.test(
          spaceAlt
        );

      if (existing) {
        existing.techIds.push(tech.id);
        existing.techNames.push(tech.name);
        existing.count = existing.techIds.length;
        const locs = new Set([...existing.earthLocations, ...m.earthLocations]);
        existing.earthLocations = [...locs];
        if (HAZARD.test(m.processingRequired)) existing.hazardous = true;
        if (spaceAlt && !existing.spaceAlternatives.includes(spaceAlt)) {
          existing.spaceAlternatives = [existing.spaceAlternatives, spaceAlt]
            .filter(Boolean)
            .join(" · ");
        }
        if (m.processingRequired && m.processingRequired !== existing.processingRequired) {
          existing.processingRequired = `${existing.processingRequired}\n\n— ${tech.name}: ${m.processingRequired}`;
        }
        const sa = (existing.spaceAlternatives ?? "").trim();
        existing.spaceAvailable =
          sa.length >= 20 &&
          !/\b(no practical|no substitute|earth-only|terrestrial only|cannot)\b/i.test(sa);
        existing.earthOnly = !existing.spaceAvailable && sa.length > 0;
      } else {
        map.set(key, {
          key,
          name: m.name,
          purpose: m.purpose,
          earthLocations: [...m.earthLocations],
          spaceAlternatives: spaceAlt,
          processingRequired: m.processingRequired,
          techIds: [tech.id],
          techNames: [tech.name],
          count: 1,
          critical: false,
          hazardous: HAZARD.test(m.processingRequired),
          spaceAvailable: spaceAlt.length > 0 && !earthOnly,
          earthOnly,
        });
      }
    }
  }

  for (const v of map.values()) {
    v.critical = v.count >= 3;
    v.hazardous = HAZARD.test(v.processingRequired) || v.techIds.some((id) => {
      const t = technologies.find((x) => x.id === id);
      return t?.rawMaterials.some((rm) => normKey(rm.name) === v.key && HAZARD.test(rm.processingRequired));
    });
  }

  return [...map.values()];
}
