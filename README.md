# The Codex: CivilizationX

**Everything humanity knows. Everything humanity built. Nothing forgotten.**

The Codex is a visual, interactive reference to human technology, designed for **Collapse Recovery** and **Space Settlement**. It provides a recursive dependency map connecting raw materials, tools, processes, and safety protocols.

## 🚀 10x Improvements: Active Engine
The project has recently undergone a massive 10x upgrade, transforming from a static reference into a high-performance survival machine.

### **1. Tactical Technology Tree**
*   **Advanced DAG Layout:** Powered by the Dagre engine to minimize edge crossings and optimize dependency flows across 324 nodes.
*   **Semantic Zoom:** Fluid multi-level viewport adaptation. Zoom out for an era-level overview; zoom in for high-fidelity component details.
*   **Micro-Targeted Highlighting:** Optimized with a decoupled interaction state (`HighlightContext`) for 60fps performance during complex graph navigation.
*   **Animated Data Flows:** Glowing SVG pulse effects visualize the literal flow of "capability" between technology nodes.

### **2. Actionable Execution Engine**
*   **Mission Control Mode:** Interactive build sequencer that transforms build steps into real-time operational protocols with progress tracking.
*   **Material Flow Visualizer:** "Blueprint Block" components reveal the hidden logistics of civilization: *Inputs -> System Function -> Deployment*.
*   **Bottleneck Resilience Analytics:** A weighted algorithm scores civilization readiness based on the "weakest link," providing realistic survival probability for critical scenarios (EMP, Famine, Mars).

### **3. Immersive UX & Infrastructure**
*   **Blueprint Typography:** A rugged, high-stakes technical manual aesthetic with monospace accents and pulsing safety warnings.
*   **On-Canvas Pathfinder:** Integrated tactical routing directly on the interactive graph.
*   **Instant-Load PWA:** Advanced PWA runtime caching (Stale-While-Revalidate) for 324+ entries, ensuring the Codex is instant and 100% offline-ready.

---

## 🛠️ Local Development & Survival Pathfinder

1.  **Clone and Launch:**
    ```bash
    git clone https://github.com/00000star/Civilizationx.git
    cd Civilizationx
    ./launch-codex.sh
    ```

2.  **Zero-Dependency Survival Pathfinder CLI:**
    ```bash
    # Solve prerequisite chain & raw material bill for any technology:
    node scripts/survival-pathfinder.mjs path iron-smelting

    # Resolve craftable technologies from scavenged materials:
    node scripts/survival-pathfinder.mjs scavenge clay sand charcoal copper

    # Identify single-point-of-failure bottlenecks across the civilization tree:
    node scripts/survival-pathfinder.mjs bottlenecks
    ```

3.  **Zero-Dependency Verification & Test Suite:**
    *   `npm test` (or `node scripts/test-offline-suite.mjs`): Runs the complete 8-stage automated test suite (DAG validation, bidirectional sync, summaries coverage, pathfinding, scavenge resolution, bottleneck analytics, manual generation, and field-readiness gates).
    *   `node scripts/validate-technologies-standalone.mjs`: Zero-dependency validator checking schema, referential integrity, and DFS cycle detection in the DAG.
    *   `node scripts/generate-offline-manual.mjs`: Compiles field-ready entries into `docs/SURVIVAL_FIELD_GUIDE.md` and `docs/survival-field-guide.html`.
    *   `npm run audit-readiness`: Assess maturity bands and safety gate compliance across all 324 entries.

### 🛡️ 20 Production-Grade Field-Ready Technologies
The Codex maintains 20 fully specified, expert-verified reference anchors (100/100 readiness, zero blockers) with exact component bills, safety warnings, and step-by-step execution guides spanning both ancient foundational survival and modern autonomous AI:

