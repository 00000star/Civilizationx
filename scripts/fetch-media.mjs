#!/usr/bin/env node
/**
 * Fetch or prepare media assets for a technology entry.
 *
 * Usage:
 *   node scripts/fetch-media.mjs <technology-id>
 *
 * Expectations:
 * - Place downloaded or generated files under public/images/<technology-id>/
 * - Reference filenames in the technology JSON images[] array (filename relative to that folder)
 *
 * This repository does not ship a network downloader by default: integrate your
 * institution's asset pipeline, stock licences, or museum API here. The script
 * verifies the target directory exists and prints the expected layout.
 */

import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const id = process.argv[2];

if (!id) {
  console.error("Usage: node scripts/fetch-media.mjs <technology-id>");
  process.exit(1);
}

const dir = join(root, "public", "images", id);
mkdirSync(dir, { recursive: true });

if (!existsSync(dir)) {
  console.error("Failed to create", dir);
  process.exit(1);
}

console.log(`Ready: ${dir}`);
console.log("Add files here, then reference them from src/data/technologies/" + id + ".json images[].filename");
