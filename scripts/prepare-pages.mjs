import { access, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const indexPath = resolve(distDir, "index.html");
const notFoundPath = resolve(distDir, "404.html");

async function main() {
  await access(indexPath, constants.R_OK);
  await copyFile(indexPath, notFoundPath);
  console.log("Prepared GitHub Pages SPA fallback at dist/404.html");
}

main().catch((error) => {
  console.error("Failed to prepare GitHub Pages artifacts.");
  console.error(error);
  process.exitCode = 1;
});
