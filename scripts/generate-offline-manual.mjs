#!/usr/bin/env node
/**
 * Codex: CivilizationX - Standalone Offline Field Guide Generator
 *
 * Compiles all 'field-guide-ready' technologies into:
 *  1. docs/SURVIVAL_FIELD_GUIDE.md (Markdown manual for git / e-readers)
 *  2. docs/survival-field-guide.html (Self-contained, responsive offline web manual)
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");
const docsDir = join(root, "docs");

mkdirSync(docsDir, { recursive: true });

const files = readdirSync(techDir).filter((f) => f.endsWith(".json")).sort();
const fieldReady = [];

for (const file of files) {
  const data = JSON.parse(readFileSync(join(techDir, file), "utf8"));
  if (data.maturity === "field-guide-ready") {
    fieldReady.push(data);
  }
}

console.log(`Found ${fieldReady.length} Field-Guide-Ready technologies.`);

// Era sort order
const ERA_ORDER = [
  "prehistoric", "ancient", "medieval", "early-modern",
  "industrial", "early-20th", "mid-20th", "late-20th", "21st-century",
];

fieldReady.sort((a, b) => {
  const eraA = ERA_ORDER.indexOf(a.era);
  const eraB = ERA_ORDER.indexOf(b.era);
  if (eraA !== eraB) return eraA - eraB;
  return a.name.localeCompare(b.name);
});

// ==========================================
// 1. GENERATE MARKDOWN MANUAL
// ==========================================
let md = `# The Codex: CivilizationX — Survival Field Manual\n\n`;
md += `**Everything humanity knows. Everything humanity built. Nothing forgotten.**\n\n`;
md += `*Compiled for Collapse Recovery, Off-Grid Survival, and Planetary Settlement.*\n\n`;
md += `> **Standard:** Field-Guide-Ready & Expert-Verified (${fieldReady.length} Core Anchors)\n`;
md += `> **Generation Date:** ${new Date().toISOString().split("T")[0]}\n\n`;
md += `---\n\n## Table of Contents\n\n`;

fieldReady.forEach((t, i) => {
  md += `${i + 1}. [${t.name} (${t.id})](#${t.id}) — *${t.era.toUpperCase()} / ${t.category.toUpperCase()}*\n`;
});

md += `\n---\n\n`;

for (const t of fieldReady) {
  md += `## <a id="${t.id}"></a>${t.name}\n\n`;
  md += `> **Tagline:** ${t.tagline}  \n`;
  md += `> **Era:** \`${t.era}\` | **Category:** \`${t.category}\` | **Difficulty:** ${t.difficulty}/5 | **Verification:** \`${t.verification.status}\`\n\n`;

  md += `### 1. Problem & Context\n${t.problem}\n\n`;
  md += `### 2. Technical Overview\n${t.overview}\n\n`;

  md += `### 3. Core Engineering Principles\n`;
  for (const p of t.principles || []) {
    md += `- **${p.name}:** ${p.explanation}\n`;
  }
  md += `\n`;

  md += `### 4. Components & Anatomy\n`;
  for (const c of t.components || []) {
    md += `* **${c.name}** (\`${c.id}\`): ${c.function}\n`;
    md += `  * *Position:* ${c.position} | *Material:* ${c.madeFrom}\n`;
    if (c.criticalNote) md += `  * *Note:* ${c.criticalNote}\n`;
  }
  md += `\n`;

  md += `### 5. Bill of Raw Materials\n`;
  for (const m of t.rawMaterials || []) {
    md += `* **${m.name}:** ${m.purpose}\n`;
    md += `  * *Earth Locations:* ${m.earthLocations.join("; ")}\n`;
    if (m.spaceAlternatives) md += `  * *Space Alternatives:* ${m.spaceAlternatives}\n`;
    md += `  * *Processing Required:* ${m.processingRequired}\n`;
  }
  md += `\n`;

  md += `### 6. Step-by-Step Execution Protocol\n`;
  for (const s of t.buildSteps || []) {
    md += `#### Step ${s.order}: ${s.title}\n`;
    md += `${s.description}\n\n`;
    if (s.prerequisiteTools?.length) {
      md += `*Tools Required:* \`${s.prerequisiteTools.join("`, `")}\`\n\n`;
    }
    if (s.warningNote) {
      md += `> ⚠️ **Warning:** ${s.warningNote}\n\n`;
    }
  }

  if (t.verification?.warnings?.length) {
    md += `### 7. Critical Safety & Failure Warnings\n`;
    for (const w of t.verification.warnings) {
      md += `- ⛔ **HAZARD:** ${w}\n`;
    }
    md += `\n`;
  }

  md += `### 8. Historical Precedent & Impact\n`;
  for (const h of t.history || []) {
    md += `- **${h.year} (${h.location}):** ${h.event}${h.person ? ` — *${h.person}*` : ""}\n`;
  }
  md += `\n**Civilization Impact:** ${t.impact}\n\n`;
  md += `---\n\n`;
}

writeFileSync(join(docsDir, "SURVIVAL_FIELD_GUIDE.md"), md, "utf8");
console.log(`Generated docs/SURVIVAL_FIELD_GUIDE.md (${md.length} bytes).`);

// ==========================================
// 2. GENERATE SELF-CONTAINED OFFLINE HTML
// ==========================================
let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Codex: CivilizationX — Offline Field Manual</title>
<style>
  :root {
    --bg: #0d1117;
    --card: #161b22;
    --border: #30363d;
    --text: #c9d1d9;
    --heading: #58a6ff;
    --accent: #238636;
    --warn: #d29922;
    --danger: #f85149;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }
  @media print {
    body { background: #fff !important; color: #000 !important; }
    .card { page-break-inside: avoid; border: 1px solid #ccc !important; }
    .no-print { display: none !important; }
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    line-height: 1.6;
    margin: 0;
    padding: 16px;
  }
  .container { max-width: 900px; margin: 0 auto; }
  header {
    border-bottom: 2px solid var(--border);
    padding-bottom: 20px;
    margin-bottom: 24px;
  }
  h1 { color: var(--heading); margin: 0 0 8px 0; font-size: 1.8rem; }
  h2 { color: #58a6ff; border-bottom: 1px solid var(--border); padding-bottom: 6px; margin-top: 32px; }
  h3 { color: #79c0ff; margin-top: 20px; font-size: 1.2rem; }
  h4 { color: #e6edf3; margin-bottom: 6px; }
  .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-family: var(--mono);
    margin-right: 6px;
    background: #21262d;
    border: 1px solid var(--border);
  }
  .badge-field { background: #1f6feb33; color: #58a6ff; border-color: #1f6feb; }
  .badge-expert { background: #23863633; color: #3fb950; border-color: #238636; }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 28px;
  }
  .warning-box {
    background: #3b2300;
    border-left: 4px solid var(--warn);
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
  }
  .hazard-box {
    background: #3c1214;
    border-left: 4px solid var(--danger);
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
  }
  code {
    font-family: var(--mono);
    background: #21262d;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
  }
  #search {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 16px;
    font-size: 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    color: #fff;
    border-radius: 6px;
    margin-bottom: 20px;
  }
  .toc {
    background: #161b22;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid var(--border);
    margin-bottom: 24px;
  }
  .toc a { color: #58a6ff; text-decoration: none; display: block; padding: 4px 0; }
  .toc a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="container">
<header>
  <h1>The Codex: CivilizationX — Survival Field Manual</h1>
  <p><strong>Everything humanity knows. Everything humanity built. Nothing forgotten.</strong></p>
  <div>
    <span class="badge badge-field">10 FIELD-READY ANCHORS</span>
    <span class="badge badge-expert">EXPERT-VERIFIED</span>
    <span class="badge">100% OFFLINE</span>
  </div>
</header>

<div class="no-print">
  <input type="text" id="search" placeholder="Type to filter technologies, materials, or hazards..." onkeyup="filterDocs()">
</div>

<div class="toc no-print">
  <strong>Quick Navigation:</strong>
`;

fieldReady.forEach((t) => {
  html += `  <a href="#${t.id}">» ${t.name} <small>(${t.era} / ${t.category})</small></a>\n`;
});

html += `</div>

<div id="content">
`;

for (const t of fieldReady) {
  html += `<article class="card" id="${t.id}" data-tags="${t.id} ${t.name} ${t.category} ${t.era} ${(t.rawMaterials||[]).map(m=>m.name).join(' ')}">
  <h2>${t.name}</h2>
  <p><em>${t.tagline}</em></p>
  <div>
    <span class="badge badge-field">ERA: ${t.era.toUpperCase()}</span>
    <span class="badge badge-expert">DIFFICULTY: ${t.difficulty}/5</span>
    <span class="badge">CATEGORY: ${t.category.toUpperCase()}</span>
    <span class="badge badge-expert">STATUS: ${t.verification.status}</span>
  </div>

  <h3>1. Problem & Crisis Context</h3>
  <p>${t.problem.replace(/\\n\\n/g, "</p><p>")}</p>

  <h3>2. Technical Overview</h3>
  <p>${t.overview.replace(/\\n\\n/g, "</p><p>")}</p>

  <h3>3. Core Engineering Principles</h3>
  <ul>
`;
  for (const p of t.principles || []) {
    html += `    <li><strong>${p.name}:</strong> ${p.explanation}</li>\n`;
  }
  html += `  </ul>

  <h3>4. Critical Components</h3>
  <ul>
`;
  for (const c of t.components || []) {
    html += `    <li><strong>${c.name}:</strong> ${c.function} <em>(${c.madeFrom})</em></li>\n`;
  }
  html += `  </ul>

  <h3>5. Step-by-Step Execution Protocol</h3>
`;
  for (const s of t.buildSteps || []) {
    html += `  <div style="margin-bottom: 14px;">
    <h4>Step ${s.order}: ${s.title}</h4>
    <p>${s.description}</p>
    ${s.prerequisiteTools?.length ? `<p><code>Tools: ${s.prerequisiteTools.join(', ')}</code></p>` : ''}
    ${s.warningNote ? `<div class="warning-box"><strong>Caution:</strong> ${s.warningNote}</div>` : ''}
  </div>\n`;
  }

  if (t.verification?.warnings?.length) {
    html += `  <h3>6. Fatal Hazard Warnings</h3>\n`;
    for (const w of t.verification.warnings) {
      html += `  <div class="hazard-box"><strong>HAZARD:</strong> ${w}</div>\n`;
    }
  }

  html += `</article>\n`;
}

html += `</div>
</div>

<script>
function filterDocs() {
  const query = document.getElementById('search').value.toLowerCase();
  const articles = document.querySelectorAll('article.card');
  articles.forEach(a => {
    const text = (a.getAttribute('data-tags') + ' ' + a.innerText).toLowerCase();
    a.style.display = text.includes(query) ? '' : 'none';
  });
}
</script>
</body>
</html>
`;

writeFileSync(join(docsDir, "survival-field-guide.html"), html, "utf8");
console.log(`Generated docs/survival-field-guide.html (${html.length} bytes).`);
