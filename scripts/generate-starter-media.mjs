import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const techDir = join(root, "src", "data", "technologies");
const imageRoot = join(root, "public", "images");

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugText(text, max = 32) {
  const s = String(text).trim();
  return s.length > max ? `${s.slice(0, max - 1)}...` : s;
}

function diagram({ title, subtitle, steps, color = "#C9A84C" }) {
  const stepWidth = 185;
  const x0 = 42;
  const y = 205;
  const blocks = steps
    .map((step, i) => {
      const x = x0 + i * stepWidth;
      const next =
        i < steps.length - 1
          ? `<path d="M ${x + 142} ${y + 42} L ${x + 172} ${y + 42}" stroke="#4A7FBD" stroke-width="3" marker-end="url(#arrow)" />`
          : "";
      return `
        <g>
          <rect x="${x}" y="${y}" width="135" height="84" rx="8" fill="#12121A" stroke="${color}" stroke-width="2" />
          <text x="${x + 67.5}" y="${y + 31}" fill="#E8E6E0" font-family="JetBrains Mono, monospace" font-size="13" text-anchor="middle">${esc(slugText(step, 18))}</text>
          <circle cx="${x + 67.5}" cy="${y + 58}" r="9" fill="#4CAF7D" opacity="0.9" />
          ${next}
        </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title>
  <desc id="desc">${esc(subtitle)}</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4A7FBD" />
    </marker>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 H 0 V 32" fill="none" stroke="#2A2A3E" stroke-width="1" opacity="0.55" />
    </pattern>
  </defs>
  <rect width="960" height="540" fill="#0A0A0F" />
  <rect width="960" height="540" fill="url(#grid)" opacity="0.75" />
  <rect x="28" y="26" width="904" height="488" rx="10" fill="none" stroke="#2A2A3E" stroke-width="2" />
  <text x="56" y="86" fill="#E8E6E0" font-family="Playfair Display, Georgia, serif" font-size="36" font-weight="700">${esc(title)}</text>
  <text x="58" y="122" fill="#9A9888" font-family="Inter, sans-serif" font-size="17">${esc(subtitle)}</text>
  <path d="M 58 152 H 902" stroke="${color}" stroke-width="2" opacity="0.75" />
  ${blocks}
  <text x="56" y="472" fill="#5A5848" font-family="JetBrains Mono, monospace" font-size="12">The Codex project · original schematic · CC0</text>
</svg>
`;
}

const MEDIA = [
  {
    id: "stone-knapping",
    title: "Stone Knapping Process",
    subtitle: "Core, platform, strike angle, flake removal, finished edge",
    steps: ["core", "platform", "strike", "flake", "edge"],
    color: "#C9A84C",
  },
  {
    id: "rope-and-cordage",
    title: "Rope and Cordage Lay",
    subtitle: "Fiber preparation, twist, counter-twist, strand, load test",
    steps: ["fiber", "twist", "counter", "strand", "test"],
    color: "#4CAF7D",
  },
  {
    id: "sanitation-and-clean-water",
    title: "Clean Water Chain",
    subtitle: "Source protection, settling, filtration, disinfection, storage",
    steps: ["source", "settle", "filter", "treat", "store"],
    color: "#4A7FBD",
  },
  {
    id: "charcoal",
    title: "Charcoal Production",
    subtitle: "Dry biomass, low oxygen heat, pyrolysis, cooling, sorting",
    steps: ["dry", "stack", "seal", "heat", "cool"],
    color: "#C9A84C",
  },
  {
    id: "ceramics-and-pottery",
    title: "Ceramic Firing Chain",
    subtitle: "Clay body, forming, drying, bisque/firing, inspection",
    steps: ["clay", "form", "dry", "fire", "inspect"],
    color: "#C9A84C",
  },
  {
    id: "concrete-portland-cement",
    title: "Concrete System",
    subtitle: "Binder, aggregate, water ratio, placement, curing",
    steps: ["binder", "aggregate", "water", "place", "cure"],
    color: "#9A9888",
  },
  {
    id: "germ-theory",
    title: "Transmission Control",
    subtitle: "Reservoir, route, exposure, barrier, monitoring",
    steps: ["reservoir", "route", "exposure", "barrier", "monitor"],
    color: "#4CAF7D",
  },
  {
    id: "stored-program-computer",
    title: "Stored-Program Cycle",
    subtitle: "Memory, fetch, decode, execute, write back",
    steps: ["memory", "fetch", "decode", "execute", "write"],
    color: "#4A7FBD",
  },
  {
    id: "integrated-circuit",
    title: "Integrated Circuit Flow",
    subtitle: "Wafer, lithography, doping, interconnect, package",
    steps: ["wafer", "mask", "dope", "metal", "package"],
    color: "#4A7FBD",
  },
  {
    id: "microprocessor",
    title: "Microprocessor Block",
    subtitle: "Instruction fetch, registers, ALU, bus, peripherals",
    steps: ["fetch", "registers", "ALU", "bus", "I/O"],
    color: "#4A7FBD",
  },
  {
    id: "linear-algebra",
    title: "Linear Algebra Stack",
    subtitle: "Vectors, matrices, transforms, solvers, models",
    steps: ["vectors", "matrices", "maps", "solvers", "models"],
    color: "#C9A84C",
  },
  {
    id: "probability-and-statistics",
    title: "Uncertainty Pipeline",
    subtitle: "Sampling, distribution, estimate, interval, decision",
    steps: ["sample", "model", "estimate", "interval", "decide"],
    color: "#C9A84C",
  },
  {
    id: "gradient-descent",
    title: "Gradient Descent Loop",
    subtitle: "Objective, gradient, step, evaluate, repeat",
    steps: ["loss", "gradient", "step", "eval", "repeat"],
    color: "#4CAF7D",
  },
  {
    id: "backpropagation",
    title: "Backpropagation",
    subtitle: "Forward pass, loss, chain rule, gradients, update",
    steps: ["forward", "loss", "chain", "grad", "update"],
    color: "#4CAF7D",
  },
  {
    id: "neural-networks",
    title: "Neural Network Layers",
    subtitle: "Input, hidden transforms, activations, output, loss",
    steps: ["input", "hidden", "activate", "output", "loss"],
    color: "#4CAF7D",
  },
  {
    id: "machine-learning",
    title: "Machine Learning Pipeline",
    subtitle: "Data, model, loss, training, evaluation",
    steps: ["data", "model", "loss", "train", "eval"],
    color: "#4CAF7D",
  },
  {
    id: "tokenization",
    title: "Tokenization",
    subtitle: "Text, normalization, vocabulary, token IDs, decoding",
    steps: ["text", "normalize", "vocab", "IDs", "decode"],
    color: "#4A7FBD",
  },
  {
    id: "transformer-models",
    title: "Transformer Architecture",
    subtitle: "Tokens, embeddings, attention, feed-forward, logits",
    steps: ["tokens", "embed", "attention", "FFN", "logits"],
    color: "#4A7FBD",
  },
  {
    id: "dataset-curation",
    title: "Dataset Curation",
    subtitle: "Provenance, filtering, deduplication, versioning, audit",
    steps: ["source", "filter", "dedupe", "version", "audit"],
    color: "#C9A84C",
  },
  {
    id: "ai-safety-and-governance",
    title: "AI Safety Loop",
    subtitle: "Risk, evaluation, constraints, monitoring, incident review",
    steps: ["risk", "eval", "limits", "monitor", "review"],
    color: "#C9A84C",
  },
];

let assetsWritten = 0;
let entriesUpdated = 0;

for (const item of MEDIA) {
  const mediaDir = join(imageRoot, item.id);
  mkdirSync(mediaDir, { recursive: true });
  writeFileSync(join(mediaDir, "overview.svg"), diagram(item));
  assetsWritten += 1;

  const entryPath = join(techDir, `${item.id}.json`);
  if (!existsSync(entryPath)) continue;
  const entry = JSON.parse(readFileSync(entryPath, "utf8"));
  const image = {
    id: "overview",
    filename: "overview.svg",
    caption: item.subtitle,
    type: "diagram",
    credit: "The Codex project",
    license: "CC0",
  };
  const images = Array.isArray(entry.images) ? entry.images : [];
  const existingIndex = images.findIndex((img) => img.id === "overview" || img.filename === "overview.svg");
  if (existingIndex >= 0) images[existingIndex] = image;
  else images.unshift(image);
  entry.images = images;
  writeFileSync(entryPath, `${JSON.stringify(entry, null, 2)}\n`);
  entriesUpdated += 1;
}

console.log(`Media assets written: ${assetsWritten}`);
console.log(`Technology entries updated: ${entriesUpdated}`);
