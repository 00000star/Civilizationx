# The Codex

**Everything humanity knows. Everything humanity built. Nothing forgotten.**

The Codex is a visual, interactive encyclopaedia of human technology. Each technology is a node in a dependency graph: prerequisites point to what had to exist first; unlocks point toward what becomes possible next. Every entry is structured JSON so contributors can improve content without touching application code.

## Why it exists

1. **Collapse recovery** — If complex supply chains fail, documented first principles and build orders still exist.
2. **Off-world settlement** — Materials and processes are tagged for Earth and (where relevant) space contexts.

## Tech stack

- React, TypeScript, Vite
- React Flow (`@xyflow/react`) for the tree
- Tailwind CSS, Framer Motion
- React Router
- `vite-plugin-pwa` for offline caching after first load

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
npm run validate-data
```

Data lives in `src/data/technologies/*.json` with `src/data/index.json` as the manifest. Images go in `public/images/<technology-id>/`.

## License

Add a license file appropriate to your organisation; content and code should be clearly licensed for contributors.
