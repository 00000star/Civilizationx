#!/usr/bin/env node
/**
 * Codex: CivilizationX - Survival Pathfinder & Scavenge Solver
 *
 * Zero-dependency topological graph engine for crisis recovery:
 *  - Calculates prerequisite chains to any technology
 *  - Resolves reachable capabilities from scavenged materials
 *  - Identifies single-point-of-failure civilization bottlenecks
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");
const summariesPath = join(root, "src", "data", "summaries.json");

// Load all technology data
const files = readdirSync(techDir).filter((f) => f.endsWith(".json")).sort();
const techMap = new Map();

for (const file of files) {
  const data = JSON.parse(readFileSync(join(techDir, file), "utf8"));
  techMap.set(data.id, data);
}

const command = process.argv[2] || "status";
const args = process.argv.slice(3);

function printDivider() {
  console.log("-".repeat(50));
}

// 1. PATH RESOLVER: Solves the prerequisite dependency tree to reach a target technology
function solvePath(targetId) {
  if (!techMap.has(targetId)) {
    console.error(`Error: Technology '${targetId}' not found in Codex.`);
    process.exit(1);
  }

  const visited = new Set();
  const order = [];
  const requiredMaterials = new Set();
  const requiredTools = new Set();

  function traverse(id) {
    if (visited.has(id)) return;
    visited.add(id);

    const tech = techMap.get(id);
    if (!tech) return;

    for (const prereq of tech.prerequisites || []) {
      traverse(prereq);
    }

    order.push(tech);
    for (const m of tech.rawMaterials || []) {
      requiredMaterials.add(m.name);
    }
    for (const step of tech.buildSteps || []) {
      for (const t of step.prerequisiteTools || []) {
        requiredTools.add(t);
      }
    }
  }

  traverse(targetId);

  const target = techMap.get(targetId);
  console.log(`\n=== PATH TO: ${target.name.toUpperCase()} ===`);
  console.log(`Era: ${target.era} | Difficulty: ${target.difficulty}/5 | Category: ${target.category}`);
  console.log(`Total Prerequisite Technologies: ${order.length - 1}`);
  printDivider();

  console.log("\nSTEP-BY-STEP UNLOCK SEQUENCE:");
  order.forEach((t, i) => {
    const isTarget = t.id === targetId;
    const prefix = isTarget ? "--> [TARGET]" : `[${i + 1}]`;
    console.log(` ${prefix} ${t.name} (${t.id}) [Maturity: ${t.maturity}]`);
  });

  printDivider();
  console.log(`\nCRITICAL RAW MATERIALS NEEDED (${requiredMaterials.size}):`);
  Array.from(requiredMaterials).slice(0, 15).forEach((m) => console.log(` * ${m}`));
  if (requiredMaterials.size > 15) {
    console.log(` ... and ${requiredMaterials.size - 15} more materials.`);
  }

  console.log(`\nINTERMEDIATE TOOLS NEEDED (${requiredTools.size}):`);
  Array.from(requiredTools).slice(0, 12).forEach((t) => console.log(` * ${t}`));
  if (requiredTools.size > 12) {
    console.log(` ... and ${requiredTools.size - 12} more tools.`);
  }
}

// 2. SCAVENGE RESOLVER: Finds unlocked or near-unlocked tech based on available items
function scavengeResolve(materials) {
  if (materials.length === 0) {
    console.log("Usage: node scripts/survival-pathfinder.mjs scavenge <material1> <material2> ...");
    console.log("Example: node scripts/survival-pathfinder.mjs scavenge clay sand wood charcoal");
    return;
  }

  const queryTerms = materials.map((m) => m.toLowerCase());
  console.log(`\n=== SCAVENGE RESOLVER FOR: [${materials.join(", ")}] ===`);
  printDivider();

  const matches = [];

  for (const tech of techMap.values()) {
    const techMats = (tech.rawMaterials || []).map((m) => m.name.toLowerCase());
    const matchedMats = [];

    for (const term of queryTerms) {
      if (techMats.some((tm) => tm.includes(term))) {
        matchedMats.push(term);
      }
    }

    if (matchedMats.length > 0) {
      matches.push({
        id: tech.id,
        name: tech.name,
        category: tech.category,
        era: tech.era,
        difficulty: tech.difficulty,
        matchedCount: matchedMats.length,
        totalMaterials: techMats.length,
        matchedMats,
        prereqs: tech.prerequisites || [],
      });
    }
  }

  matches.sort((a, b) => b.matchedCount - a.matchedCount || a.difficulty - b.difficulty);

  if (matches.length === 0) {
    console.log("No direct material matches found for the queried terms.");
    return;
  }

  console.log(`Found ${matches.length} matching technologies:\n`);
  matches.slice(0, 15).forEach((m, idx) => {
    const pct = Math.round((m.matchedCount / Math.max(1, m.totalMaterials)) * 100);
    console.log(`[${idx + 1}] ${m.name} (${m.id})`);
    console.log(`    Materials Matched: ${m.matchedCount}/${m.totalMaterials} (${m.matchedMats.join(", ")}) [${pct}%]`);
    console.log(`    Era: ${m.era} | Difficulty: ${m.difficulty}/5 | Category: ${m.category}`);
    if (m.prereqs.length > 0) {
      console.log(`    Prerequisites: ${m.prereqs.join(", ")}`);
    } else {
      console.log(`    Prerequisites: None (Root Tier)`);
    }
    console.log();
  });
}

// 3. BOTTLENECK ANALYSIS: Detects critical chokepoints in the civilization DAG
function analyzeBottlenecks() {
  console.log("\n=== CIVILIZATION DAG BOTTLENECK ANALYSIS ===");
  console.log("Identifying critical technologies that gate the most downstream capabilities...\n");

  const unlockFanout = [];

  for (const tech of techMap.values()) {
    const unlocks = tech.unlocks || [];
    unlockFanout.push({
      id: tech.id,
      name: tech.name,
      era: tech.era,
      category: tech.category,
      directUnlocks: unlocks.length,
      maturity: tech.maturity,
      verification: tech.verification?.status || "unverified",
    });
  }

  unlockFanout.sort((a, b) => b.directUnlocks - a.directUnlocks);

  console.log("TOP 10 CHOKEPOINT TECHNOLOGIES (Highest Unlock Leverage):");
  printDivider();
  unlockFanout.slice(0, 10).forEach((t, i) => {
    console.log(`${i + 1}. ${t.name} (${t.id})`);
    console.log(`   Directly Unlocks: ${t.directUnlocks} technologies`);
    console.log(`   Era: ${t.era} | Maturity: ${t.maturity} | Verification: ${t.verification}`);
    console.log();
  });
}

// 4. STATUS DASHBOARD
function printStatus() {
  console.log("\n=== CODEX: CIVILIZATIONX PATHFINDER ENGINE ===");
  console.log(`Total Indexed Technologies: ${techMap.size}`);

  const byEra = {};
  const byCategory = {};
  const byMaturity = {};

  for (const tech of techMap.values()) {
    byEra[tech.era] = (byEra[tech.era] || 0) + 1;
    byCategory[tech.category] = (byCategory[tech.category] || 0) + 1;
    byMaturity[tech.maturity] = (byMaturity[tech.maturity] || 0) + 1;
  }

  console.log("\nMaturity Tiers:");
  for (const [k, v] of Object.entries(byMaturity).sort()) {
    console.log(`  - ${k.padEnd(20)}: ${v}`);
  }

  console.log("\nTop Categories:");
  for (const [k, v] of Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 6)) {
    console.log(`  - ${k.padEnd(20)}: ${v}`);
  }

  console.log("\nAvailable Commands:");
  console.log("  node scripts/survival-pathfinder.mjs path <tech-id>");
  console.log("  node scripts/survival-pathfinder.mjs scavenge <material1> <material2> ...");
  console.log("  node scripts/survival-pathfinder.mjs bottlenecks");
}

switch (command) {
  case "path":
    solvePath(args[0] || "iron-smelting");
    break;
  case "scavenge":
    scavengeResolve(args);
    break;
  case "bottlenecks":
    analyzeBottlenecks();
    break;
  case "status":
  default:
    printStatus();
    break;
}
