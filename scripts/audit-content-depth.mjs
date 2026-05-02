#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");

const REQUIRED_MEDICAL_WARNING = "Professional verification is required before use on a human being.";

const files = readdirSync(techDir).filter((file) => file.endsWith(".json")).sort();
const rows = files.map((file) => {
  const tech = JSON.parse(readFileSync(join(techDir, file), "utf8"));
  const issues = [];

  if (tech.principles.length < 3) issues.push("principles<3");
  if (tech.components.length < 5) issues.push("components<5");
  if (tech.rawMaterials.length < 3) issues.push("rawMaterials<3");
  if (tech.buildSteps.length < 5) issues.push("buildSteps<5");
  if (tech.verification.sources.length < 3) issues.push("sources<3");
  if (tech.problem.length < 500) issues.push("problem<500");
  if (tech.overview.length < 800) issues.push("overview<800");

  if (tech.category === "medicine") {
    const warnings = tech.verification.warnings.join(" ");
    for (const word of ["Contraindications", "Overdose", "Sterility"]) {
      if (!warnings.toLowerCase().includes(word.toLowerCase())) {
        issues.push(`medicine-warning:${word}`);
      }
    }
    if (!warnings.includes(REQUIRED_MEDICAL_WARNING)) {
      issues.push("medicine-warning:professional-verification");
    }
  }

  if (tech.maturity === "field-guide-ready" && tech.verification.status === "unverified") {
    issues.push("field-guide-ready-but-unverified");
  }

  return {
    id: tech.id,
    name: tech.name,
    category: tech.category,
    maturity: tech.maturity,
    issues,
  };
});

const failing = rows.filter((row) => row.issues.length > 0);
const byMaturity = rows.reduce((acc, row) => {
  acc[row.maturity] = (acc[row.maturity] ?? 0) + 1;
  return acc;
}, {});

console.log(`Audited ${rows.length} entries.`);
console.log(
  `Maturity: ${Object.entries(byMaturity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => `${key}=${count}`)
    .join(", ")}`
);

if (failing.length === 0) {
  console.log("OK - all entries meet the content-depth audit thresholds.");
  process.exit(0);
}

console.log(`Content-depth issues: ${failing.length}`);
for (const row of failing.slice(0, 80)) {
  console.log(`- ${row.id} [${row.maturity}]: ${row.issues.join(", ")}`);
}
if (failing.length > 80) {
  console.log(`... ${failing.length - 80} more entries omitted`);
}

if (process.argv.includes("--strict")) {
  process.exit(1);
}
