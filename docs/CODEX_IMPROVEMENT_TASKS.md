# The Codex Improvement Task List

This file tracks the current improvement pass. It is intentionally concrete: tasks are only checked when the app, data, or docs have been changed and verified.

## Completed in this pass

- [x] Convert the brainstorming into a buildable task list.
- [x] Add a problem-based planner specification for the next core feature.
- [x] Add predefined starting scenarios for primitive recovery, salvage recovery, powered workshop, and Mars habitat use.
- [x] Add predefined goal paths for water, food, metallurgy, electricity, radio, transport repair, computing, AI from scratch, and Mars materials.
- [x] Add recursive prerequisite analysis so The Codex can list what must be built before a target capability.
- [x] Add material bottleneck reporting from the target build sequence.
- [x] Add hazard reporting so dangerous paths are not presented as casual instructions.
- [x] Add content-gap reporting so weak entries remain visibly weak.
- [x] Expose the planner in the application navigation.
- [x] Verify schema validation, lint, production build, and Obsidian export after changes.

## Next backlog

- [ ] Add user-editable inventory: owned tools, materials, power sources, people, and environment.
- [ ] Let the planner accept free-text goals and map them to technologies through local search.
- [ ] Add downloadable and printable planner reports.
- [ ] Add salvage-specific alternatives for each target path.
- [ ] Add time, manpower, and settlement-scale estimates to every technology entry.
- [ ] Add minimum viable version, workshop version, industrial version, and space version to the schema.
- [ ] Add per-node failure diagnostics and quality tests.
- [ ] Add claim-level citations for medical, electrical, chemical, and pressure-vessel content.
- [ ] Add real photographs and diagrams for every field-guide-ready entry.
- [ ] Add expert review queues by domain.

## Principle

The Codex must be honest about capability. If a path depends on industrial chemistry, precision machining, cleanrooms, or expert medical judgment, the interface should say so directly instead of making the work look easy.
