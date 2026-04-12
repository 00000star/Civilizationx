# Contributing to The Codex

Thank you for helping preserve human technique in a form that survives supply-chain interruption and thin institutions. Inaccurate procedural or medical content can cause serious harm. Treat every contribution as safety-critical documentation.

## JSON schema (technology entry)

Each file is `src/data/technologies/<id>.json` where `<id>` matches the `id` field (kebab-case).

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Unique; filename must be `<id>.json` |
| `name` | string | Display title |
| `tagline` | string | One-line summary |
| `category` | string | One of: survival, food, materials, energy, tools, transport, construction, medicine, communication, computing, agriculture, warfare, science |
| `era` | string | prehistoric, ancient, medieval, early-modern, industrial, early-20th, mid-20th, late-20th, 21st-century |
| `difficulty` | integer | 1–5 |
| `prerequisites` | string[] | Ids that must exist in `index.json` |
| `unlocks` | string[] | Ids this technology enables next |
| `problem` | string | Multi-paragraph narrative |
| `overview` | string | Multi-paragraph narrative |
| `principles` | `{ name, explanation }[]` | At least one |
| `components` | `{ id, name, function, position, madeFrom, criticalNote? }[]` | At least one |
| `rawMaterials` | `{ name, purpose, earthLocations[], spaceAlternatives?, processingRequired }[]` | At least one |
| `buildSteps` | `{ order, title, description, prerequisiteTools[], warningNote?, imageId? }[]` | At least one |
| `history` | `{ year, event, location, person? }[]` | At least one |
| `inventors` | `{ name, contribution, years, nationality }[]` | May be empty |
| `impact` | string | Multi-paragraph |
| `images` | `{ id, filename, caption, type, credit, license }[]` | May be empty |
| `videos` | `{ id, title, description, durationSeconds, youtubeId? }[]` | May be empty |
| `externalLinks` | `{ id, title, url, note? }[]` | At least one link |
| `lastUpdated` | string | ISO date `YYYY-MM-DD` |
| `verification` | object | See below |

### `verification` object

```json
{
  "status": "unverified",
  "reviewedBy": null,
  "reviewDate": null,
  "warnings": [],
  "sources": [
    {
      "id": "nist-example",
      "title": "Official publication title",
      "url": "https://example.gov/path",
      "type": "standard",
      "note": "Edition or scope if needed"
    }
  ]
}
```

- `status`: `unverified` | `community-reviewed` | `expert-verified`
- `reviewedBy`: string or `null` (required for expert-verified entries in practice)
- `reviewDate`: ISO date string or `null`
- `warnings`: free-text cautions shown in data and UI where applicable
- `sources`: bibliography; each item has `id`, `title`, `type`, optional `url`, optional `note`

`type` must be one of: `book`, `paper`, `standard`, `institution`, `wikipedia`.

## Adding a technology (manual)

1. Copy a similar existing JSON file as a structural template.
2. Assign a new `id`; create `src/data/technologies/<id>.json`.
3. Add `{ "id": "<id>" }` to `nodes` in `src/data/index.json`.
4. Wire `prerequisites` / `unlocks` to real ids in the same index.
5. Run `npm run validate-data`, then `npm run build` and `npm run lint`.

## Safety requirements (every entry)

These mirror the generator prompt in `scripts/generate-technologies.mjs`:

1. **Build steps**: Any step involving heat over 100 °C, flame, electricity, sharp tools, structural loads, pressure, toxic or corrosive chemicals, biological material, radiation, or confined spaces **must** include `warningNote`.
2. **Hazardous raw materials**: `processingRequired` must cover safe handling, PPE, and disposal where hazards exist.
3. **Medicine**: `category` `medicine` requires `verification.warnings` to list contraindications, overdose risk, sterility requirements, and the sentence: **Professional verification is required before use on a human being.**
4. **Sources**: At least three verifiable references in `verification.sources`. No invented titles or URLs.
5. **Uncertainty**: Say when literature disagrees or context changes outcomes.
6. **Space alternatives**: Every `rawMaterials` entry needs a substantive `spaceAlternatives` string.

## Corrections to existing entries

- Open a pull request that changes only the JSON (and linked media if needed).
- In the PR description, cite the authoritative sources you used (same quality bar as `verification.sources`).
- If you are not the original author, prefer adding or updating `verification.sources` rather than silent edits to long narrative text.

## Flagging an entry for expert review

- Open an issue or PR describing the risk (factual error, missing hazard, ambiguous dosage, and so on).
- Set or suggest `verification.status` to `community-reviewed` only after a structured pass by a maintainer; reserve `expert-verified` for credentialed review documented in `reviewedBy` / `reviewDate`.

## Credentials for expert verification

Maintainers should match reviewers to risk:

| Domain | Typical qualification |
|--------|-------------------------|
| Medicine, surgery, pharmacy, vaccines, antibiotics | Licensed physician, pharmacist, or equivalent national licensure; institutional affiliation preferred |
| Civil / structural / geotechnical engineering | Chartered or licensed professional engineer in the relevant discipline |
| Electrical grid, rotating machines, high voltage | Electrical engineering licensure or documented equivalent industrial authority |
| Chemical process safety | Chemical engineering plus documented process safety training |
| Materials, metallurgy | Materials science or metallurgical engineering graduate plus industrial or research experience |

Verification is a **process** record: the Codex stores who asserted review and when; readers must still judge primary sources.

## Review and merge

1. Automated `npm run validate-data` must pass on CI or locally before merge.
2. A maintainer checks graph integrity (`prerequisites` / `unlocks`) and safety language.
3. Expert-verified merges require the reviewer’s name and date in `verification` and ideally at least three strong sources retained or improved.

## Application code

Keep UI changes focused. Match Tailwind tokens in `tailwind.config.js` (`codex-*` palette, `font-display`). Do not leave TODO comments in production paths.
