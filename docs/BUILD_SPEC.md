# The Codex Build Specification

This document is the implementation contract for The Codex.

## Identity

Project name: **The Codex**

Tagline: **Everything humanity knows. Everything humanity built. Nothing forgotten.**

The Codex is a visual, interactive encyclopaedia of human technology. It maps significant human technologies from primitive roots to advanced systems as a dependency tree. Every node must explain what the technology solves, how it works, what components it contains, how it can be built or maintained from raw materials, where those materials can be obtained, and what the technology unlocks.

The two core use cases are collapse recovery and off-world settlement. These are mirrors of the same requirement: preserve enough first-principles knowledge that people can rebuild or adapt technology without modern supply chains.

## Product Requirements

- The app must work as a static React/Vite/TypeScript site.
- The dependency tree must use React Flow and handle hundreds of nodes.
- Each technology must live as one strict-schema JSON file.
- The app must work offline after initial load through PWA caching.
- The UI must feel serious, timeless, documentary, and engineering-grade.
- Public branding is **The Codex** even if older local tooling still uses the repository folder name.

## Core Screens

- Tree: full interactive technology graph with search, filters, zoom, pan, minimap, tooltips, and directional dependencies.
- Documentary page: overview, components, build steps, raw materials, connections, media, history, verification, maturity, and hazards.
- Search: filterable technology results.
- About: vision, collapse recovery, space settlement, and contribution path.
- Status: coverage, verification, hazards, materials, and capability readiness.
- Atlas: raw materials, Earth locations, space alternatives, and material grouping.
- Pathfinder: route from known technologies to target capabilities.
- Foundations: bottom-of-tree bootstrap technologies.

## Required Data Model

Every entry must include:

- Identity: `id`, `name`, `tagline`, `category`, `era`, `difficulty`
- Tree connections: `prerequisites`, `unlocks`
- Documentary content: `problem`, `overview`, `principles`, `components`, `rawMaterials`, `buildSteps`
- Context: `history`, `inventors`, `impact`
- Media: `images`, `videos`, `externalLinks`
- Meta: `lastUpdated`, `maturity`, `verification`

The repository extends the original simple `verified: boolean` idea into a richer verification record. This is intentional. Verification is not binary for dangerous or technical material.

## Safety Requirements

- High-risk entries must visibly warn readers.
- Medical, electrical, pressure, chemical, fire, radiation, structural, biological, sharp-tool, high-temperature, and confined-space hazards must not be hidden.
- No entry should be marked expert verified without named expert review and date.
- Build instructions should explain principles and safety-critical constraints, not pretend a short web page can replace certified training.

## First Content Priority

The strongest next content slice is primitive bootstrap depth:

1. Fire
2. Stone knapping
3. Rope and cordage
4. Shelter construction
5. Sanitation and clean water
6. Cooking
7. Ceramics and pottery
8. Charcoal
9. Basic hand tools

These entries support both collapse recovery and space settlement because all higher capabilities depend on them.

## Content Depth Requirements

The minimum quality bar for entries is defined in:

- `docs/CONTENT_DEPTH_STANDARD.md`

## Launch Contract

Users should be able to run The Codex locally with one command:

```bash
npm run launch
```

or:

```bash
./launch-codex.sh
```

The launcher should start the Vite dev server and open the app in a browser when possible.
