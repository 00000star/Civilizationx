# Context Protocol For Future Codex Sessions

When resuming CivilizationX work, read these first:

1. `docs/PROJECT_MEMORY.md`
2. `docs/NEXT_ACTION.md`
3. `docs/DECISIONS.md`
4. `docs/SESSION_LOG.md`
5. `/home/starking/.pi/civilizationx-agent-board.json`

Then inspect the current git state:

```bash
git status --short
```

Before implementing, confirm the active issue from the `.pi` board and update it as work progresses.

After implementing, run:

```bash
npm run validate-data
npm run lint
npm run build
```

Then update:

- `docs/SESSION_LOG.md`
- `docs/NEXT_ACTION.md`
- `/home/starking/.pi/civilizationx-agent-board.json`

Do not rely on chat history as the source of truth.
