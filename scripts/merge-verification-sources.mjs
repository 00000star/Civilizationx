#!/usr/bin/env node
/**
 * Merge scripts/verification_sources_by_id.json into each technology JSON
 * verification.sources array (replaces existing sources with the curated set).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");
const mapPath = join(__dirname, "verification_sources_by_id.json");

const map = JSON.parse(readFileSync(mapPath, "utf8"));
const ids = Object.keys(map);
if (ids.length !== 50) {
  console.error(`Expected 50 ids in map, got ${ids.length}`);
  process.exit(1);
}
for (const id of ids) {
  if (!Array.isArray(map[id]) || map[id].length < 3) {
    console.error(`Invalid sources for ${id}`);
    process.exit(1);
  }
}

const files = readdirSync(techDir).filter((f) => f.endsWith(".json"));
for (const f of files) {
  const path = join(techDir, f);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const id = data.id;
  if (!map[id]) {
    console.error(`No curated sources for id: ${id}`);
    process.exit(1);
  }
  data.verification = data.verification || {};
  data.verification.sources = map[id];
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("updated", id);
}

console.log("Done. Run: npm run validate-data");
