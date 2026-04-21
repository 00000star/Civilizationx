# Next Action

Current active task:

```text
CIVX-CAP-001: Add capability readiness matrix
```

## Goal

Show the project as a civilization capability map, not only a list of technologies.

The next useful layer is a readiness matrix that answers: which core civilization capabilities can the current knowledge base explain from primitive inputs, and which still have missing links?

## Proposed Outcome

- Add capability groups such as water, food, shelter, materials, energy, medicine, communication, and computing.
- Map existing technologies into those groups deterministically.
- Show per-capability counts, maturity, source depth, and hazard exposure.
- Make gaps visible so future content work targets missing civilization functions, not random entries.

## Implementation Shape

1. Add a capability utility that groups technologies by category and keywords.
2. Add capability readiness metrics from maturity, verification, and hazards.
3. Surface the matrix on the Status page or a dedicated route.
4. Keep the algorithm deterministic and easy to validate.
5. Update project memory and the `.pi` board.
6. Run validation, lint, and build.

## Just Completed

`CIVX-ATLAS-001` is complete.

Raw materials now use canonical keys for Atlas grouping and search while preserving source names, Earth locations, and space alternatives.
