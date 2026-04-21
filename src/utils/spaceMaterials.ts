import type { RawMaterial, Technology, TechnologySummary } from "../types/technology";

export function hasMeaningfulSpaceAlternatives(m: RawMaterial): boolean {
  const s = (m.spaceAlternatives ?? "").trim();
  if (s.length < 20) return false;
  if (
    /\b(no practical|no substitute|earth-only|terrestrial only|cannot improvise)\b/i.test(
      s
    )
  ) {
    return false;
  }
  return true;
}

export function techHasFullSpaceAlternatives(tech: Technology | TechnologySummary): boolean {
  if (!tech.rawMaterials.length) return false;
  return tech.rawMaterials.every((m) => hasMeaningfulSpaceAlternatives(m));
}

export function techHasEarthOnlyMaterial(tech: Technology | TechnologySummary): boolean {
  return tech.rawMaterials.some((m) => {
    const s = (m.spaceAlternatives ?? "").trim();
    if (!s) return true;
    return /\b(no practical|no substitute|earth-only|terrestrial only|cannot)\b/i.test(s);
  });
}
