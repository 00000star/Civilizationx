# Contributing to The Codex

Thank you for helping preserve human technique in a form that survives supply-chain interruption.

## Adding a technology

1. Copy an existing file in `src/data/technologies/` to use as a template.
2. Choose a unique `id` in kebab-case. The filename **must** be `<id>.json`.
3. Fill **every** field in the schema. Empty arrays are allowed only where the schema permits; `images` and `videos` may be empty, but most narrative fields must be substantive.
4. Add `{ "id": "<id>" }` to the `nodes` array in `src/data/index.json`.
5. Ensure `prerequisites` and `unlocks` reference ids that exist in `index.json` (forward references are fine if you add all files in the same change).
6. Run:

```bash
npm run validate-data
```

7. If you add images, place them under `public/images/<id>/` and reference `filename` relative to that folder in the JSON.

## Accuracy and safety

- Prefer primary literature, standards, and museum-grade references for facts.
- Industrial processes (pressure vessels, smelting, engines) are dangerous; document hazards honestly. The Codex is not a substitute for local law, training, or supervision.
- Set `verified: false` until a maintainer has reviewed the entry.

## Application code

Keep UI changes focused. Match existing Tailwind tokens in `tailwind.config.js` (`codex-*` colours, `font-display`, etc.).
