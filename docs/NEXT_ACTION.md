# Next Action

Current active task:

```text
CIVX-ATLAS-001: Normalize raw materials for Atlas search
```

## Goal

Normalize raw materials so Atlas can group and search materials consistently.

Current Atlas aggregates by free-text material names. That works for 56 entries, but will not scale as the project grows.

## Proposed Outcome

- Add a normalized material key or derive one consistently.
- Reduce duplicate material names.
- Keep Earth locations and space alternatives visible.
- Prepare for a future material catalogue.

## Implementation Shape

1. Inspect `src/utils/atlasAggregator.ts`.
2. Add deterministic material key normalization.
3. Add aliases for obvious duplicates if needed.
4. Show normalized grouping in Atlas.
5. Add status metric for material count.
6. Run validation, lint, and build.
7. Update `/home/starking/.pi/civilizationx-agent-board.json`.

## Just Completed

`CIVX-SCHEMA-001` is complete.

Maturity is now separate from verification and visible in detail pages, tree tooltips, summaries, and status metrics.
