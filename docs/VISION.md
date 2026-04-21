# CivilizationX Vision

CivilizationX exists to preserve and explain the chain of human technology from first principles.

The project has two mirror use cases:

1. Collapse recovery: if modern infrastructure fails, people need a way to rebuild critical capabilities from primitive starting points without rediscovering everything by trial and error.
2. Space settlement: if humans build beyond Earth, settlers need to understand how to make, maintain, substitute, and repair technology when supply chains are distant or unavailable.

Both use cases need the same core artifact: a recursive technology manual that connects raw materials, tools, processes, dependencies, risks, and verification.

## Product Thesis

Wikipedia explains what things are.

CivilizationX should explain how civilization has things.

The difference is dependency depth. Every technology should answer:

- What problem does this solve?
- What principles make it work?
- What raw materials does it require?
- Where can those materials be found on Earth?
- What are credible space or habitat alternatives?
- What tools are needed to process those materials?
- What prerequisite technologies must already exist?
- What does this technology unlock next?
- What can go wrong, and what safety limits matter?
- Which sources support the claims?
- What verification status does the entry have?

## Two Product Layers

### Layer 1: The Tree

The tree is the map. It shows how technologies depend on each other and how progress flows from primitive capabilities into advanced systems.

The tree should make it easy to answer:

- What can be built from a primitive starting point?
- What prerequisite chain leads to a target technology?
- What technologies are bottlenecks?
- Which capabilities unlock the most next steps?
- Which branches matter most for survival, settlement, medicine, energy, communication, and computing?

### Layer 2: The Documentary

The documentary page is the deep manual for each node.

Each node should include:

- Narrative overview
- First principles
- Components
- Raw materials
- Earth locations
- Space alternatives
- Build or maintenance steps
- Safety warnings
- Historical context
- Images and diagrams
- Videos or external demonstrations
- Sources
- Verification record

## Build Phases

### Phase 1: Foundation

Goal: make the structure trustworthy enough to scale.

- Maintain roughly 50 to 100 core technologies.
- Keep the data model strict and consistent.
- Validate every entry automatically.
- Ensure prerequisite and unlock links cannot drift.
- Build a usable interactive tree.
- Build clear documentary pages.
- Add CI for validation, linting, and production builds.

### Phase 2: Depth

Goal: make the bottom of the tree genuinely useful.

Start with primitive and foundational technologies:

- Fire
- Stone tools
- Bone tools
- Rope and cordage
- Shelter
- Cooking
- Clean water
- Sanitation
- Clay and pottery
- Charcoal
- Basic hand tools
- Agriculture and soil
- First aid

These entries matter because both collapse recovery and space settlement begin with constrained inputs.

### Phase 3: Media

Goal: make entries teachable without assuming prior expertise.

- Source open-license images where possible.
- Add diagrams for components and processes.
- Link high-quality videos where appropriate.
- Generate original illustrations only when licensing or clarity requires it.
- Track media credit and license metadata.

### Phase 4: Collaboration

Goal: make the project credible beyond its founders.

- Publish contribution rules.
- Require sources for every factual claim.
- Create review paths for engineers, clinicians, historians, farmers, technicians, and domain experts.
- Treat expert verification as a process record, not a marketing label.
- Keep dangerous instructions behind appropriate warnings and verification gates.

## Engineering Principles

- Data integrity matters more than feature count.
- Safety warnings are product functionality, not legal decoration.
- Unverified content must stay visibly unverified.
- The graph should be derivable and testable.
- Offline access is a core feature.
- The project must remain useful as a static artifact if servers disappear.

## Current Direction

CivilizationX should be built as an offline-first, open, structured knowledge base with an interactive tree interface and documentary technology pages.

The immediate priority is not adding hundreds of entries. The immediate priority is making the first entries correct, linked, validated, safe, and easy for others to improve.
