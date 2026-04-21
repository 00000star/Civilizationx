# Next Action

Current active task:

```text
CIVX-SCHEMA-001: Add entry maturity levels
```

## Goal

Add maturity tracking separately from verification.

Verification answers: has an expert reviewed this?

Maturity answers: how complete is the entry as a piece of documentation?

## Proposed Maturity States

- `stub`
- `draft`
- `researched`
- `review-needed`
- `field-guide-ready`

## Implementation Shape

1. Add `EntryMaturity` type.
2. Add optional or required `maturity` field to technology data.
3. Update validator to enforce allowed values.
4. Update summary generator to include maturity.
5. Show maturity on detail pages, tree tooltips, and status dashboard.
6. Backfill current entries conservatively, probably `draft` or `researched`.
7. Run validation, lint, and build.
8. Update `/home/starking/.pi/civilizationx-agent-board.json`.

## Important Caution

Do not confuse maturity with verification.

An entry can be well-structured but still unverified.
