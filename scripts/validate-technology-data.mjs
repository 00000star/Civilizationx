import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const techDir = join(root, "src", "data", "technologies");
const indexPath = join(root, "src", "data", "index.json");

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
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
  ],
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
    tagline: { type: "string", minLength: 1 },
    category: { type: "string" },
    era: { type: "string" },
    difficulty: { type: "integer", minimum: 1, maximum: 5 },
    prerequisites: { type: "array", items: { type: "string" } },
    unlocks: { type: "array", items: { type: "string" } },
    problem: { type: "string", minLength: 50 },
    overview: { type: "string", minLength: 80 },
    parameters: { type: "object", additionalProperties: { type: "string" } },
    principles: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["name", "explanation"],
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          explanation: { type: "string", minLength: 10 },
        },
      },
    },
    components: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "name", "function", "position", "madeFrom"],
        additionalProperties: true,
      },
    },
    rawMaterials: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["name", "purpose", "earthLocations", "processingRequired"],
        additionalProperties: true,
        properties: {
          earthLocations: { type: "array", minItems: 1, items: { type: "string" } },
        },
      },
    },
    buildSteps: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["order", "title", "description", "prerequisiteTools"],
        additionalProperties: true,
      },
    },
    history: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["year", "event", "location"],
        additionalProperties: true,
      },
    },
    inventors: { type: "array", items: { type: "object" } },
    impact: { type: "string", minLength: 40 },
    images: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "filename", "caption", "type", "credit", "license"],
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          filename: { type: "string" },
          caption: { type: "string" },
          type: {
            type: "string",
            enum: ["photograph", "diagram", "schematic", "illustration"],
          },
          credit: { type: "string" },
          license: { type: "string" },
        },
      },
    },
    videos: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "title", "description", "durationSeconds"],
        additionalProperties: true,
      },
    },
    externalLinks: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "title", "url"],
        additionalProperties: true,
      },
    },
    lastUpdated: { type: "string", format: "date" },
    maturity: {
      type: "string",
      enum: ["stub", "draft", "researched", "review-needed", "field-guide-ready"],
    },
    spaceReadiness: {
      type: "object",
      required: ["fullAlternatives", "earthOnly"],
      properties: {
        fullAlternatives: { type: "boolean" },
        earthOnly: { type: "boolean" },
      },
    },
    verification: {
      type: "object",
      additionalProperties: false,
      required: ["status", "reviewedBy", "reviewDate", "warnings", "sources"],
      properties: {
        status: {
          type: "string",
          enum: ["unverified", "community-reviewed", "expert-verified"],
        },
        reviewedBy: { type: ["string", "null"] },
        reviewDate: {
          anyOf: [{ type: "null" }, { type: "string", format: "date" }],
        },
        warnings: { type: "array", items: { type: "string" } },
        sources: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "title", "type"],
            properties: {
              id: { type: "string", minLength: 1 },
              title: { type: "string", minLength: 1 },
              url: { type: "string" },
              type: {
                type: "string",
                enum: ["book", "paper", "standard", "institution", "wikipedia"],
              },
              note: { type: "string" },
            },
          },
        },
      },
    },
  },
};

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const index = JSON.parse(readFileSync(indexPath, "utf8"));
const expectedIds = new Set(index.nodes.map((n) => n.id));

const files = readdirSync(techDir).filter((f) => f.endsWith(".json"));
const loadedIds = new Set();
const loadedTechnologies = new Map();
const errors = [];
const allowedCategories = new Set([
  "survival",
  "food",
  "materials",
  "energy",
  "tools",
  "transport",
  "construction",
  "medicine",
  "communication",
  "computing",
  "agriculture",
  "warfare",
  "science",
]);
const allowedEras = new Set([
  "prehistoric",
  "ancient",
  "medieval",
  "early-modern",
  "industrial",
  "early-20th",
  "mid-20th",
  "late-20th",
  "21st-century",
]);
const allowedMaturity = new Set([
  "stub",
  "draft",
  "researched",
  "review-needed",
  "field-guide-ready",
]);
const requiredMedicalWarning =
  "Professional verification is required before use on a human being.";

