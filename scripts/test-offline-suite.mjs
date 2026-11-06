#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

console.log("==================================================");
console.log("  THE CODEX: CIVILIZATIONX OFFLINE VERIFICATION SUITE");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  const start = Date.now();
  try {
    fn();
    const duration = Date.now() - start;
    console.log(`[PASS] ${name} (${duration}ms)`);
    passed++;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[FAIL] ${name} (${duration}ms):`, err.message);
    failed++;
  }
}

// 1. Standalone Schema & DAG Integrity
runTest("DAG Integrity & Standalone Validation (324 Technologies)", () => {
  const out = execSync("node scripts/validate-technologies-standalone.mjs", { cwd: root, encoding: "utf8" });
  if (!out.includes("PASS: All 324 technologies strictly valid")) {
    throw new Error("Validation did not pass: " + out);
  }
});

// 2. Prerequisite / Unlock Bidirectional Consistency
runTest("Prerequisite/Unlock Bidirectional Sync", () => {
  const out = execSync("node scripts/sync-unlocks.mjs", { cwd: root, encoding: "utf8" });
  if (!out.includes("OK - unlocks already match prerequisites")) {
    throw new Error("Unlocks out of sync: " + out);
  }
});

// 3. Technology Summaries Coverage
runTest("Technology Summaries Coverage (324 entries)", () => {
  const summariesPath = join(root, "src", "data", "summaries.json");
  if (!existsSync(summariesPath)) throw new Error("summaries.json does not exist");
  const data = JSON.parse(readFileSync(summariesPath, "utf8"));
  if (Object.keys(data).length !== 324) {
    throw new Error(`Expected 324 summaries, found ${Object.keys(data).length}`);
  }
});

// 4. Survival Pathfinder - Path to Neural Networks
runTest("Survival Pathfinder: Topological Path Resolution (neural-networks)", () => {
  const out = execSync("node scripts/survival-pathfinder.mjs path neural-networks", { cwd: root, encoding: "utf8" });
  if (!out.includes("STEP-BY-STEP UNLOCK SEQUENCE:") || !out.includes("neural-networks")) {
    throw new Error("Pathfinder failed to resolve path for neural-networks");
  }
  if (!out.includes("CRITICAL RAW MATERIALS NEEDED") || !out.includes("INTERMEDIATE TOOLS NEEDED")) {
    throw new Error("Missing materials or tools breakdown");
  }
});

// 5. Survival Pathfinder - Scavenge Resolution
runTest("Survival Pathfinder: Scavenge Resource Filter", () => {
  const out = execSync("node scripts/survival-pathfinder.mjs scavenge copper clay", { cwd: root, encoding: "utf8" });
  if (!out.includes("SCAVENGE RESOLVER FOR") || !out.includes("matching technologies")) {
    throw new Error("Scavenge command failed: " + out);
  }
});

// 6. Survival Pathfinder - Bottleneck Chokepoint Analysis
runTest("Survival Pathfinder: Bottleneck Chokepoint Analysis", () => {
  const out = execSync("node scripts/survival-pathfinder.mjs bottlenecks", { cwd: root, encoding: "utf8" });
  if (!out.includes("TOP 10 CHOKEPOINT TECHNOLOGIES") || !out.includes("basic-hand-tools") || !out.includes("fire")) {
    throw new Error("Bottlenecks analysis failed: " + out);
  }
});

// 7. Field Guide Generation & Content Verification
runTest("Offline Field Guide Generator & Payload Verification", () => {
  execSync("node scripts/generate-offline-manual.mjs", { cwd: root, encoding: "utf8" });
  const mdPath = join(root, "docs", "SURVIVAL_FIELD_GUIDE.md");
  const htmlPath = join(root, "docs", "survival-field-guide.html");
  if (!existsSync(mdPath) || !existsSync(htmlPath)) {
    throw new Error("Field guide files were not generated");
  }
  const mdContent = readFileSync(mdPath, "utf8");
  const htmlContent = readFileSync(htmlPath, "utf8");
  if (mdContent.length < 200000) throw new Error(`Markdown file too small (${mdContent.length} bytes)`);
  if (htmlContent.length < 200000) throw new Error(`HTML file too small (${htmlContent.length} bytes)`);
  if (!htmlContent.includes("Codex: CivilizationX — Offline Field Manual")) {
    throw new Error("HTML missing title header");
  }
});

// 8. Field Readiness Audit Baseline
runTest("Field Readiness Audit: Minimum 20 Field-Ready Technologies", () => {
  const out = execSync("node scripts/audit-field-readiness.mjs", { cwd: root, encoding: "utf8" });
  const match = out.match(/field-ready=(\d+)/);
  if (!match) throw new Error("Could not parse field-ready count from audit output");
  const count = parseInt(match[1], 10);
  if (count < 20) {
    throw new Error(`Expected at least 20 field-ready technologies, got ${count}`);
  }
});

console.log("\n==================================================");
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
}
