import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");

const files = readdirSync(techDir).filter((f) => f.endsWith(".json")).sort();
const entries = new Map();

for (const file of files) {
  const fullPath = join(techDir, file);
  const data = JSON.parse(readFileSync(fullPath, "utf8"));
  entries.set(data.id, { data, file, fullPath });
}

const unlocksById = new Map([...entries.keys()].map((id) => [id, new Set()]));

for (const { data } of entries.values()) {
  for (const prerequisiteId of data.prerequisites ?? []) {
    if (!unlocksById.has(prerequisiteId)) continue;
    unlocksById.get(prerequisiteId).add(data.id);
  }
}

let changed = 0;

for (const [id, entry] of entries) {
  const nextUnlocks = [...(unlocksById.get(id) ?? [])].sort();
  const currentUnlocks = [...(entry.data.unlocks ?? [])].sort();

  if (JSON.stringify(nextUnlocks) === JSON.stringify(currentUnlocks)) {
    continue;
  }

  entry.data.unlocks = nextUnlocks;
  writeFileSync(entry.fullPath, `${JSON.stringify(entry.data, null, 2)}\n`);
  changed += 1;
  console.log(`${entry.file}: unlocks synced`);
}

console.log(
  changed === 0
    ? "OK - unlocks already match prerequisites."
    : `OK - synced unlocks in ${changed} file${changed === 1 ? "" : "s"}.`
);