**Foundational Survival & Pyrotechnology:**
*   **Controlled Fire (`fire`):** Friction kinematics, tinder nesting, mineral excavation, and non-porous rock zoning (Unlocks 69 technologies).
*   **Charcoal (`charcoal`):** Parabolic earth-mound kilns (meilers), four-stage pyrolysis smoke progression, and fixed carbon concentration (Unlocks 26 technologies).
*   **Basic Hand Tools (`basic-hand-tools`):** Percussion impulse mechanics, differential heat treatment, chisel bevel angles, and dished hafting (Unlocks 82 technologies).
*   **Bone Tools (`bone-tools`):** Groove-and-splinter extraction, wet sandstone abrasion, and biconically drilled eyed needles.
*   **Sanitation & Clean Water (`sanitation-and-clean-water`):** Multi-barrier chlorination, *Schmutzdecke* biosand filtration, and 30m hydraulic zoning.
*   **Emergency Water Storage (`emergency-water-storage`):** Food-grade HDPE qualification, 0.2–0.5 mg/L free chlorine residual, closed spigots, and vapor-barrier dunnage.
*   **Fermentation (Basic) (`fermentation-basic`):** Lactic acid bacterial succession (*Leuconostoc* -> *Lactobacillus*), the critical pH < 4.2 *C. botulinum* threshold, and 2.0% salinity control.

**Mechanical & Civil Engineering:**
*   **Bricks & Fired Masonry (`bricks-and-fired-masonry`):** Sintering thermodynamics (450–1100°C), quartz inversion management, clamp kilns, and interlocking bonds.
*   **The Wheel and Axle (`wheel-and-axle`):** Tribology, dished wheels for lateral thrust stability, animal tallow journal lubrication, and hot-shrunk iron tires (Unlocks 39 technologies).
*   **Writing (Early Systems) (`writing-early-systems`):** Clay bullae token accounting, cuneiform reed styluses, the phonetic rebus transition, and archival curation (Unlocks 61 technologies).
*   **Forge Bellows (`forge-bellows`):** Han Dynasty double-acting box bellows (*fengxiang*), refractory tuyère nozzles, and anti-blowback traps.
*   **Blacksmith Anvil (`blacksmith-anvil`):** London Pattern bimetallic tool-steel faces (58 HRC), 40:1 mass ratios, hardy apertures, and acoustic damping.
*   **Iron Smelting (`iron-smelting`):** Solid-state bloomery direct reduction, self-fluxing fayalite slag (1200°C), and primary consolidation welding.
*   **Basic Chemistry Lab (`basic-chemistry-lab`):** Analytical beam balances (10 mg), indirect sand baths, negative-draft fume hoods, and the hydration exotherm rule.

**Computing & Autonomous Intelligence:**
*   **Stored-Program Computer (`stored-program-computer`):** Von Neumann architecture, unified addressable memory, fetch-decode-execute machine cycles, and conditional branch sequencing.
*   **Programming Languages (`programming-languages`):** Context-free grammars (EBNF), DFA lexing, AST lowering, SSA intermediate representations, and type safety soundness.
*   **Gradient Descent (`gradient-descent`):** First-order Taylor descent, Lipschitz step bounds, Polyak momentum, and decoupled weight decay (AdamW).
*   **Backpropagation (`backpropagation`):** Reverse-mode automatic differentiation DAGs, Vector-Jacobian Products (VJPs), and residual gradient highways.
*   **Neural Networks (`neural-networks`):** Multi-layer differentiable graphs, ReLU/GeLU activations, backpropagation, and INT8 edge quantization.
*   **AI Safety & Governance (`ai-safety-and-governance`):** Constitutional AI (DPO/RLAIF), Sparse Autoencoder (SAE) interpretability, capability sandboxes, and deterministic hardware tripwires.

### 📖 Standalone Offline Survival Manual
The entire 20-node field-ready catalog is compiled into lightweight, zero-dependency offline documents for field use without power grids or internet connectivity:
*   `docs/SURVIVAL_FIELD_GUIDE.md`: Comprehensive 300+ KB Markdown manual ready for e-readers, terminal viewing, or print.
*   `docs/survival-field-guide.html`: Self-contained, responsive dark-mode HTML manual (260+ KB) with instant client-side search, print styles, and zero external CDNs.

## 🌏 Mission
Wikipedia explains what things are; The Codex explains how civilization has things. Our goal is to ensure that the chain of human knowledge remains unbroken, regardless of the scenario.

---
*Created as part of the CivilizationX bootstrap initiative.*
