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
