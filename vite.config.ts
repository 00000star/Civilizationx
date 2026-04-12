import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

export default defineConfig({
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
        start_url: "/",
        icons: [
          {
            src: "/favicon.svg",
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
        navigateFallback: "/index.html",
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
              url.pathname.startsWith("/images/"),
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
              url.pathname.startsWith("/assets/") ||
              url.pathname === "/" ||
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
