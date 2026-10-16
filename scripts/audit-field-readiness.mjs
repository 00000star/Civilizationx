#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");

const MEDICAL_REVIEW_WARNING = "Professional verification is required before use on a human being.";

function inferRisk(tech) {
  const text = [
    tech.id,
    tech.name,
    tech.tagline,
    tech.category,
    tech.problem,
    tech.overview,
    tech.impact,
    ...(tech.verification?.warnings ?? []),
  ].join(" ").toLowerCase();
  if (tech.category === "medicine" || /\b(pressure|boiler|radiation|nuclear|confined|oxygen)\b/.test(text)) return "critical";
  if (/\b(electric|voltage|fire|chemical|toxic|collapse|furnace|smelting|pathogen)\b/.test(text)) return "high";
  return "moderate";
}

function assess(tech) {
  const blockers = [];
  let score = 0;
  score += Math.min(16, tech.verification.sources.length * 4);
  if (tech.verification.status === "community-reviewed") score += 8;
  if (tech.verification.status === "expert-verified") score += 16;
  score += Math.min(12, Math.floor(tech.problem.length / 120));
  score += Math.min(14, Math.floor(tech.overview.length / 120));
  score += Math.min(8, tech.principles.length * 2);
  score += Math.min(10, tech.components.length * 2);
  score += Math.min(10, tech.rawMaterials.length * 2);
  score += Math.min(12, tech.buildSteps.length * 2);
  score += Math.min(6, tech.verification.warnings.length * 2);
  score += Math.min(4, tech.images.length + tech.videos.length);
  score += Math.min(4, tech.prerequisites.length + tech.unlocks.length);
  if (tech.spaceReadiness.fullAlternatives) score += 4;
  if (tech.maturity === "researched") score += 4;
  if (tech.maturity === "review-needed") score += 6;
  if (tech.maturity === "field-guide-ready") score += 8;
  score = Math.min(100, score);

  const risk = inferRisk(tech);
  if (tech.verification.sources.length < 3) blockers.push("sources<3");
  if (tech.problem.length < 500) blockers.push("problem<500");
  if (tech.overview.length < 800) blockers.push("overview<800");
  if (tech.principles.length < 3) blockers.push("principles<3");
  if (tech.components.length < 5) blockers.push("components<5");
  if (tech.rawMaterials.length < 3) blockers.push("rawMaterials<3");
  if (tech.buildSteps.length < 5) blockers.push("buildSteps<5");
  if ((risk === "critical" || risk === "high") && tech.verification.status !== "expert-verified") {
    blockers.push("high-risk-needs-expert-review");
  }
  if (tech.category === "medicine") {
    const warnings = tech.verification.warnings.join(" ");
    for (const word of ["Contraindications", "Overdose", "Sterility"]) {
      if (!warnings.toLowerCase().includes(word.toLowerCase())) blockers.push(`medicine-warning:${word}`);
    }
    if (!warnings.includes(MEDICAL_REVIEW_WARNING)) blockers.push("medicine-warning:professional-verification");
  }
  if (tech.maturity === "field-guide-ready" && tech.verification.status === "unverified") {
    blockers.push("field-guide-ready-but-unverified");
  }

  const band =
    blockers.length === 0 && score >= 88
      ? "field-ready"
      : blockers.length <= 2 && score >= 72
        ? "review-gate"
        : score >= 50
          ? "research-needed"
          : "draft";

  return { id: tech.id, name: tech.name, category: tech.category, score, band, risk, blockers };
}

const files = readdirSync(techDir).filter((file) => file.endsWith(".json")).sort();
const rows = files
  .map((file) => JSON.parse(readFileSync(join(techDir, file), "utf8")))
  .map(assess)
  .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));

const counts = rows.reduce((acc, row) => {
  acc[row.band] = (acc[row.band] ?? 0) + 1;
  return acc;
}, {});
const average = Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length);

console.log(`Audited ${rows.length} entries.`);
console.log(`Average field-readiness score: ${average}/100`);
console.log(
  `Bands: ${Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([band, count]) => `${band}=${count}`)
    .join(", ")}`
);
console.log("Lowest readiness entries:");
for (const row of rows.slice(0, 20)) {
  console.log(`- ${row.id} [${row.score}/100 ${row.band} ${row.risk}]: ${row.blockers.slice(0, 5).join(", ")}`);
}

if (process.argv.includes("--strict")) {
  const mislabeled = rows.filter((row) => row.blockers.includes("field-guide-ready-but-unverified"));
  if (mislabeled.length > 0) process.exit(1);
}
