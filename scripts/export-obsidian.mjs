import path from "node:path";
import process from "node:process";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";

function usage(exitCode = 0) {
  // Keep this short; the README and vault guides contain details.
  console.log("Usage: node scripts/export-obsidian.mjs [--vault <path>] [--root <relative>] [--force]");
  console.log("Defaults: --vault '/home/starking/Documents/Obsidian Vault', --root '04 Resources/The Codex'");
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = { vault: null, root: null, force: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--force") args.force = true;
    else if (a === "--vault") args.vault = argv[++i] ?? null;
    else if (a === "--root") args.root = argv[++i] ?? null;
    else if (a.startsWith("--")) {
      console.error(`Unknown flag: ${a}`);
      usage(1);
    }
  }
  return args;
}

function defaultVaultPath() {
  const candidate = "/home/starking/Documents/Obsidian Vault";
  if (existsSync(path.join(candidate, ".obsidian"))) return candidate;
  return null;
}

function yamlScalar(value) {
  const s = String(value ?? "").trim();
  const safe = s.replace(/"/g, '\\"');
  return `"${safe}"`;
}

function mdEscapeInline(text) {
  return String(text ?? "").replace(/\r\n/g, "\n").trim();
}

function linkForId(id, idToName) {
  const name = idToName.get(id) ?? id;
  return `[[${id}|${name}]]`;
}

function renderTechnology(t, idToName) {
  const tags = ["codex", "technology", t.category, t.era].filter(Boolean);
  const prerequisites = Array.isArray(t.prerequisites) ? t.prerequisites : [];
  const unlocks = Array.isArray(t.unlocks) ? t.unlocks : [];
  const images = Array.isArray(t.images) ? t.images : [];
  const videos = Array.isArray(t.videos) ? t.videos : [];
  const externalLinks = Array.isArray(t.externalLinks) ? t.externalLinks : [];

  const verification = t.verification ?? {};
  const sources = Array.isArray(verification.sources) ? verification.sources : [];
  const warnings = Array.isArray(verification.warnings) ? verification.warnings : [];

  const fm = [
    "---",
    `id: ${yamlScalar(t.id)}`,
    `name: ${yamlScalar(t.name)}`,
    `tagline: ${yamlScalar(t.tagline)}`,
    `category: ${yamlScalar(t.category)}`,
    `era: ${yamlScalar(t.era)}`,
    `difficulty: ${Number(t.difficulty ?? 0)}`,
    `maturity: ${yamlScalar(t.maturity ?? "")}`,
    `verification_status: ${yamlScalar(verification.status ?? "")}`,
    `last_updated: ${yamlScalar(t.lastUpdated ?? "")}`,
    `tags: [${tags.map((x) => yamlScalar(x)).join(", ")}]`,
    "---",
    "",
  ].join("\n");

  const lines = [];
  lines.push(fm);
  lines.push(`# ${mdEscapeInline(t.name)}`);
  lines.push("");
  lines.push(`> ${mdEscapeInline(t.tagline)}`);
  lines.push("");
  lines.push(
    `Category: \`${t.category}\` | Era: \`${t.era}\` | Difficulty: \`${t.difficulty}\` | Maturity: \`${t.maturity}\` | Verification: \`${verification.status}\``
  );
  lines.push("");

  lines.push("## Problem");
  lines.push("");
  lines.push(mdEscapeInline(t.problem));
  lines.push("");

  lines.push("## Overview");
  lines.push("");
  lines.push(mdEscapeInline(t.overview));
  lines.push("");

  lines.push("## Principles");
  lines.push("");
  for (const p of t.principles ?? []) {
    lines.push(`- **${mdEscapeInline(p.name)}**: ${mdEscapeInline(p.explanation)}`);
  }
  if ((t.principles ?? []).length === 0) lines.push("- (none listed)");
  lines.push("");

  lines.push("## Components");
  lines.push("");
  lines.push("| Component | Function | Position | Made from | Notes |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const c of t.components ?? []) {
    lines.push(
      `| ${mdEscapeInline(c.name)} | ${mdEscapeInline(c.function)} | ${mdEscapeInline(c.position)} | ${mdEscapeInline(c.madeFrom)} | ${mdEscapeInline(c.criticalNote ?? "")} |`
    );
  }
  if ((t.components ?? []).length === 0) lines.push("| (none) |  |  |  |  |");
  lines.push("");

  lines.push("## Raw Materials");
  lines.push("");
  lines.push("| Material | Purpose | Earth locations | Space alternatives | Processing required |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const m of t.rawMaterials ?? []) {
    const earth = Array.isArray(m.earthLocations) ? m.earthLocations.join("; ") : "";
    lines.push(
      `| ${mdEscapeInline(m.name)} | ${mdEscapeInline(m.purpose)} | ${mdEscapeInline(earth)} | ${mdEscapeInline(m.spaceAlternatives ?? "")} | ${mdEscapeInline(m.processingRequired)} |`
    );
  }
  if ((t.rawMaterials ?? []).length === 0) lines.push("| (none) |  |  |  |  |");
  lines.push("");

  lines.push("## Build Steps");
  lines.push("");
  const steps = Array.isArray(t.buildSteps) ? [...t.buildSteps].sort((a, b) => a.order - b.order) : [];
  for (const s of steps) {
    lines.push(`${s.order}. **${mdEscapeInline(s.title)}**`);
    lines.push(`   ${mdEscapeInline(s.description)}`);
    const tools = Array.isArray(s.prerequisiteTools) ? s.prerequisiteTools.filter(Boolean).join(", ") : "";
    if (tools) lines.push(`   Tools: ${tools}`);
    if (s.warningNote) lines.push(`   Warning: ${mdEscapeInline(s.warningNote)}`);
  }
  if (steps.length === 0) lines.push("1. (none listed)");
  lines.push("");

  lines.push("## Connections");
  lines.push("");
  lines.push("Prerequisites:");
  if (prerequisites.length === 0) lines.push("- (none)");
  for (const id of prerequisites) lines.push(`- ${linkForId(id, idToName)}`);
  lines.push("");
  lines.push("Unlocks:");
  if (unlocks.length === 0) lines.push("- (none)");
  for (const id of unlocks) lines.push(`- ${linkForId(id, idToName)}`);
  lines.push("");

  lines.push("## History");
  lines.push("");
  lines.push("| Year | Event | Location | Person |");
  lines.push("| --- | --- | --- | --- |");
  for (const h of t.history ?? []) {
    lines.push(
      `| ${mdEscapeInline(h.year)} | ${mdEscapeInline(h.event)} | ${mdEscapeInline(h.location)} | ${mdEscapeInline(h.person ?? "")} |`
    );
  }
  if ((t.history ?? []).length === 0) lines.push("|  | (none) |  |  |");
  lines.push("");

  lines.push("## Inventors");
  lines.push("");
  if (Array.isArray(t.inventors) && t.inventors.length > 0) {
    lines.push("| Name | Contribution | Years | Nationality |");
    lines.push("| --- | --- | --- | --- |");
    for (const p of t.inventors) {
      lines.push(
        `| ${mdEscapeInline(p.name)} | ${mdEscapeInline(p.contribution)} | ${mdEscapeInline(p.years)} | ${mdEscapeInline(p.nationality)} |`
      );
    }
  } else {
    lines.push("- (none listed)");
  }
  lines.push("");

  lines.push("## Impact");
  lines.push("");
  lines.push(mdEscapeInline(t.impact));
  lines.push("");

  lines.push("## Media");
  lines.push("");
  lines.push("Images:");
  if (images.length === 0) lines.push("- (none)");
  for (const img of images) {
    lines.push(`- ${mdEscapeInline(img.caption)} (${mdEscapeInline(img.type)}), file: \`${mdEscapeInline(img.filename)}\``);
  }
  lines.push("");
  lines.push("Videos:");
  if (videos.length === 0) lines.push("- (none)");
  for (const v of videos) {
    const yt = v.youtubeId ? ` https://www.youtube.com/watch?v=${v.youtubeId}` : "";
    lines.push(`- ${mdEscapeInline(v.title)} (${v.durationSeconds}s)${yt}`);
  }
  lines.push("");
  lines.push("External links:");
  if (externalLinks.length === 0) lines.push("- (none)");
  for (const l of externalLinks) {
    lines.push(`- ${mdEscapeInline(l.title)}: ${mdEscapeInline(l.url)}${l.note ? ` (${mdEscapeInline(l.note)})` : ""}`);
  }
  lines.push("");

  lines.push("## Verification");
  lines.push("");
  lines.push(`Status: \`${mdEscapeInline(verification.status)}\``);
  lines.push(`Reviewed by: ${mdEscapeInline(verification.reviewedBy ?? "null")}`);
  lines.push(`Review date: ${mdEscapeInline(verification.reviewDate ?? "null")}`);
  lines.push("");
  lines.push("Warnings:");
  if (warnings.length === 0) lines.push("- (none)");
  for (const w of warnings) lines.push(`- ${mdEscapeInline(w)}`);
  lines.push("");
  lines.push("Sources:");
  if (sources.length === 0) lines.push("1. (none)");
  for (let i = 0; i < sources.length; i += 1) {
    const s = sources[i];
    const url = s.url ? ` ${mdEscapeInline(s.url)}` : "";
    const note = s.note ? ` (${mdEscapeInline(s.note)})` : "";
    lines.push(`${i + 1}. ${mdEscapeInline(s.title)} [${mdEscapeInline(s.type)}]${url}${note}`);
  }
  lines.push("");

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) usage(0);

  const vault = args.vault ?? defaultVaultPath();
  if (!vault) {
    console.error("No vault found. Provide --vault <path> pointing at your Obsidian vault.");
    process.exit(1);
  }
  if (!existsSync(path.join(vault, ".obsidian"))) {
    console.error(`Not an Obsidian vault (missing .obsidian): ${vault}`);
    process.exit(1);
  }

  const rootRel = args.root ?? path.join("04 Resources", "The Codex");
  const outRoot = path.join(vault, rootRel);
  const outIndexDir = path.join(outRoot, "00 Index");
  const outTechDir = path.join(outRoot, "Technologies");
  const outGuidesDir = path.join(outRoot, "Guides");

  await fs.mkdir(outIndexDir, { recursive: true });
  await fs.mkdir(outTechDir, { recursive: true });
  await fs.mkdir(outGuidesDir, { recursive: true });

  const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const technologiesDir = path.join(repoRoot, "src", "data", "technologies");

  const filenames = (await fs.readdir(technologiesDir)).filter((name) => name.endsWith(".json")).sort();
  const technologies = [];
  for (const name of filenames) {
    const p = path.join(technologiesDir, name);
    const t = await readJson(p);
    technologies.push(t);
  }

  const idToName = new Map(technologies.map((t) => [t.id, t.name]));

  let written = 0;
  let skipped = 0;
  for (const t of technologies) {
    const outPath = path.join(outTechDir, `${t.id}.md`);
    if (!args.force && existsSync(outPath)) {
      skipped += 1;
      continue;
    }
    await fs.writeFile(outPath, renderTechnology(t, idToName), "utf8");
    written += 1;
  }

  const nowIso = new Date().toISOString().slice(0, 10);
  const homeNote = [
    "# The Codex",
    "",
    "**Everything humanity knows. Everything humanity built. Nothing forgotten.**",
    "",
    "This folder is a portable Obsidian view of The Codex technology tree.",
    "",
    "Start here:",
    "- `00 Index/Technology Index.md`",
    "- `Guides/Build Spec.md`",
    "- `Guides/Content Depth Standard.md`",
    "",
    `Last export: \`${nowIso}\``,
    `Export tool: \`scripts/export-obsidian.mjs\``,
    "",
  ].join("\n");
  await fs.writeFile(path.join(outRoot, "The Codex.md"), homeNote, "utf8");

  const techIndexLines = [];
  techIndexLines.push("# Technology Index");
  techIndexLines.push("");
  techIndexLines.push(`Generated from ${technologies.length} JSON entries. Last export: \`${nowIso}\`.`);
  techIndexLines.push("");
  for (const t of technologies.sort((a, b) => String(a.name).localeCompare(String(b.name)))) {
    techIndexLines.push(`- [[${t.id}|${t.name}]] (\`${t.category}\`, \`${t.era}\`, difficulty ${t.difficulty})`);
  }
  techIndexLines.push("");
  await fs.writeFile(path.join(outIndexDir, "Technology Index.md"), techIndexLines.join("\n"), "utf8");

  const docsDir = path.join(repoRoot, "docs");
  const buildSpec = await fs.readFile(path.join(docsDir, "BUILD_SPEC.md"), "utf8");
  const depthStd = await fs.readFile(path.join(docsDir, "CONTENT_DEPTH_STANDARD.md"), "utf8");
  await fs.writeFile(path.join(outGuidesDir, "Build Spec.md"), buildSpec, "utf8");
  await fs.writeFile(path.join(outGuidesDir, "Content Depth Standard.md"), depthStd, "utf8");

  console.log(`Vault: ${vault}`);
  console.log(`Root: ${outRoot}`);
  console.log(`Technologies: wrote ${written}, skipped ${skipped}`);
}

await main();
