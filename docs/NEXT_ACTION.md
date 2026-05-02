# Next Action

Current active task:

```text
CODEX-CONTENT-001: Upgrade primitive bootstrap entries to field-guide depth
```

## Goal

Upgrade the bottom-of-tree entries that both collapse recovery and space settlement depend on.

The strongest next move is not another UI feature. It is improving the first-principles documentary depth of primitive technologies because every later branch rests on them.

## Proposed Outcome

- Audit fire, stone knapping, rope, shelter, sanitation and clean water, cooking, ceramics, charcoal, and basic hand tools.
- Improve source depth, material locations, space alternatives, build-step warnings, and component completeness.
- Keep hazardous content unverified unless expert review exists.
- Update maturity only when the entry actually meets the standard.

## Implementation Shape

1. Start with a small batch: fire, stone knapping, and rope.
2. Read each entry before editing.
3. Patch only factual, schema-valid improvements.
4. Run validation, lint, and build.
5. Commit the completed batch.

## Just Completed

`CODEX-LAUNCH-001` is complete.

The app now has `npm run launch`, `npm start`, `./launch-codex.sh`, README launch instructions, and `docs/BUILD_SPEC.md`.

`CODEX-CONTENT-001` progress:

- Fire, stone knapping, rope, shelter, sanitation and clean water, cooking, charcoal, and field agriculture now have much deeper field-guide-shaped content, but remain `review-needed` until qualified review exists.
- Charcoal has expanded kiln components, materials, ten build steps, CO/fire/dust warnings, FAO/CPSC sources, and regenerated summaries.
- Added the missing `field-agriculture` entry as a food-production foundation, linked it into the prerequisite graph, planner, capability readiness matrix, and Status page.
- Added the safety-first expansion rule in `docs/EXPANSION_STANDARD.md`: quadrupling the Codex must use sourced, warning-rich entries rather than stub inflation.
- Added `oral-rehydration-therapy` as the next life-critical medical foundation, with WHO/CDC sources and review-needed status.
- Quadrupled the corpus from 82 to 324 technology entries using a deterministic safety-first expansion catalog. New entries are `draft` or `review-needed`, not falsely marked `field-guide-ready`.

Next best content targets:

1. Deep-review and promote the highest-impact medical entries: `triage-systems`, `burn-care-principles`, `fracture-splinting`, `heat-illness-response`, `hypothermia-response`, and `waterborne-disease-surveillance`.
2. Replace generic review scaffolding in older repaired entries with topic-specific diagrams, measurements, and stronger primary sources.
3. Add visual lane labels and clustering controls to the tree if the 324-node view still feels too dense after the category-lane layout.
