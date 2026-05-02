import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");
const outPath = join(root, "src", "data", "summaries.json");

const files = readdirSync(techDir).filter((f) => f.endsWith(".json")).sort();

function hasMeaningfulSpaceAlternatives(material) {
  const value = (material.spaceAlternatives ?? "").trim();
  if (value.length < 20) return false;
  return !/\b(no practical|no substitute|earth-only|terrestrial only|cannot improvise)\b/i.test(value);
}

function hasEarthOnlyMaterial(material) {
  const value = (material.spaceAlternatives ?? "").trim();
  if (!value) return true;
  return /\b(no practical|no substitute|earth-only|terrestrial only|cannot)\b/i.test(value);
}

const summaries = files
  .map((file) => JSON.parse(readFileSync(join(techDir, file), "utf8")))
  .map((tech) => ({
    id: tech.id,
    name: tech.name,
    tagline: tech.tagline,
    category: tech.category,
    era: tech.era,
    difficulty: tech.difficulty,
    prerequisites: tech.prerequisites,
    unlocks: tech.unlocks,
    verification: {
      status: tech.verification.status,
    },
    spaceReadiness: {
      fullAlternatives:
        tech.rawMaterials.length > 0 && tech.rawMaterials.every((material) => hasMeaningfulSpaceAlternatives(material)),
      earthOnly: tech.rawMaterials.some((material) => hasEarthOnlyMaterial(material)),
    },
    maturity: tech.maturity,
    lastUpdated: tech.lastUpdated,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(outPath, `${JSON.stringify(summaries, null, 2)}\n`);
console.log(`OK - wrote ${summaries.length} summaries to src/data/summaries.json`);
