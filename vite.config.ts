import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function normalizeBasePath(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

function resolveBasePath(): string {
  const explicitBase = process.env.VITE_PUBLIC_BASE?.trim();
  if (explicitBase) return normalizeBasePath(explicitBase);

  if (process.env.GITHUB_ACTIONS) {
    const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
    if (repositoryName) return normalizeBasePath(repositoryName);
  }

  return "/";
}

function codexBuildId(): string {
  if (process.env.VITE_CODEX_BUILD_ID?.trim()) return process.env.VITE_CODEX_BUILD_ID.trim();
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

const techJsonUrls = readdirSync(resolve(__dirname, "src/data/technologies"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => `src/data/technologies/${f}`);

const basePath = resolveBasePath();
const faviconPath = `${basePath}favicon.svg`;

export default defineConfig({
  base: basePath,
  define: {
    "import.meta.env.VITE_CODEX_BUILD_ID": JSON.stringify(codexBuildId()),
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", ...techJsonUrls],
      manifest: {
        name: "The Codex",
        short_name: "Codex",
        description:
          "Everything humanity knows. Everything humanity built. Nothing forgotten.",
        theme_color: "#0A0A0F",
        background_color: "#0A0A0F",
        display: "standalone",
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: faviconPath,
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}",
        ],
        navigateFallback: `${basePath}index.html`,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url }: { url: URL }) =>
              url.pathname.startsWith(`${basePath}images/`),
            handler: "CacheFirst",
            options: {
              cacheName: "codex-public-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ request, url }: { request: Request; url: URL }) =>
              request.mode === "navigate" ||
              url.pathname.startsWith(`${basePath}assets/`) ||
              url.pathname === basePath ||
              url.pathname.endsWith(".html"),
            handler: "NetworkFirst",
            options: {
              cacheName: "codex-app-shell",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: /^https:\/\/i\.ytimg\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "yt-thumbnails",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
