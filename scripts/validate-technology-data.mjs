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
    "verified",
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
    verified: { type: "boolean" },
  },
};

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const index = JSON.parse(readFileSync(indexPath, "utf8"));
const expectedIds = new Set(index.nodes.map((n) => n.id));

const files = readdirSync(techDir).filter((f) => f.endsWith(".json"));
const loadedIds = new Set();
const errors = [];

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
  for (const p of data.prerequisites || []) {
    if (!expectedIds.has(p)) {
      errors.push(`${f}: prerequisite "${p}" not listed in index.json`);
    }
  }
}

for (const id of expectedIds) {
  if (!loadedIds.has(id)) {
    errors.push(`Missing technology file for index id: ${id}`);
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
