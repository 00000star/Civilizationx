import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import http from "node:http";
import process from "node:process";

const host = process.env.CODEX_HOST ?? "127.0.0.1";
const port = Number(process.env.CODEX_PORT ?? 5173);
const url = `http://${host}:${port}/`;

async function waitForServer(timeoutMs = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(response.statusCode && response.statusCode < 500);
      });
      request.on("error", () => resolve(false));
      request.setTimeout(600, () => {
        request.destroy();
        resolve(false);
      });
    });
    if (ok) return true;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return false;
}

function openBrowser() {
  if (process.env.CODEX_NO_BROWSER === "1") return;

  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "python3";
  const args =
    process.platform === "win32"
      ? ["/c", "start", "", url]
      : process.platform === "darwin"
        ? [url]
        : ["-m", "webbrowser", url];

  const opener = spawn(command, args, {
    detached: true,
    stdio: "ignore",
  });
  opener.unref();
}

if (!existsSync("node_modules")) {
  console.error("node_modules is missing. Run `npm ci` once, then run `npm run launch`.");
  process.exit(1);
}

console.log(`Launching The Codex at ${url}`);
console.log("Set CODEX_NO_BROWSER=1 to skip opening a browser.");

const vite = spawn(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "dev", "--", "--host", host, "--port", String(port)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      BROWSER: "none",
    },
  }
);

waitForServer().then((ready) => {
  if (ready) openBrowser();
  else console.warn(`The dev server did not respond within 20 seconds. Open ${url} manually if it starts later.`);
});

vite.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
