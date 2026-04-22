# Content Depth Standard (Entry Quality Bar)

This project is not a glossary. Each technology entry must be deep enough that a motivated, reasonably intelligent reader can understand the system and plan a safe path to reproduce or repair it, given time, tools, and access to prerequisites.

The goal is not to encourage unsafe behavior. The goal is to preserve correct, verifiable knowledge with safety-first framing.

## Required For Every Entry

- No placeholders. Every required schema field must be present and non-empty.
- Plain language first. Assume the reader does not know the jargon.
- Safety is content. If a process can burn, poison, blind, explode, infect, or collapse, warnings must be explicit.
- Sources are mandatory. Do not invent citations. Prefer primary or authoritative references.

## Minimum Documentary Depth (Hard Requirements)

These are minimums, not targets.

- `problem`: 2 to 4 paragraphs explaining the human need and why simpler approaches fail.
- `overview`: 3 to 5 paragraphs explaining how it works in plain language, including what can go wrong.
- `principles`: at least 3 principles for most entries. Each explanation ties directly to the technology, not a generic textbook definition.
- `components`: at least 6 components for most entries. Primitive entries can be fewer if the system truly has fewer parts, but you must name the parts that matter (including "human processes" as components when appropriate).
- `rawMaterials`: at least 5 materials for most entries. Primitive entries can be fewer if accurate, but include the consumables that actually constrain the build (fuel, binders, abrasives, containers, water, etc).
- `buildSteps`: at least 8 steps for most entries. Each step includes tools and safety notes where relevant.
- `history`: at least 5 entries that explain the lineage, not just dates.
- `inventors`: at least 2 when applicable. For prehistoric/unknown inventors, use an empty list and explain lineage in `history` instead.
- `impact`: 2 to 3 paragraphs describing second-order effects (social, environmental, governance).
- `images`: at least 1 diagram or illustrative image where possible. If no image exists yet, keep the array empty but do not remove the field.
- `videos`: optional, but if present must be real and relevant.
- `externalLinks`: optional, but should not duplicate `verification.sources`.

## Verification And Maturity Rules

This repo separates "how complete the entry is" from "how reviewed it is".

- `verification.status`:
  - `unverified`: default for new content.
  - `community-reviewed`: a named reviewer has checked for internal consistency and obvious errors.
  - `expert-verified`: requires a real person name and ISO `reviewDate`. Do not self-assert this.
- `verification.sources`:
  - Minimum 3 real sources per entry.
  - Prefer standards bodies (NIST/ISO/IEC/WHO), textbooks, peer-reviewed papers, reputable institutional docs.
  - Wikipedia is allowed only as a pointer, never the sole support for a claim.
- `maturity`:
  - `stub`: schema filled but shallow.
  - `draft`: coherent but missing depth or missing key constraints.
  - `researched`: strong overview, materials, steps, and sources; still may lack expert review.
  - `review-needed`: content is deep but high-risk or disputed; needs domain review.
  - `field-guide-ready`: step-by-step is complete enough to act as a field manual, with safety framing and reliable sources.

## Safety Bar (Non-Negotiable)

Entries must include warning notes where hazards exist. Examples:

- Fire, heat, pressure, or combustion: burns, smoke inhalation, CO poisoning, flashback risk, runaway reaction.
- Chemistry: toxic fumes, corrosives, exothermic reactions, contamination, storage/labeling.
- Electricity: shock, arc flash, burns, fire, lockout/tagout.
- Structural work: collapse, load paths, lifting hazards.
- Medicine: infection control, contraindications, sterility limits, "seek professional care" language.

If the hazard is life-critical, the DangerGate UX should trigger (and the entry should not try to bypass it).

## Reproducibility Expectations

The reader should be able to answer:

- What raw materials are required, where they come from, and what processing is required?
- What tools are prerequisites, and how would I obtain them earlier in the tree?
- What are the failure modes, and how do I detect/mitigate them?
- What substitutions exist on Earth vs in space (ISRU), and what changes?

## Primitive Entry Special Case

Primitive technologies still need depth. The components are often "process components":

- Example: Fire includes tinder, kindling, fuel, ignition source, airflow control, and containment.
- Example: Rope includes fiber selection, retting/processing, twist/lay geometry, and testing.

## Quality Checklist (Before Marking `researched` Or Higher)

- Step sequence is executable and tool-constrained.
- Materials list covers consumables and not just the headline material.
- Every safety-critical step has a warning note.
- Sources exist for the key claims and parameters.
- Earth locations are plausible and not over-specific unless sourced.
- Space alternatives are framed as pathways (ISRU, recycling, substitution), not magic.