for (const f of files) {
  const raw = readFileSync(join(techDir, f), "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    errors.push(`${f}: invalid JSON — ${e.message}`);
    continue;
  }
  if (!validate(data)) {
    errors.push(
      `${f}: schema errors — ${ajv.errorsText(validate.errors, { separator: "\n" })}`
    );
  }
  if (data.id && `${data.id}.json` !== f) {
    errors.push(`${f}: filename must match id (${data.id}.json)`);
  }
  loadedIds.add(data.id);
  loadedTechnologies.set(data.id, data);

  if (!allowedCategories.has(data.category)) {
    errors.push(`${f}: category "${data.category}" is not allowed`);
  }
  if (!allowedEras.has(data.era)) {
    errors.push(`${f}: era "${data.era}" is not allowed`);
  }
  if (!allowedMaturity.has(data.maturity)) {
    errors.push(`${f}: maturity "${data.maturity}" is not allowed`);
  }

  for (const p of data.prerequisites || []) {
    if (!expectedIds.has(p)) {
      errors.push(`${f}: prerequisite "${p}" not listed in index.json`);
    }
  }
  for (const u of data.unlocks || []) {
    if (!expectedIds.has(u)) {
      errors.push(`${f}: unlock "${u}" not listed in index.json`);
    }
  }

  if ((data.verification?.sources?.length ?? 0) < 3) {
    errors.push(`${f}: verification.sources must contain at least three sources`);
  }

  if (data.verification?.status === "expert-verified") {
    if (!data.verification.reviewedBy) {
      errors.push(`${f}: expert-verified entries require reviewedBy`);
    }
    if (!data.verification.reviewDate) {
      errors.push(`${f}: expert-verified entries require reviewDate`);
    }
  }

  for (const material of data.rawMaterials || []) {
    if (
      typeof material.spaceAlternatives !== "string" ||
      material.spaceAlternatives.trim().length < 10
    ) {
      errors.push(
        `${f}: raw material "${material.name}" needs a substantive spaceAlternatives value`
      );
    }
  }

  if (data.category === "medicine") {
    const warnings = data.verification?.warnings ?? [];
    const warningText = warnings.join(" ");
    for (const keyword of [
      "Contraindications",
      "Overdose",
      "Sterility",
    ]) {
      if (!warningText.toLowerCase().includes(keyword.toLowerCase())) {
        errors.push(`${f}: medicine entries must warn about ${keyword}`);
      }
    }
    if (!warningText.includes(requiredMedicalWarning)) {
      errors.push(
        `${f}: medicine entries must include the required professional verification warning`
      );
    }
  }
}

for (const id of expectedIds) {
  if (!loadedIds.has(id)) {
    errors.push(`Missing technology file for index id: ${id}`);
  }
}

for (const [id, data] of loadedTechnologies) {
  for (const prerequisiteId of data.prerequisites || []) {
    const prerequisite = loadedTechnologies.get(prerequisiteId);
    if (!prerequisite) continue;
    if (!(prerequisite.unlocks || []).includes(id)) {
      errors.push(
        `${data.id}.json: prerequisite "${prerequisiteId}" must list "${id}" in unlocks`
      );
    }
  }

  for (const unlockId of data.unlocks || []) {
    const unlock = loadedTechnologies.get(unlockId);
    if (!unlock) continue;
    if (!(unlock.prerequisites || []).includes(id)) {
      errors.push(
        `${data.id}.json: unlock "${unlockId}" must list "${id}" in prerequisites`
      );
    }
  }
}

if (errors.length) {
  console.error("Technology data validation failed:\n");
  for (const e of errors) console.error("•", e);
  process.exit(1);
}

console.log(
  `OK — ${files.length} technology files validated against schema and index.`
);
