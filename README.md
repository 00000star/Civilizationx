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

3.  **Validation & Integrity Audits:**
    *   `node scripts/validate-technologies-standalone.mjs`: Zero-dependency validation checking schema, references, and circular DAG dependencies.
    *   `npm run audit-readiness`: Assess maturity bands and safety gate compliance across all 324 entries.
    *   `npm run generate-summaries`: Build the lightweight search and graph index.

### 🛡️ Field-Ready Anchor Technologies
The Codex maintains fully specified, expert-verified reference anchors with complete component bills, safety warnings, and step-by-step schematics:
*   **Sanitation & Clean Water:** Multi-barrier chlorination, schmutzdecke biosand filtration, and 30m hydraulic zoning.
*   **Emergency Water Storage:** Food-grade HDPE selection, 0.2–0.5 ppm free residual chlorine, and vapor-barrier dunnage.
*   **Forge Bellows:** Han Dynasty double-acting box bellows (*fengxiang*), refractory tuyère nozzles, and anti-blowback traps.
*   **Basic Chemistry Lab:** Two-pan analytical beam balances, indirect sand baths, negative-draft fume hoods, and titration.
*   **Fermentation (Basic):** Ecological microbial succession (LAB), pH < 4.2 botulinum defense, and water-lock crocks.
*   **Bone Tools:** Groove-and-splinter extraction, wet sandstone abrasion, and biconically drilled eyed needles.

## 🌏 Mission
Wikipedia explains what things are; The Codex explains how civilization has things. Our goal is to ensure that the chain of human knowledge remains unbroken, regardless of the scenario.

---
*Created as part of the CivilizationX bootstrap initiative.*
