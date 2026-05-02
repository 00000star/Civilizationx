# Session Log

## 2026-04-21

Major work completed:

- Cloned and inspected CivilizationX.
- Added project vision, roadmap, and master plan.
- Added Jira-ready backlog under `docs/jira/`.
- Attempted live Jira push using `.pi` details; Atlassian connection timed out.
- Created local `.pi` execution board.
- Added CI workflow.
- Strengthened data validation.
- Added unlock synchronization and fixed graph drift across technology JSON files.
- Added Foundations Mode.
- Added Pathfinder v1.
- Added route-level code splitting.
- Added hazard inference and hazard dashboard.
- Added generated technology summaries.
- Refactored data loading so full entries lazy-load.
- Reduced `loadTechnologies` build chunk from roughly `537 KB` to roughly `122 KB`.
- Added durable project memory files.

Checks passed after implementation work:

```bash
npm run validate-data
npm run lint
npm run build
```

Current active task after this session:

```text
CIVX-ATLAS-001: Normalize raw materials for Atlas search
```

Additional work completed:

- Created checkpoint commit `25912ec` for foundation/scalable loading work.
- Added `EntryMaturity` type and required `maturity` field.
- Backfilled maturity across all 56 technology entries.
- Added `scripts/backfill-maturity.mjs`.
- Added maturity to generated summaries.
- Added maturity display to documentary pages and tree tooltips.
- Added maturity counts to Status page.
- Normalized Atlas raw material grouping with canonical material keys.
- Preserved grouped source material names for traceability.
- Added material normalization metrics to Status page.

Checks passed:

```bash
npm run validate-data
npm run lint
npm run build
```

Current active task after this session:

```text
CIVX-CAP-001: Add capability readiness matrix
```

Additional work completed:

- Added deterministic capability definitions for core civilization functions.
- Added readiness scoring based on coverage, maturity, source depth, missing anchors, and high-risk review burden.
- Surfaced the readiness matrix on the Status page with linked entries and visible gaps.

Checks passed:

```bash
npm run validate-data
npm run lint
npm run build
```

Current active task after this session:

```text
None. Create the next `.pi` task before adding more implementation.
```

Additional work completed:

- Captured the current product contract in `docs/BUILD_SPEC.md`.
- Added `npm run launch` and `npm start`.
- Added root launcher `./launch-codex.sh` that installs dependencies when missing and starts the app.
- Updated README launch instructions.
- Recorded that the public name is The Codex.
- Queued `CODEX-CONTENT-001` for bottom-of-tree field-guide depth.

Checks passed:

```bash
npm run validate-data
npm run lint
npm run build
```

Launch smoke test passed:

```bash
CODEX_NO_BROWSER=1 CODEX_PORT=5199 npm run launch
```

Current active task after this session:

```text
CODEX-CONTENT-001: Upgrade primitive bootstrap entries to field-guide depth
```

## 2026-05-02

Continued `CODEX-CONTENT-001`.

- Audited bootstrap entry maturity for fire, stone knapping, rope, shelter, sanitation and clean water, cooking, ceramics, charcoal, and basic hand tools.
- Expanded `charcoal` from `researched` into field-guide-shaped review content.
- Expanded charcoal content to include adjustable vents, monitoring ports, dry storage, additional materials, ten operational build steps, stronger wildfire/CO/dust/reignition warnings, and fuller lineage.
- Replaced weak generic source coverage with FAO charcoal-making manuals and CPSC charcoal carbon-monoxide safety guidance.
- Regenerated `src/data/summaries.json`.

Checks passed:

```bash
npm run validate-data
npm run lint
npm run build
```

Remaining near-term content targets:

```text
ceramics-and-pottery
basic-hand-tools
```

## 2026-05-02

Continued `CODEX-CONTENT-001` after the corpus audit showed food production was still structurally underdeveloped.

