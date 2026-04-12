#!/usr/bin/env node
/**
 * Generate new Codex technology entries using Claude (or another LLM).
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=...
 *   node scripts/generate-technologies.mjs
 *
 * This script prints the system prompt and JSON schema expectations.
 * Wire your API client to send the prompt and write the returned JSON
 * to src/data/technologies/<id>.json, then add the id to src/data/index.json
 * and run npm run validate-data.
 */

const SAFETY_BLOCK = `
SAFETY REQUIREMENTS (mandatory for every generated entry):

1. WARNINGS IN BUILD STEPS: Every build step involving any of the following MUST include a non-empty warningNote — no exceptions: heat above 100°C, open flame, electrical current, sharp or cutting tools, structural loads, pressurised systems, toxic or corrosive chemicals, biological material, radiation, confined spaces.

2. HAZARDOUS MATERIALS: In rawMaterials, if any material is toxic, corrosive, flammable, or biologically hazardous, the processingRequired field must describe safe handling, required personal protective equipment, and disposal or neutralisation appropriate to the hazard class.

3. MEDICINE ENTRIES: Every entry with category "medicine" must include in verification.warnings: specific contraindications, overdose risks, required sterility conditions, and the exact sentence: "Professional verification is required before use on a human being."

4. SOURCES: The verification.sources array must contain at minimum three real, verifiable references. Acceptable sources: peer-reviewed journals, government or intergovernmental technical standards bodies (for example NIST, ISO, WHO, NASA technical reports), established engineering or medical textbooks, recognised scientific institutions. Wikipedia is acceptable only as a supplementary pointer — not as a primary source. Do not invent URLs, DOIs, or publication titles.

5. UNCERTAINTY: If any aspect of the entry is genuinely uncertain, contested in the literature, or varies significantly by context, state this explicitly in the relevant narrative field. Do not present uncertain information as established fact.

6. SPACE ALTERNATIVES: Every raw material must have a genuine, thought-through spaceAlternatives string. Phrases such as "cannot improvise" or "import from Earth" are not acceptable unless they are literally true — in which case you must explain why and what that implies for a colony depending on this technology.

Each entry must use this verification object shape (adjust fields for the specific entry):

  "verification": {
    "status": "unverified",
    "reviewedBy": null,
    "reviewDate": null,
    "warnings": [],
    "sources": [
      {
        "id": "source-1",
        "title": "Full real title",
        "url": "https://...",
        "type": "standard",
        "note": "Optional scope note"
      }
    ]
  }

Source type must be one of: "book" | "paper" | "standard" | "institution" | "wikipedia".
`;

const SCHEMA_REMINDER = `
Required top-level keys (all must be present):
id, name, tagline, category, era, difficulty, prerequisites, unlocks,
problem, overview, principles, components, rawMaterials, buildSteps,
history, inventors, impact, images, videos, externalLinks, lastUpdated, verification

Use kebab-case id matching the filename. prerequisites and unlocks must reference existing ids in index.json or be introduced together in one coherent change set.
`;

export function buildGenerationPrompt(topic) {
  return [
    `You are writing a technology entry for The Codex, a civilisation reference tool.`,
    `Topic: ${topic}`,
    "",
    SCHEMA_REMINDER,
    "",
    SAFETY_BLOCK,
    "",
    "Return a single valid JSON object only. No markdown fences.",
  ].join("\n");
}

const topic = process.argv.slice(2).join(" ").trim() || "controlled fire (example)";
console.log(buildGenerationPrompt(topic));
