# CivilizationX Project Memory

This file is the compact long-term memory for future Codex sessions.

## Project Identity

CivilizationX is an offline-first civilization bootstrap manual.

It has two mirror use cases:

- Collapse recovery: rebuilding critical capabilities if modern supply chains and institutions fail.
- Space settlement: building, repairing, and substituting technology away from Earth supply chains.

The core thesis: Wikipedia explains what things are; CivilizationX explains how civilization has things.

## Product Model

The project has five major pillars:

1. The Tree: dependency map of human technology.
2. The Documentary: deep structured pages for each technology.
3. The Atlas: raw materials, Earth locations, space substitutes, and material flows.
4. The Pathfinder: routes from known capabilities to target technologies.
5. The Review System: hazards, sources, maturity, verification, and expert review.

## Current Implemented Capabilities

- React/Vite/TypeScript/Tailwind/PWA app.
- Interactive technology tree.
- Documentary pages for technology entries.
- Search page.
- Survival guide page.
- Raw Material Atlas v1.
- Status dashboard.
- Foundations Mode at `/foundations`.
- Pathfinder v1 at `/pathfinder`.
- Hazard inference and visible risk classification.
- Route-level code splitting.
- Lazy full-entry technology loading.
- Generated lightweight technology summaries.
- Data validation script.
- Unlock synchronization script.
- GitHub Actions CI workflow.
- Jira-style planning docs.
- Private `.pi` execution board.

## Current Active Agent Task

Read `/home/starking/.pi/civilizationx-agent-board.json`.

As of the last update:

- `CIVX-PERF-001` is done.
- Active task is `CIVX-SCHEMA-001`: add entry maturity levels.

## Important Files

- Vision: `docs/VISION.md`
- Roadmap: `docs/ROADMAP.md`
- Master plan: `docs/MASTER_PLAN.md`
- Jira docs: `docs/jira/`
- Agent board: `/home/starking/.pi/civilizationx-agent-board.json`
- Data loader: `src/data/loadTechnologies.ts`
- Technology summaries: `src/data/summaries.json`
- Summary generator: `scripts/generate-technology-summaries.mjs`
- Data validator: `scripts/validate-technology-data.mjs`
- Unlock sync: `scripts/sync-unlocks.mjs`
- Foundations: `src/pages/FoundationsPage.tsx`, `src/utils/foundations.ts`
- Pathfinder: `src/pages/PathfinderPage.tsx`, `src/utils/pathfinder.ts`
- Hazards: `src/utils/hazards.ts`

## Required Checks

Run these before claiming implementation work is done:

```bash
npm run validate-data
npm run lint
npm run build
```

`npm run build` runs `npm run generate-summaries` first.

## Current Known Limitation

Full data is lazy-loaded, but PWA precache now includes many per-entry chunks. This is acceptable for offline-first behavior, but future work should evaluate cache strategy as the entry count grows.

## Working Rules

- Do not remove safety warnings to make content look cleaner.
- Treat all high-risk content as provisional unless expert review is recorded.
- Keep unverified status visible.
- Prefer schema/validation improvements before scaling content volume.
- Make graph relationships testable and deterministic.
- Use the `.pi` board to track execution state.