- Added `field-agriculture` as a new agriculture technology entry.
- Covered seed reserves, site selection, soil cover, water and drainage, crop calendars, pest observation, post-harvest drying, storage, rotation, and settlement-scale impacts.
- Linked field agriculture into the index, prerequisite unlock graph, food capability anchors, planner scenarios, and food-preservation planner goal.
- Updated the Status page so field agriculture is no longer treated as a missing critical entry.
- Regenerated `src/data/summaries.json`.

Checks passed so far:

```bash
npm run validate-data
npm run generate-summaries
npm run lint
npm run build
```

Remaining near-term content targets:

```text
ceramics-and-pottery
basic-hand-tools
staple crop profiles and seed saving
```

## 2026-05-02

Adjusted the expansion strategy after the requirement that Codex information may save lives.

- Removed the bulk stub expansion approach before running it.
- Added `docs/EXPANSION_STANDARD.md` to define the minimum quality bar for growing toward 324+ entries.
- Added `oral-rehydration-therapy` as a review-needed medicine entry with WHO/CDC source coverage, danger signs, exact-mixing warnings, clean-water requirements, monitoring, outbreak control, and stock-management guidance.
- Linked oral rehydration into the index, water/sanitation capability, health/medicine capability, and critical-gap list.

Checks passed:

```bash
npm run sync-unlocks
npm run validate-data
npm run generate-summaries
npm run lint
npm run build
```

## 2026-05-02

Completed the requested 4x corpus expansion without marking unreviewed entries as field-guide-ready.

- Added `scripts/expand-codex-to-target.mjs`, a deterministic expansion catalog that creates substantive draft/review-needed entries with problem statements, overviews, principles, components, raw materials, operating steps, warnings, sources, images metadata, and honest maturity labels.
- Ran the expansion to the 324-entry target.
- Added 242 new technology files across survival, food, agriculture, medicine, materials, energy, tools, construction, transport, communication, computing, science, and defensive/logistics topics.
- Regenerated summaries for all 324 entries.
- Synced prerequisite/unlock graph links after expansion.
- Confirmed category distribution is broad rather than padded into one branch.

Checks passed:

```bash
node scripts/expand-codex-to-target.mjs --target=324
npm run sync-unlocks
npm run validate-data
npm run generate-summaries
npm run lint
npm run build
```

Build note:

- Production build succeeds.
- Initial 4x build reported a large `loadTechnologies` chunk because summaries still carried full raw-material and source payloads.

## 2026-05-02

Audited the 4x expansion for safety and runtime regressions.

- Slimmed `src/data/summaries.json` so tree/pathfinder/foundation views no longer ship full raw-material and source payloads.
- Reduced `src/data/summaries.json` from roughly 1.4 MB to roughly 226 KB while preserving graph metadata, maturity, verification status, and space-readiness flags.
- Added `npm run audit-content` and `npm run audit-content:strict` for content-depth checks beyond schema validation.
- Downgraded unverified `field-guide-ready` entries to `review-needed`; the content may be useful, but the label must not imply qualified field readiness.
- Renamed the Status page's misleading critical gap list to critical review priorities.

Current audit result:

```text
324 entries audited
41 content-depth findings remain, mostly older pre-expansion stubs or researched entries
```

Build result:

- Production build succeeds without the previous large chunk warning.

## 2026-05-02

Completed the remaining content-depth repair pass and tree layout cleanup.

- Repaired all 41 `npm run audit-content` findings.
- Older weak `stub` entries were promoted only to `draft` or `review-needed`, not `field-guide-ready`.
- Added missing components, raw materials, operating steps, review/stop-condition language, and space-settlement notes where entries were below the depth threshold.
- Changed the tree from a wide layer spread to category lanes with left-to-right prerequisite flow.
- Made tree nodes more compact by removing long taglines from the node face and keeping details in hover/preview.
- Moved the minimap away from the bottom-right era controls and switched graph edges to cleaner smooth-step routing.

Checks passed:

```bash
npm run sync-unlocks
npm run generate-summaries
npm run audit-content:strict
npm run validate-data
npm run lint
npm run build
```
