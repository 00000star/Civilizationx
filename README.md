# The Codex

**Everything humanity knows. Everything humanity built. Nothing forgotten.**

The Codex is a visual, interactive reference to human technology. Each entry is structured data: prerequisites show what had to exist first, unlocks show what becomes possible next, and build steps describe how someone might recreate or maintain a capability. The project is built for two serious use cases:

1. **Collapse recovery** — When complex supply chains or institutions fail, documented first principles, material constraints, and procedural sequences remain available offline after the first visit.
2. **Off-world settlement** — Raw materials and processes are described for Earth contexts and, where relevant, genuine space alternatives so planners are not left with hand-waving.

Wrong information in this tool can injure or kill people. Entries carry a **verification** record (`unverified`, `community-reviewed`, or `expert-verified`), explicit **warnings**, and **sources** intended for cross-checking. Nothing here replaces professional training, medical advice, licensed engineering sign-off, or local law.

## Current scope

- **56** indexed technology entries across survival, materials, energy, tools, transport, construction, communication, medicine, agriculture, and related domains (see `src/data/index.json`), including focused survival nodes (water, preservation, sanitation, navigation, soil, first aid).
- **Energy** and **communication** branches include grid-scale power, semiconductors, radio, fibre, satellites, and the web stack, among others.

## Tech stack

- React, TypeScript, Vite
- React Flow (`@xyflow/react`) for the dependency tree
- Tailwind CSS, Framer Motion
- React Router
- `vite-plugin-pwa` with `GenerateSW` — precaches the app shell and data; runtime rules cache Google Fonts and public images
- `qrcode` for print/PDF footers on technology pages

## Development

Fastest launch:

```bash
./launch-codex.sh
```

If dependencies are already installed, this is equivalent:

```bash
npm run launch
```

The launcher starts the Vite dev server at `http://127.0.0.1:5173/` and opens a browser when possible. Set `CODEX_NO_BROWSER=1` if you only want the server. Set `CODEX_PORT=5174` or another port if `5173` is busy.

Manual development commands:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run validate-data
```

Data lives in `src/data/technologies/*.json` with `src/data/index.json` as the manifest. Images go in `public/images/<technology-id>/`.

## Project plan

- Vision: `docs/VISION.md`
- Build specification: `docs/BUILD_SPEC.md`
- Roadmap: `docs/ROADMAP.md`
- Master plan and idea backlog: `docs/MASTER_PLAN.md`
- Jira import and workflow: `docs/jira/README.md`
- Future Codex context protocol: `docs/CONTEXT_PROTOCOL.md`
- Compact project memory: `docs/PROJECT_MEMORY.md`

## Generating new entries

```bash
npm run generate-technologies -- "Your technology topic"
```

This prints the full **Claude / LLM prompt** including mandatory safety rules (build-step warnings, hazardous materials, medicine-specific warnings, minimum real sources, uncertainty language, and space alternatives). Capture model output as valid JSON, save as `src/data/technologies/<id>.json`, add `{ "id": "<id>" }` to `index.json`, then run `npm run validate-data`.

## Fetching media

```bash
npm run fetch-media -- <technology-id>
```

Creates `public/images/<technology-id>/` and documents how filenames map into each entry’s `images` array.

## Bulk verification sources

Curated `verification.sources` (minimum three per entry) live in `scripts/verification_sources_by_id.json`. To re-apply them after editing that file:

```bash
npm run merge-verification-sources
npm run validate-data
```

## Verification

Each entry has a `verification` object: `status`, `reviewedBy`, `reviewDate`, `warnings[]`, and `sources[]`. New content starts as `unverified`. **Expert-verified** entries require a named reviewer and ISO review date. The UI shows status banners on technology pages and coloured dots on tree nodes. Medical or high-risk keywords trigger a full-screen **DangerGate** before content loads (once per entry per browser session).

## Contributing as an expert

See **CONTRIBUTING.md** for the JSON schema, safety checklist, how to propose corrections, and credential expectations for expert sign-off by domain.

## License

Add a license file appropriate to your organisation; separate copyright for code and for curated encyclopaedic content if needed.
