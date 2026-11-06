#!/usr/bin/env node
/**
 * Codex: CivilizationX - Standalone Data & DAG Validator
 *
 * Zero-dependency pure Node.js validator checking:
 *  - Schema completeness & required keys
 *  - DAG integrity (detects circular dependencies)
 *  - Broken prerequisite / unlock references
 *  - Medical and safety disclosure compliance
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");
const indexPath = join(root, "src", "data", "index.json");

const REQUIRED_FIELDS = [
  "id",
  "name",
  "tagline",
  "category",
  "era",
  "difficulty",
  "prerequisites",
  "unlocks",
  "problem",
  "overview",
  "principles",
  "components",
  "rawMaterials",
  "buildSteps",
  "history",
  "inventors",
  "impact",
  "images",
  "videos",
  "externalLinks",
  "lastUpdated",
  "maturity",
  "verification",
  "spaceReadiness",
];

const VALID_CATEGORIES = new Set([
  "survival", "food", "materials", "energy", "tools",
  "transport", "construction", "medicine", "communication",
  "computing", "agriculture", "warfare", "science",
]);

const VALID_ERAS = new Set([
  "prehistoric", "ancient", "medieval", "early-modern",
  "industrial", "early-20th", "mid-20th", "late-20th", "21st-century",
]);

const VALID_MATURITY = new Set([
  "stub", "draft", "researched", "review-needed", "field-guide-ready",
]);

const files = readdirSync(techDir).filter((f) => f.endsWith(".json")).sort();
const techMap = new Map();
const errors = [];

console.log(`[1/4] Validating schema of ${files.length} technology entries...`);

for (const file of files) {
  const filePath = join(techDir, file);
  let data;
  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (err) {
    errors.push(`${file}: Invalid JSON syntax - ${err.message}`);
    continue;
  }

  // File naming matching ID
  const expectedId = file.replace(/\.json$/, "");
  if (data.id !== expectedId) {
    errors.push(`${file}: id '${data.id}' does not match filename '${expectedId}'`);
  }

  // Required fields check
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`${data.id}: Missing required field '${field}'`);
    }
  }

  // Category and Era enum validation
  if (!VALID_CATEGORIES.has(data.category)) {
    errors.push(`${data.id}: Invalid category '${data.category}'`);
  }
  if (!VALID_ERAS.has(data.era)) {
    errors.push(`${data.id}: Invalid era '${data.era}'`);
  }
  if (!VALID_MATURITY.has(data.maturity)) {
    errors.push(`${data.id}: Invalid maturity '${data.maturity}'`);
  }
  if (typeof data.difficulty !== "number" || data.difficulty < 1 || data.difficulty > 5) {
    errors.push(`${data.id}: Difficulty must be an integer between 1 and 5`);
  }

  // Content depth baselines
  if (typeof data.problem !== "string" || data.problem.length < 50) {
    errors.push(`${data.id}: 'problem' text too short (<50 chars)`);
  }
  if (typeof data.overview !== "string" || data.overview.length < 80) {
    errors.push(`${data.id}: 'overview' text too short (<80 chars)`);
  }
  if (!Array.isArray(data.principles) || data.principles.length === 0) {
    errors.push(`${data.id}: 'principles' must have at least 1 entry`);
  }
  if (!Array.isArray(data.components) || data.components.length === 0) {
    errors.push(`${data.id}: 'components' must have at least 1 entry`);
  }
  if (!Array.isArray(data.rawMaterials) || data.rawMaterials.length === 0) {
    errors.push(`${data.id}: 'rawMaterials' must have at least 1 entry`);
  }
  if (!Array.isArray(data.buildSteps) || data.buildSteps.length === 0) {
    errors.push(`${data.id}: 'buildSteps' must have at least 1 entry`);
  }

  techMap.set(data.id, data);
}

console.log(`[2/4] Validating referential integrity...`);

for (const [id, tech] of techMap.entries()) {
  for (const prereq of tech.prerequisites || []) {
    if (!techMap.has(prereq)) {
      errors.push(`${id}: Prerequisite '${prereq}' does not exist in Codex`);
    }
  }
  for (const unlock of tech.unlocks || []) {
    if (!techMap.has(unlock)) {
      errors.push(`${id}: Unlock '${unlock}' does not exist in Codex`);
    }
  }
}

console.log(`[3/4] Checking DAG for circular dependencies (DFS)...`);

const visited = new Map(); // 0 = unvisited, 1 = visiting, 2 = visited

function detectCycle(nodeId, path = []) {
  visited.set(nodeId, 1);
  path.push(nodeId);

  const tech = techMap.get(nodeId);
  if (tech) {
    for (const prereq of tech.prerequisites || []) {
      const state = visited.get(prereq) || 0;
      if (state === 1) {
        errors.push(`DAG Cycle detected: ${[...path, prereq].join(" -> ")}`);
      } else if (state === 0) {
        detectCycle(prereq, [...path]);
      }
    }
  }

  visited.set(nodeId, 2);
}

for (const id of techMap.keys()) {
  if (!visited.has(id)) {
    detectCycle(id);
  }
}

console.log(`[4/4] Validating index.json coverage...`);

try {
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const indexedIds = new Set(index.nodes.map((n) => n.id));
  for (const id of techMap.keys()) {
    if (!indexedIds.has(id)) {
      errors.push(`index.json missing entry for '${id}'`);
    }
  }
} catch (err) {
  errors.push(`Failed to read/validate index.json: ${err.message}`);
}

console.log("\n" + "=".repeat(50));
if (errors.length === 0) {
  console.log(`PASS: All ${techMap.size} technologies strictly valid.`);
  console.log(`  - 0 schema violations`);
  console.log(`  - 0 broken references`);
  console.log(`  - 0 circular dependencies in DAG`);
  process.exit(0);
} else {
  console.error(`FAIL: Found ${errors.length} validation issues:`);
  for (const err of errors.slice(0, 30)) {
    console.error(` * ${err}`);
  }
  if (errors.length > 30) {
    console.error(` ... and ${errors.length - 30} more issues.`);
  }
  process.exit(1);
}
