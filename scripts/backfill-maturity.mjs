import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");

function inferMaturity(tech) {
  if (
    tech.problem.length >= 500 &&
    tech.overview.length >= 500 &&
    tech.principles.length >= 3 &&
    tech.components.length >= 3 &&
    tech.rawMaterials.length >= 3 &&
    tech.buildSteps.length >= 3 &&
    tech.verification.sources.length >= 3
  ) {
    return "researched";
  }
  if (
    tech.problem.length >= 200 &&
    tech.overview.length >= 200 &&
    tech.components.length >= 1 &&
    tech.buildSteps.length >= 1
  ) {
    return "draft";
  }
  return "stub";
}

const files = readdirSync(techDir).filter((f) => f.endsWith(".json")).sort();
let changed = 0;

for (const file of files) {
  const fullPath = join(techDir, file);
  const tech = JSON.parse(readFileSync(fullPath, "utf8"));
  const next = tech.maturity ?? inferMaturity(tech);
  if (tech.maturity === next) continue;
  tech.maturity = next;
  writeFileSync(fullPath, `${JSON.stringify(tech, null, 2)}\n`);
  changed += 1;
  console.log(`${file}: maturity = ${next}`);
}

console.log(`OK - updated ${changed} file${changed === 1 ? "" : "s"}.`);
