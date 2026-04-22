import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const techDir = join(root, "src", "data", "technologies");
const indexPath = join(root, "src", "data", "index.json");

function usage(exitCode = 0) {
  console.log("Usage: node scripts/add-batch-nodes.mjs [--force]");
  process.exit(exitCode);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
if (args.includes("--help") || args.includes("-h")) usage(0);
for (const a of args) {
  if (a === "--force") continue;
  console.error(`Unknown flag: ${a}`);
  usage(1);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function para(lines) {
  return lines.map((l) => l.trim()).join("\n\n");
}

function baseVerification(sources, warnings = []) {
  return {
    status: "unverified",
    reviewedBy: null,
    reviewDate: null,
    warnings,
    sources,
  };
}

function src(id, title, type, url, note) {
  const out = { id, title, type };
  if (url) out.url = url;
  if (note) out.note = note;
  return out;
}

function link(id, title, url, note) {
  const out = { id, title, url };
  if (note) out.note = note;
  return out;
}

function defaultExternalLinks(topicSlug, topicName) {
  return [
    link(
      `wiki-${topicSlug}`,
      `Wikipedia — ${topicName}`,
      `https://en.wikipedia.org/wiki/${encodeURIComponent(topicName.replace(/ /g, "_"))}`
    ),
  ];
}

function computingMaterials() {
  return [
    {
      name: "Electric power",
      purpose: "Energy for computation, storage, and networking",
      earthLocations: ["Electrical grids globally; generators in remote sites"],
      spaceAlternatives: "Solar + batteries is the simplest early-space pathway; plan for tight energy budgets and thermal rejection.",
      processingRequired: "Stable voltage regulation, grounding, and basic power-quality control.",
    },
    {
      name: "Semiconductor devices",
      purpose: "Transistors and ICs that perform switching, storage, and signal conditioning",
      earthLocations: ["Global semiconductor supply chains; packaged IC distributors"],
      spaceAlternatives: "Early colonies import packaged devices; long-term local manufacture requires clean chemistry and crystal growth capabilities.",
      processingRequired: "ESD-safe handling; correct packaging, heat sinking, and derating for temperature and radiation.",
    },
    {
      name: "Documentation and standards",
      purpose: "Make designs reproducible and debuggable across teams and time",
      earthLocations: ["Libraries, universities, standards bodies, archived web"],
      spaceAlternatives: "Mirror core references offline; maintain printed and digital copies with checksums and redundancy.",
      processingRequired: "Versioning, change control, and clear measurement units and assumptions.",
    },
  ];
}

function scienceMaterials() {
  return [
    {
      name: "Paper and writing media",
      purpose: "Record calculations, assumptions, and experimental outcomes",
      earthLocations: ["Ubiquitous globally"],
      spaceAlternatives: "Digital notes plus printed backups; radiation-safe storage for critical references.",
      processingRequired: "Consistent notation, units, and metadata.",
    },
    {
      name: "Measurement tools",
      purpose: "Quantify reality so models are not guesswork",
      earthLocations: ["Workshops, labs, trade supply"],
      spaceAlternatives: "Prefer multi-use instruments; maintain calibration artifacts and procedures.",
      processingRequired: "Calibration logs and error bounds (uncertainty).",
    },
    {
      name: "Time and attention",
      purpose: "Iterative learning, practice, and verification",
      earthLocations: ["Human labor everywhere"],
      spaceAlternatives: "Training time is a hard constraint; plan curricula and drills early.",
      processingRequired: "Deliberate practice, peer review, and documentation.",
    },
  ];
}

function constructionMaterials() {
  return [
    {
      name: "Water",
      purpose: "Mixing, curing, and dust control",
      earthLocations: ["Rivers, aquifers, municipal supplies"],
      spaceAlternatives: "Closed-loop water recycling; allocate for curing and dust suppression explicitly.",
      processingRequired: "Clean enough to avoid salts/organics that weaken binders.",
    },
    {
      name: "Aggregates (sand, gravel, crushed stone)",
      purpose: "Bulk material and mechanical strength in mortars and concretes",
      earthLocations: ["Riverbeds, quarries, glacial deposits"],
      spaceAlternatives: "Screened regolith can serve as aggregate; watch particle shape, dust, and reactive phases.",
      processingRequired: "Grading (sieving), washing, and removing organics/clays.",
    },
    {
      name: "Heat and kilns",
      purpose: "Calcination and firing for lime, bricks, and cement precursors",
      earthLocations: ["Wood/charcoal/coal; industrial fuels"],
      spaceAlternatives: "Electric kilns powered by solar/nuclear; thermal insulation is critical for energy efficiency.",
      processingRequired: "Temperature control, refractory linings, and safe ventilation.",
    },
  ];
}

function medicineWarnings() {
  return [
    "Contraindications: individual conditions, allergies, pregnancy, age, immune status, and drug interactions change what is safe.",
    "Overdose: dosing errors can cause serious injury or death; do not guess doses or concentrations.",
    "Sterility: infection control and sterile technique are often the difference between healing and harm.",
    "Professional verification is required before use on a human being.",
  ];
}

function ensureAtLeastThreeSources(sources) {
  if (sources.length >= 3) return sources;
  throw new Error(`need >=3 sources, got ${sources.length}`);
}

function makeNode(def) {
  const now = todayIso();
  const ext = def.externalLinks ?? defaultExternalLinks(def.id, def.name);
  const sources = ensureAtLeastThreeSources(def.sources);
  return {
    id: def.id,
    name: def.name,
    tagline: def.tagline,
    category: def.category,
    era: def.era,
    difficulty: def.difficulty,
    prerequisites: def.prerequisites ?? [],
    unlocks: [],
    problem: def.problem,
    overview: def.overview,
    principles: def.principles,
    components: def.components,
    rawMaterials: def.rawMaterials,
    buildSteps: def.buildSteps,
    history: def.history,
    inventors: def.inventors ?? [],
    impact: def.impact,
    images: [],
    videos: [],
    externalLinks: ext.length ? ext : defaultExternalLinks(def.id, def.name),
    lastUpdated: now,
    maturity: def.maturity ?? "stub",
    verification: baseVerification(sources, def.category === "medicine" ? medicineWarnings() : []),
  };
}

const BATCH = [
  {
    id: "germ-theory",
    name: "Germ Theory of Disease",
    tagline: "Explains infection as microbial transmission and makes sanitation, antisepsis, and public health coherent",
    category: "medicine",
    era: "industrial",
    difficulty: 3,
    prerequisites: ["writing-early-systems", "sanitation-and-clean-water"],
    problem: para([
      "Before germ theory, sickness looked like bad air, curses, or spontaneous decay. Those models fail because they cannot explain why washing hands reduces childbirth fever, why boiling water reduces diarrheal disease, or why outbreaks cluster in contact networks.",
      "The practical problem is not philosophy. It is prevention and triage: if you do not know how infection spreads, you cannot reliably protect caregivers, keep wounds clean, manage waste, or design safe water and food systems.",
    ]),
    overview: para([
      "Germ theory states that many diseases are caused by microorganisms that enter the body, multiply, and damage tissues directly or via toxins and immune response. Transmission depends on routes: water, food, droplets, aerosols, surfaces, vectors, and blood.",
      "The theory becomes operational when you can break a transmission chain. That means controlling contamination, separating clean and dirty workflows, improving ventilation, disinfecting surfaces, and using barriers (gloves, masks) when appropriate.",
      "For collapse recovery and space settlement, germ theory is a force multiplier: it turns soap, water, heat, and workflow discipline into lower mortality even without advanced drugs.",
    ]),
    principles: [
      { name: "Transmission routes", explanation: "Pathogens move through specific pathways; controls must match the pathway (water treatment differs from airborne controls)." },
      { name: "Dose and exposure", explanation: "Risk increases with infectious dose and duration of exposure; reducing either can prevent disease." },
      { name: "Asepsis and antisepsis", explanation: "Asepsis prevents introducing microbes; antisepsis reduces microbes present. Both are process disciplines, not a single product." },
    ],
    components: [
      { id: "pathogen", name: "Pathogen (microbe)", function: "Agent that causes disease", position: "In environment or host", madeFrom: "Cells or virions with genetic material" },
      { id: "reservoir", name: "Reservoir and vectors", function: "Holds and transports microbes", position: "Water, humans, animals, surfaces", madeFrom: "Biological and environmental systems" },
      { id: "route", name: "Transmission route", function: "Mechanism that moves microbes to new host", position: "Contact, air, water, food, blood", madeFrom: "Physical pathways" },
      { id: "barriers", name: "Barriers and hygiene", function: "Reduce transfer between dirty and clean", position: "Hands, tools, surfaces", madeFrom: "Soap, water, heat, procedures" },
    ],
    rawMaterials: [
      {
        name: "Clean water",
        purpose: "Hand hygiene, cleaning, and basic disinfection workflows",
        earthLocations: ["Rivers, wells, municipal supplies"],
        spaceAlternatives: "Closed-loop water recycling; allocate water for hygiene as a life-support priority.",
        processingRequired: "Filtration/boiling/chlorination appropriate to contamination risk.",
      },
      {
        name: "Soap or detergents",
        purpose: "Breaks oils and disrupts microbes on skin and surfaces",
        earthLocations: ["Animal/plant fats, lye sources; commercial soap"],
        spaceAlternatives: "Synthesize detergents where chemistry exists; otherwise prioritize soap production from fats and alkali.",
        processingRequired: "Correct formulation and safe handling of caustics during manufacture.",
      },
      {
        name: "Heat (boiling/steam)",
        purpose: "Thermal kill step for water, tools, and some materials",
        earthLocations: ["Fire, charcoal, electricity"],
        spaceAlternatives: "Electric heating and pressure steam sterilization where power allows.",
        processingRequired: "Time-at-temperature discipline; avoid recontamination after heating.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define transmission routes for the environment", description: "Identify likely routes (water, food, contact, airborne) from living conditions, waste handling, and crowding.", prerequisiteTools: ["paper", "basic observation"], warningNote: "Do not assume a single route; multiple routes can operate at once." },
      { order: 2, title: "Separate clean and dirty workflows", description: "Designate clean areas for food and wound care; keep waste handling physically separated with dedicated tools.", prerequisiteTools: ["labels", "containers"], warningNote: "Cross-contamination happens through shared tools and hands." },
      { order: 3, title: "Implement hand hygiene", description: "Use soap and clean water; scrub all surfaces of hands; dry with clean material. Prioritize before eating and wound care.", prerequisiteTools: ["soap", "water"], warningNote: "If water quality is uncertain, treat water used for hand hygiene." },
      { order: 4, title: "Control water and food contamination", description: "Treat drinking water; cook food thoroughly when appropriate; store food in clean containers to prevent recontamination.", prerequisiteTools: ["heat source", "containers"], warningNote: "Boiled water can be recontaminated by dirty vessels." },
      { order: 5, title: "Clean and disinfect high-touch surfaces", description: "Establish routine cleaning; use heat or chemical disinfectants where safe; document what works and what fails.", prerequisiteTools: ["cleaning tools"], warningNote: "Some chemicals create toxic fumes; ventilate and avoid mixing cleaners." },
    ],
    history: [
      { year: "1840s", event: "Handwashing and hygiene reduce puerperal fever in clinics.", location: "Europe" },
      { year: "1860s", event: "Antiseptic surgery practices demonstrate infection control benefits.", location: "UK" },
      { year: "1880s", event: "Bacteriology links specific microbes to specific diseases.", location: "Global" },
    ],
    inventors: [
      { name: "Ignaz Semmelweis", contribution: "Demonstrated hand hygiene impact in clinical practice", years: "1818-1865", nationality: "Hungarian" },
      { name: "Louis Pasteur", contribution: "Work on fermentation and microbes supports germ theory", years: "1822-1895", nationality: "French" },
    ],
    impact: para([
      "Germ theory changed civilization by making prevention possible: sanitation, clean water, safe food, and safer childbirth. It also changed the design of institutions: hospitals, laboratories, and public health agencies.",
      "In the Codex context it is foundational because it upgrades many low-tech tools (soap, water, heat) into high-leverage health outcomes when applied with correct process discipline.",
    ]),
    sources: [
      src("who-ipc", "WHO: Infection prevention and control", "institution", "https://www.who.int/teams/integrated-health-services/infection-prevention-control"),
      src("cdc-hand-hygiene", "CDC: Hand Hygiene in Healthcare Settings", "institution", "https://www.cdc.gov/handhygiene/"),
      src("wiki-germ-theory", "Wikipedia — Germ theory of disease", "wikipedia", "https://en.wikipedia.org/wiki/Germ_theory_of_disease"),
    ],
  },

  {
    id: "lime-production",
    name: "Lime Production (Calcination of Limestone)",
    tagline: "Turns limestone into quicklime and slaked lime for mortars, plasters, and early cement chemistry",
    category: "materials",
    era: "ancient",
    difficulty: 3,
    prerequisites: ["fire", "ceramics-and-pottery", "charcoal"],
    problem: para([
      "Stone and mud structures fail in rain and time: joints wash out, surfaces erode, and weak binders crack. You can stack rocks, but without a binder you cannot reliably build thin walls, arches, or durable plastered interiors.",
      "Lime provides a scalable binder and finish. The problem it solves is a repeatable chemistry that turns loose aggregates into a coherent mass and protects surfaces from water and abrasion.",
    ]),
    overview: para([
      "Lime is produced by heating limestone (calcium carbonate) to drive off carbon dioxide, leaving quicklime (calcium oxide). Adding water produces slaked lime (calcium hydroxide). Mixed with sand, slaked lime becomes lime mortar or plaster.",
      "Lime mortars cure primarily by carbonation: calcium hydroxide reacts with CO2 from air to reform calcium carbonate. This makes curing slow but durable when protected from rapid drying and freezing.",
      "For recovery, lime is a bridge binder before industrial Portland cement. It also teaches kiln control, safety around caustics, and moisture management in construction.",
    ]),
    principles: [
      { name: "Calcination", explanation: "Heating carbonates drives off CO2, changing mineral phase and reactivity." },
      { name: "Hydration", explanation: "Quicklime reacts exothermically with water to form slaked lime; process control prevents burns and spatter." },
      { name: "Carbonation curing", explanation: "Lime mortars harden by absorbing CO2 over time; airflow and humidity control matter." },
    ],
    components: [
      { id: "kiln", name: "Kiln", function: "Provides sustained high temperature for calcination", position: "Firing site", madeFrom: "Refractory bricks/stone, insulation" },
      { id: "feedstock", name: "Limestone feedstock", function: "Carbonate source", position: "Kiln charge", madeFrom: "CaCO3-rich rock" },
      { id: "fuel", name: "Fuel and airflow", function: "Heat generation and combustion control", position: "Kiln firebox", madeFrom: "Charcoal/wood plus draft control" },
      { id: "slaking", name: "Slaking pit", function: "Controlled hydration of quicklime", position: "Near kiln", madeFrom: "Stone/brick-lined pit, water" },
    ],
    rawMaterials: [
      { ...constructionMaterials()[0] },
      {
        name: "Limestone (calcium carbonate)",
        purpose: "Primary feedstock for quicklime and slaked lime",
        earthLocations: ["Sedimentary limestone regions worldwide"],
        spaceAlternatives: "Lunar regolith contains calcium-bearing minerals but not abundant limestone; early space binders often rely on sintering/regolith cement or imported binders.",
        processingRequired: "Crush to manageable size; keep dry before firing; avoid clay-heavy impurities when possible.",
      },
      { ...constructionMaterials()[2] },
    ],
    buildSteps: [
      { order: 1, title: "Select limestone and fuel", description: "Choose carbonate-rich stone; prepare fuel and draft path to sustain high temperatures for hours.", prerequisiteTools: ["hammer", "sorting"], warningNote: "Lime dust is caustic; plan PPE and eye protection early." },
      { order: 2, title: "Build or refurbish a kiln", description: "Use refractory materials; ensure airflow path and safe loading/unloading; include a way to control draft.", prerequisiteTools: ["masonry tools"], warningNote: "Kiln failures can collapse hot material; keep clear zones." },
      { order: 3, title: "Fire to calcination", description: "Heat the kiln charge until calcination occurs; track time and fuel additions; let cool before handling.", prerequisiteTools: ["tongs", "thermal judgment"], warningNote: "Hot quicklime reacts violently with water; keep it dry during cooling." },
      { order: 4, title: "Slake quicklime safely", description: "Add water in a controlled pit; allow reaction to complete; age slaked lime for improved workability.", prerequisiteTools: ["containers", "stirring paddles"], warningNote: "Exothermic reaction can boil water and spatter caustic slurry." },
      { order: 5, title: "Mix lime mortar or plaster", description: "Combine slaked lime with graded sand; adjust water; keep mixes damp while curing to avoid cracking.", prerequisiteTools: ["mixing tools"], warningNote: "Avoid skin contact; lime can burn and damage eyes." },
    ],
    history: [
      { year: "Ancient", event: "Lime mortars used in masonry and plaster in multiple civilizations.", location: "Mediterranean, Asia, Americas" },
      { year: "Roman era", event: "Hydraulic lime and pozzolanic additives enable durable concrete-like structures.", location: "Roman Empire" },
      { year: "Industrial era", event: "Portland cement displaces many lime applications but lime remains essential.", location: "Global" },
    ],
    impact: para([
      "Lime enabled durable masonry, plastered interiors, and improved sanitation via washable surfaces. It also enabled early concrete chemistry with pozzolans and careful curing.",
      "In the long tech tree, lime is a binder that unlocks better kilns, better buildings, and eventually modern cement and concrete systems.",
    ]),
    sources: [
      src("usgs-lime", "USGS: Lime (mineral commodity summaries / background)", "institution", "https://www.usgs.gov/centers/national-minerals-information-center/lime-statistics-and-information"),
      src("wiki-calcium-oxide", "Wikipedia — Calcium oxide", "wikipedia", "https://en.wikipedia.org/wiki/Calcium_oxide"),
      src("britannica-lime", "Encyclopaedia Britannica — Lime", "institution", "https://www.britannica.com/science/lime"),
    ],
  },

  {
    id: "bricks-and-fired-masonry",
    name: "Bricks and Fired Masonry",
    tagline: "Standardized fired units for durable construction and kilns",
    category: "construction",
    era: "ancient",
    difficulty: 2,
    prerequisites: ["ceramics-and-pottery", "fire"],
    problem: para([
      "Unfired mud and irregular stone limit what you can build: walls erode in rain, joints shift, and repairs consume labor. Civilization needs repeatable structural units that can be produced in volume and assembled by many hands.",
      "Fired bricks solve the repeatability problem. Standard sizes make arches, vaults, and kilns practical, and they enable durable urban infrastructure when timber or quality stone is scarce.",
    ]),
    overview: para([
      "Brickmaking shapes clay-rich mixes into consistent blocks, dries them to remove water, then fires them to sinter minerals into a hard ceramic. The firing schedule matters: too cold and bricks remain weak; too hot and they vitrify or slump.",
      "For recovery, bricks also bootstrap industry: better kilns enable better ceramics, lime, glass, and metal heat-treatment. Bricks are both a building material and a manufacturing enabler.",
    ]),
    principles: [
      { name: "Drying and shrinkage", explanation: "Water removal shrinks clay; controlled drying prevents cracking and warping." },
      { name: "Sintering", explanation: "Firing bonds particles into a strong ceramic without fully melting the body." },
      { name: "Thermal gradients", explanation: "Uneven heating creates stress; kiln design and stacking reduce gradients." },
    ],
    components: [
      { id: "clay-body", name: "Clay body and temper", function: "Forms the brick matrix", position: "Brick interior", madeFrom: "Clay plus sand/grog/straw depending on recipe" },
      { id: "mold", name: "Mold or press", function: "Standardizes size and shape", position: "Forming station", madeFrom: "Wood or metal frames" },
      { id: "drying", name: "Drying racks", function: "Air-dry green bricks", position: "Sheltered airflow area", madeFrom: "Wood frames, mats" },
      { id: "kiln", name: "Brick kiln", function: "Fires bricks to strength", position: "Firing site", madeFrom: "Temporary clamp or permanent kiln" },
    ],
    rawMaterials: [
      {
        name: "Clay-rich soil",
        purpose: "Primary ceramic feedstock",
        earthLocations: ["Riverbanks, floodplains, clay pits"],
        spaceAlternatives: "Regolith-based ceramics are plausible with binders and controlled sintering; early bricks may rely on sintered regolith blocks.",
        processingRequired: "Screen stones; adjust moisture; add temper to reduce cracking.",
      },
      {
        name: "Temper (sand, grog, ash, straw)",
        purpose: "Controls shrinkage and cracking; improves handling",
        earthLocations: ["Sand deposits; crushed fired ceramics; plant fibers"],
        spaceAlternatives: "Screened regolith grains can serve as temper; keep dust under control.",
        processingRequired: "Sieve to consistent grain size; pre-dry organic tempers.",
      },
      { ...constructionMaterials()[2] },
    ],
    buildSteps: [
      { order: 1, title: "Prepare clay body", description: "Screen and knead clay; add temper until the mix forms without slumping or cracking on bending tests.", prerequisiteTools: ["sieves", "mixing pit"], warningNote: "Silica dust from dry materials is hazardous; dampen and ventilate." },
      { order: 2, title: "Mold bricks", description: "Use a consistent mold; pack firmly; strike off excess; demold onto drying boards.", prerequisiteTools: ["molds", "boards"], warningNote: "Inconsistent compaction causes weak bricks." },
      { order: 3, title: "Dry slowly", description: "Dry under shade with airflow; flip bricks; avoid direct sun or wind that dries one face too fast.", prerequisiteTools: ["racks", "tarps"], warningNote: "Fast drying cracks bricks; cracked bricks fail in walls." },
      { order: 4, title: "Fire to target hardness", description: "Stack to allow airflow; ramp temperature; hold; cool gradually. Keep a log for repeatability.", prerequisiteTools: ["kiln", "fuel"], warningNote: "Kilns are fire hazards; establish clear zones and extinguishing." },
      { order: 5, title: "Sort and test", description: "Reject underfired or cracked units; do simple ring and drop tests; keep best bricks for kilns and load-bearing work.", prerequisiteTools: ["basic test protocol"], warningNote: "Do not use weak bricks in structural arches or tall walls." },
    ],
    history: [
      { year: "Ancient", event: "Fired bricks enable durable urban construction in multiple regions.", location: "Mesopotamia, Indus, China" },
      { year: "Roman era", event: "Standardized brick and tile systems scale construction.", location: "Roman Empire" },
      { year: "Industrial era", event: "Mechanized presses and continuous kilns increase consistency.", location: "Global" },
    ],
    impact: para([
      "Bricks allow standardized construction, durable drainage, and scalable kilns. They also reduce reliance on large timber or high-quality stone.",
      "In the tech tree, bricks are a platform technology for higher-temperature processes: lime, glass, and metallurgy improve when kilns become reliable.",
    ]),
    sources: [
      src("wiki-brick", "Wikipedia — Brick", "wikipedia", "https://en.wikipedia.org/wiki/Brick"),
      src("britannica-brick", "Encyclopaedia Britannica — Brick", "institution", "https://www.britannica.com/technology/brick"),
      src("nps-brickwork", "NPS Preservation Brief 2: Repointing Mortar Joints in Historic Masonry Buildings", "institution", "https://www.nps.gov/orgs/1739/preservation-briefs.htm", "See Brief 2 for masonry mortar context and failure modes"),
    ],
  },

  {
    id: "concrete-portland-cement",
    name: "Concrete and Portland Cement",
    tagline: "Hydraulic binders and aggregates for modern structural construction",
    category: "construction",
    era: "industrial",
    difficulty: 4,
    prerequisites: ["lime-production", "bricks-and-fired-masonry"],
    problem: para([
      "Lime mortars cure slowly and weaken in wet conditions without careful design. Large infrastructure needs a binder that hardens in water, develops predictable strength, and can be poured into forms to create complex shapes.",
      "Concrete solves that by combining aggregates with a hydraulic cement that reacts with water to form strength-giving mineral phases. The challenge is quality control: cement chemistry, aggregate grading, water ratio, and curing dominate outcomes.",
    ]),
    overview: para([
      "Portland cement is produced by heating limestone and clay to form clinker, then grinding clinker with gypsum. Mixed with water, cement hydrates to form calcium silicate hydrates that bind aggregates into a stone-like composite.",
      "Concrete performance depends on mix design and curing. Too much water makes it weak and porous; too little prevents full hydration. Proper curing retains moisture and moderates temperature to prevent cracking and shrinkage failures.",
      "In space contexts, cement chemistry may be constrained by feedstocks and water budget; alternatives include sulfur concrete, geopolymer binders, and sintered regolith depending on site resources.",
    ]),
    principles: [
      { name: "Hydraulic hydration", explanation: "Cement reacts with water to form binding phases; reaction rate depends on temperature and water availability." },
      { name: "Water-cement ratio", explanation: "Strength and permeability correlate strongly with water-to-cement ratio; excess water leaves pores." },
      { name: "Aggregate grading", explanation: "A well-graded aggregate reduces voids and cement demand while improving strength." },
    ],
    components: [
      { id: "cement", name: "Cement binder", function: "Provides hydraulic binding", position: "Paste matrix", madeFrom: "Clinker ground with gypsum" },
      { id: "aggregate", name: "Aggregates", function: "Provide bulk and compressive strength", position: "Distributed in paste", madeFrom: "Sand, gravel, crushed stone" },
      { id: "water", name: "Mix water", function: "Hydrates cement and provides workability", position: "Paste", madeFrom: "Clean water" },
      { id: "forms", name: "Forms and reinforcement (when used)", function: "Shapes concrete; carries tension if reinforced", position: "Around/within pour", madeFrom: "Wood/steel forms; steel rebar" },
    ],
    rawMaterials: [
      { ...constructionMaterials()[0] },
      { ...constructionMaterials()[1] },
      {
        name: "Limestone and clay",
        purpose: "Feedstock for clinker chemistry",
        earthLocations: ["Sedimentary limestone; clay deposits worldwide"],
        spaceAlternatives: "Likely replaced by alternative binders early; long-term production depends on calcium, silica, alumina feedstocks and high-temperature kilns.",
        processingRequired: "Crush, proportion, and heat to clinker temperatures; then grind consistently.",
      },
      {
        name: "Gypsum",
        purpose: "Controls cement set time",
        earthLocations: ["Evaporite deposits globally"],
        spaceAlternatives: "Set control may require alternative additives depending on binder chemistry.",
        processingRequired: "Grind and proportion accurately; avoid moisture contamination.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Prepare aggregates", description: "Sieve and wash aggregates; remove clay, organics, and salts that weaken the bond.", prerequisiteTools: ["sieves", "washing"], warningNote: "Silica dust is hazardous; control dust during dry handling." },
      { order: 2, title: "Prepare binder", description: "Use known cement or produce clinker then grind; store dry; document proportions for repeatability.", prerequisiteTools: ["grinder", "storage"], warningNote: "Cement dust irritates lungs and eyes; use PPE." },
      { order: 3, title: "Mix with controlled water ratio", description: "Measure water and cement; mix to consistent workability; avoid adding water to 'fix' poor mixes.", prerequisiteTools: ["measuring containers", "mixing tools"], warningNote: "Over-watering is a silent strength killer." },
      { order: 4, title: "Place and compact", description: "Fill forms in lifts; compact to remove air; protect embedded reinforcement from movement.", prerequisiteTools: ["tampers", "vibration if available"], warningNote: "Forms can fail under pressure; brace and inspect." },
      { order: 5, title: "Cure", description: "Keep concrete damp and protected; avoid rapid drying; control temperature where possible.", prerequisiteTools: ["tarps", "water"], warningNote: "Early drying causes cracks and weak surfaces." },
    ],
    history: [
      { year: 1824, event: "Portland cement patent (Aspdin) and later industrial standardization.", location: "UK" },
      { year: "1900s", event: "Reinforced concrete scales bridges, buildings, and infrastructure.", location: "Global" },
      { year: "Late 20th", event: "Modern admixtures and quality control improve performance.", location: "Global" },
    ],
    impact: para([
      "Concrete enables durable roads, bridges, foundations, and water infrastructure. It also concentrates risk: poor design or curing creates catastrophic failures.",
      "For civilization bootstrap, concrete is a major inflection point because it unlocks large-scale safe habitats, transport corridors, and industrial floors that support advanced manufacturing.",
    ]),
    sources: [
      src("pci-what-is-concrete", "Portland Cement Association: What is Concrete?", "institution", "https://www.cement.org/learn/concrete-technology/what-is-concrete"),
      src("wiki-portland-cement", "Wikipedia — Portland cement", "wikipedia", "https://en.wikipedia.org/wiki/Portland_cement"),
      src("nih-concrete-dust", "NIOSH: Silica (crystalline) hazard guidance", "institution", "https://www.cdc.gov/niosh/topics/silica/default.html"),
    ],
  },

  // --- AI and computing chain (high-level, safety-first, not a substitute for formal education) ---

  {
    id: "stored-program-computer",
    name: "Stored-Program Computer",
    tagline: "General-purpose computation by executing instructions from memory",
    category: "computing",
    era: "mid-20th",
    difficulty: 5,
    prerequisites: ["vacuum-tube-electronics", "electrical-power-grid", "writing-early-systems"],
    problem: para([
      "Special-purpose machines solve one task at a time. Civilization needs a machine that can be reconfigured by changing instructions rather than rebuilding hardware.",
      "The stored-program concept solves that by placing both data and instructions in addressable memory, allowing complex logic, automation, and later software ecosystems.",
    ]),
    overview: para([
      "A stored-program computer has a processor that fetches instructions from memory, decodes them, and executes operations on data. The instruction stream is itself data that can be changed, stored, and copied.",
      "In practice, the architecture requires reliable memory, deterministic clocking, and input/output interfaces. For bootstrap scenarios, the key insight is modularity: arithmetic, storage, and control are separable subsystems.",
    ]),
    principles: [
      { name: "Boolean logic", explanation: "Complex computation is built from simple logical operations and state." },
      { name: "Addressable memory", explanation: "A mapping from numeric addresses to stored values enables programs and data structures." },
      { name: "Fetch-decode-execute cycle", explanation: "A repeating control loop turns static circuits into dynamic behavior." },
    ],
    components: [
      { id: "cpu", name: "Processor (CPU)", function: "Executes instructions and controls dataflow", position: "Central unit", madeFrom: "Logic gates, registers, control circuits" },
      { id: "memory", name: "Memory", function: "Stores instructions and data", position: "Attached to CPU", madeFrom: "Early: relays/tubes; later: transistors/ICs" },
      { id: "io", name: "Input/Output", function: "Moves data into and out of the machine", position: "Peripherals", madeFrom: "Interfaces, cables, transducers" },
      { id: "clock", name: "Clock and timing", function: "Coordinates state changes", position: "System timing", madeFrom: "Oscillators and distribution" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Precision manufacturing",
        purpose: "Reliable interconnects, insulation, and repeatable assemblies",
        earthLocations: ["Machine shops; electronics manufacturing"],
        spaceAlternatives: "Prefer modular boards and spares early; long-term: local PCB fabrication and controlled soldering/reflow environments.",
        processingRequired: "Quality control, rework capability, and test instrumentation.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define a minimal instruction set", description: "Choose basic operations (load, store, add, branch). Keep it simple enough to implement and test.", prerequisiteTools: ["paper", "logic design"], warningNote: "Complexity kills reproducibility; start with minimal cores." },
      { order: 2, title: "Implement arithmetic and registers", description: "Build adders, registers, and buses; validate with test vectors.", prerequisiteTools: ["multimeter", "oscilloscope if available"], warningNote: "Debugging without tests becomes guesswork." },
      { order: 3, title: "Add memory and address decoding", description: "Provide read/write memory and reliable addressing; verify timing margins.", prerequisiteTools: ["logic probe"], warningNote: "Memory timing violations produce intermittent failures." },
      { order: 4, title: "Add control unit", description: "Implement fetch/decode/execute sequencing; validate branching and loops.", prerequisiteTools: ["test programs"], warningNote: "Control bugs can masquerade as arithmetic faults." },
      { order: 5, title: "Add I/O and bootstrap loader", description: "Enable loading programs; add a small monitor program for diagnostics.", prerequisiteTools: ["I/O device"], warningNote: "Without diagnostics, every change is a full rebuild." },
    ],
    history: [
      { year: "1940s", event: "Stored-program ideas formalize and early machines demonstrate feasibility.", location: "USA/UK" },
      { year: "1950s", event: "General-purpose computers spread into science and industry.", location: "Global" },
      { year: "1970s+", event: "Microprocessors and software ecosystems scale computing.", location: "Global" },
    ],
    impact: para([
      "Stored-program computers enable software-defined behavior: the same hardware can simulate, control machinery, manage logistics, and communicate knowledge.",
      "In the Codex context, computing is a civilization accelerant but also a dependency cliff: it requires power quality, precise manufacturing, and disciplined documentation.",
    ]),
    sources: [
      src("wiki-von-neumann-arch", "Wikipedia — von Neumann architecture", "wikipedia", "https://en.wikipedia.org/wiki/Von_Neumann_architecture"),
      src("turing1936", "Turing (1936) — On Computable Numbers", "paper", "https://doi.org/10.1112/plms/s2-42.1.230", "Foundational theory for general computation"),
      src("nist-computing", "NIST Computer Security Resource Center (for systems perspective)", "institution", "https://csrc.nist.gov/", "Institutional reference for modern computing concerns"),
    ],
  },

  {
    id: "machine-learning",
    name: "Machine Learning",
    tagline: "Learns patterns from data to make predictions and decisions",
    category: "computing",
    era: "late-20th",
    difficulty: 5,
    prerequisites: ["stored-program-computer", "linear-algebra", "probability-and-statistics", "calculus-and-optimization"],
    problem: para([
      "Hand-written rules break when environments are messy, high-dimensional, or partially observed. Many problems cannot be solved by enumerating if-then logic.",
      "Machine learning reframes the problem: choose a model family and fit parameters from data so the system generalizes to new cases. The hard part is not training; it is avoiding false confidence, bias, and overfitting.",
    ]),
    overview: para([
      "A learning pipeline selects data, defines an objective (loss), and uses optimization to fit parameters. Performance is judged on held-out data and against baseline methods.",
      "Real deployments require monitoring and iteration: data drifts, labels are noisy, and correlations fail under regime change. The Codex treats this as an engineering discipline, not a one-time training run.",
    ]),
    principles: [
      { name: "Generalization", explanation: "The goal is performance on unseen data; training accuracy alone is not enough." },
      { name: "Bias-variance tradeoff", explanation: "Model capacity affects underfitting vs overfitting; regularization and data volume shift the balance." },
      { name: "Evaluation discipline", explanation: "Train/validation/test splits and error analysis prevent self-deception." },
    ],
    components: [
      { id: "data", name: "Dataset", function: "Provides examples for learning", position: "Input", madeFrom: "Measurements, text, images, logs" },
      { id: "model", name: "Model family", function: "Maps inputs to outputs", position: "Core algorithm", madeFrom: "Parameters and structure" },
      { id: "loss", name: "Loss function", function: "Defines objective to optimize", position: "Training loop", madeFrom: "Math definition" },
      { id: "optimizer", name: "Optimizer", function: "Adjusts parameters to reduce loss", position: "Training loop", madeFrom: "Gradient-based methods or others" },
      { id: "evaluation", name: "Evaluation harness", function: "Measures performance and failure modes", position: "Testing", madeFrom: "Metrics, datasets, reports" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Training data",
        purpose: "Examples that encode the target task",
        earthLocations: ["Sensors, documents, logs, human annotations"],
        spaceAlternatives: "Data is a scarce resource early off-world; simulate where possible and design experiments to generate labeled data safely.",
        processingRequired: "Cleaning, labeling, privacy/safety review, and dataset versioning.",
      },
      {
        name: "Compute time",
        purpose: "Optimization over large datasets and model parameters",
        earthLocations: ["CPUs/GPUs/TPUs in data centers"],
        spaceAlternatives: "Prefer smaller models and task-specific systems early; schedule training around power availability and thermal limits.",
        processingRequired: "Thermal management, job scheduling, and checkpointing.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define the task and metrics", description: "Specify inputs/outputs and what success means. Choose metrics and baseline approaches.", prerequisiteTools: ["problem statement", "metrics"], warningNote: "Bad metrics create models that optimize the wrong thing." },
      { order: 2, title: "Collect and version data", description: "Gather representative data; record provenance; split into train/validation/test sets.", prerequisiteTools: ["storage", "version control"], warningNote: "Leakage between splits produces fake performance." },
      { order: 3, title: "Choose model and objective", description: "Start simple; pick loss; add regularization. Document assumptions.", prerequisiteTools: ["math references"], warningNote: "More complexity without data and evaluation increases risk." },
      { order: 4, title: "Train with monitoring", description: "Track loss/metrics; detect overfitting; tune hyperparameters cautiously.", prerequisiteTools: ["compute", "monitoring"], warningNote: "If training is unstable, reduce learning rate or simplify." },
      { order: 5, title: "Evaluate and stress-test", description: "Run on held-out tests; do error analysis; test for distribution shift and edge cases.", prerequisiteTools: ["evaluation harness"], warningNote: "Do not deploy without understanding failures." },
      { order: 6, title: "Deploy with feedback", description: "Monitor drift; retrain responsibly; keep a rollback plan.", prerequisiteTools: ["deployment pipeline"], warningNote: "Unmonitored models can silently degrade." },
    ],
    history: [
      { year: "1950s-60s", event: "Early statistical learning and perceptron era.", location: "Global" },
      { year: "1990s", event: "Statistical learning theory and practical ML expand.", location: "Global" },
      { year: "2010s", event: "Deep learning and large datasets drive major capability jumps.", location: "Global" },
    ],
    impact: para([
      "Machine learning automates pattern recognition and prediction across science, industry, and communication. It also concentrates power and risk: biased data and opaque models can cause real harm at scale.",
      "For The Codex, ML is a late-tree capability that depends on stable computing infrastructure and disciplined measurement, but it can accelerate discovery when used responsibly.",
    ]),
    sources: [
      src("bishop-prml", "Bishop — Pattern Recognition and Machine Learning", "book", null),
      src("hastie-esl", "Hastie, Tibshirani, Friedman — The Elements of Statistical Learning", "book", null),
      src("wiki-ml", "Wikipedia — Machine learning", "wikipedia", "https://en.wikipedia.org/wiki/Machine_learning"),
    ],
  },

  {
    id: "transformer-models",
    name: "Transformer Models",
    tagline: "Sequence modeling with attention mechanisms that scale to large datasets",
    category: "computing",
    era: "21st-century",
    difficulty: 5,
    prerequisites: ["machine-learning", "neural-networks", "backpropagation", "gpu-accelerated-computing"],
    problem: para([
      "Many tasks require modeling long-range dependencies in sequences: language, code, and time series. Earlier architectures struggle with long contexts, training instability, and limited parallelism.",
      "Transformers solve this by using attention to connect tokens directly and by enabling highly parallel training on modern accelerators.",
    ]),
    overview: para([
      "A transformer encodes tokens into vectors, applies self-attention to mix information across positions, then uses feed-forward layers and residual connections to build deep representations. Training typically uses gradient descent with backpropagation on large corpora.",
      "Scaling behavior depends on data, compute, and optimization. The Codex treats the training recipe as part of the technology: tokenization, objective choice, evaluation, and safety constraints are not optional extras.",
    ]),
    principles: [
      { name: "Self-attention", explanation: "Computes weighted combinations of token representations based on content similarity." },
      { name: "Residual learning", explanation: "Skip connections stabilize deep networks and preserve gradient flow." },
      { name: "Parallel training", explanation: "Attention layers enable parallel computation across sequence positions, improving throughput." },
    ],
    components: [
      { id: "tokenizer", name: "Tokenizer", function: "Maps text to token IDs", position: "Input pipeline", madeFrom: "Vocabulary and rules" },
      { id: "embedding", name: "Embeddings", function: "Convert tokens to vectors", position: "Model input", madeFrom: "Learned matrices" },
      { id: "attention", name: "Attention blocks", function: "Mix information across tokens", position: "Model core", madeFrom: "Q/K/V projections" },
      { id: "ffn", name: "Feed-forward layers", function: "Nonlinear transformation per position", position: "Inside blocks", madeFrom: "Linear layers and activations" },
      { id: "training", name: "Training pipeline", function: "Optimizes model parameters", position: "Outside model", madeFrom: "Loss, optimizer, schedules" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Large-scale datasets",
        purpose: "Training data for language, code, or other sequences",
        earthLocations: ["Public web corpora, code repositories, curated datasets"],
        spaceAlternatives: "Early off-world: limited corpora; rely on curated technical manuals and local logs; avoid unsafe or low-quality data sources.",
        processingRequired: "Deduplication, filtering, licensing review, and safety red-teaming.",
      },
      {
        name: "Accelerated compute (GPUs/TPUs)",
        purpose: "Efficient training and inference for large models",
        earthLocations: ["Data centers and HPC clusters"],
        spaceAlternatives: "Power/thermal limits force smaller models; prioritize efficiency and distillation.",
        processingRequired: "Cooling, power delivery, cluster networking, and monitoring.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define objective and dataset", description: "Choose language modeling or task-specific training; curate data with provenance and safety filters.", prerequisiteTools: ["data pipeline"], warningNote: "Data quality dominates model behavior." },
      { order: 2, title: "Choose architecture and scale", description: "Pick model size to match compute/data; start smaller to validate pipeline and evaluation.", prerequisiteTools: ["compute budget"], warningNote: "Scaling without evaluation produces expensive confusion." },
      { order: 3, title: "Train with checkpointing", description: "Train with stable optimization settings; checkpoint frequently; log metrics and samples.", prerequisiteTools: ["accelerators", "storage"], warningNote: "Without checkpoints, failures waste weeks of compute." },
      { order: 4, title: "Evaluate and red-team", description: "Measure performance; probe for hallucinations, bias, and unsafe behaviors; iterate on data and constraints.", prerequisiteTools: ["eval suite"], warningNote: "Do not rely on single benchmark scores." },
      { order: 5, title: "Deploy with monitoring and limits", description: "Add guardrails; monitor for drift; document known failure modes.", prerequisiteTools: ["deployment"], warningNote: "Unbounded deployment can cause real-world harm." },
    ],
    history: [
      { year: 2017, event: "Transformer architecture introduced for sequence modeling.", location: "Global" },
      { year: "2018-2020", event: "Large-scale pretraining demonstrates broad transfer.", location: "Global" },
      { year: "2020s", event: "Systems engineering for training/inference becomes central.", location: "Global" },
    ],
    impact: para([
      "Transformers enable strong performance across language and perception tasks and make large-scale model training a systems engineering discipline. They also raise new governance and safety problems due to capability concentration.",
      "In The Codex tree, transformers sit near the top of the computing branch: they require stable compute, data, evaluation rigor, and safety processes to be useful rather than dangerous.",
    ]),
    sources: [
      src("vaswani-attention", "Vaswani et al. (2017) — Attention Is All You Need", "paper", "https://arxiv.org/abs/1706.03762"),
      src("goodfellow-dl", "Goodfellow, Bengio, Courville — Deep Learning", "book", "https://www.deeplearningbook.org/"),
      src("wiki-transformer", "Wikipedia — Transformer (machine learning model)", "wikipedia", "https://en.wikipedia.org/wiki/Transformer_(machine_learning_model)"),
    ],
  },

  // Foundational math nodes used by AI chain.
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    tagline: "Vectors, matrices, and transformations that power mechanics, electricity, and machine learning",
    category: "science",
    era: "industrial",
    difficulty: 4,
    prerequisites: ["writing-early-systems", "paper-and-ink-media"],
    problem: para([
      "As systems grow, scalar arithmetic stops scaling. Forces, currents, measurements, and signals are often multidimensional and coupled. Without a language for vectors and linear transforms, you cannot design or diagnose complex systems reliably.",
      "Linear algebra provides that language and enables computation at scale: solving simultaneous equations, projecting data, and representing transformations compactly.",
    ]),
    overview: para([
      "Linear algebra studies vector spaces and linear maps. Matrices represent transformations; eigenvalues describe characteristic modes; decompositions turn messy problems into stable computations.",
      "In engineering and AI, linear algebra is the substrate: sensor fusion, state estimation, circuit analysis, and neural network layers are matrix operations with constraints and numerical stability concerns.",
    ]),
    principles: [
      { name: "Vector spaces", explanation: "A set of objects with addition and scaling; coordinates are representations, not the thing itself." },
      { name: "Linear maps", explanation: "Transformations that preserve addition and scaling; representable as matrices in a basis." },
      { name: "Decompositions", explanation: "Factorizations (LU/QR/SVD) solve systems and reveal structure; stability matters more than elegance." },
    ],
    components: [
      { id: "vectors", name: "Vectors", function: "Represent multi-dimensional quantities", position: "Math model", madeFrom: "Lists of numbers" },
      { id: "matrices", name: "Matrices", function: "Represent linear transforms", position: "Math model", madeFrom: "2D arrays of numbers" },
      { id: "solvers", name: "Solvers", function: "Compute solutions to linear systems", position: "Computation", madeFrom: "Algorithms and numerical methods" },
    ],
    rawMaterials: [
      ...scienceMaterials(),
      ...computingMaterials().slice(0, 1),
    ],
    buildSteps: [
      { order: 1, title: "Learn matrix operations with physical meaning", description: "Connect vectors to forces/currents and matrices to coupled equations; avoid purely symbolic memorization.", prerequisiteTools: ["paper", "examples"], warningNote: "Unit mistakes mimic math mistakes; track units." },
      { order: 2, title: "Practice solving linear systems", description: "Use elimination and stable decompositions; verify with residual checks.", prerequisiteTools: ["calculator or computer"], warningNote: "Ill-conditioned systems amplify errors." },
      { order: 3, title: "Use decompositions for stability", description: "Prefer QR/SVD for least squares and noisy data; document assumptions.", prerequisiteTools: ["numerical tools"], warningNote: "Naive inversion is often a bug." },
    ],
    history: [
      { year: "1800s", event: "Matrix methods and determinants formalize for physics and engineering.", location: "Europe" },
      { year: "1900s", event: "Numerical linear algebra becomes central to computing.", location: "Global" },
      { year: "2000s", event: "Linear algebra accelerates data science and ML.", location: "Global" },
    ],
    impact: para([
      "Linear algebra is the grammar of modern engineering: it turns coupled systems into solvable forms and enables scalable computation.",
      "In The Codex, it is a cross-cutting prerequisite node: mechanics, electricity, navigation, and AI all lean on it.",
    ]),
    sources: [
      src("strang-la", "Strang — Introduction to Linear Algebra", "book", null),
      src("trefethen-bau", "Trefethen & Bau — Numerical Linear Algebra", "book", null),
      src("wiki-linear-algebra", "Wikipedia — Linear algebra", "wikipedia", "https://en.wikipedia.org/wiki/Linear_algebra"),
    ],
  },

  {
    id: "probability-and-statistics",
    name: "Probability and Statistics",
    tagline: "Reasoning under uncertainty for measurement, decisions, and learning from data",
    category: "science",
    era: "industrial",
    difficulty: 4,
    prerequisites: ["writing-early-systems", "paper-and-ink-media"],
    problem: para([
      "Real measurements are noisy and incomplete. Without a framework for uncertainty, you cannot distinguish signal from coincidence or design robust systems that survive variation.",
      "Probability models uncertainty; statistics turns observations into estimates with error bars. This is central to medicine, engineering safety, and machine learning.",
    ]),
    overview: para([
      "Probability assigns models to random variables and events; statistics uses data to fit models, test hypotheses, and estimate parameters. The discipline is as much about avoiding self-deception as it is about formulas.",
      "For AI, statistics governs generalization, evaluation, and calibration. For physical systems, it governs tolerances, reliability, and risk management.",
    ]),
    principles: [
      { name: "Random variables", explanation: "Model uncertain quantities; distributions encode plausible ranges and likelihoods." },
      { name: "Estimation", explanation: "Infer parameters from data with bias/variance tradeoffs and confidence intervals." },
      { name: "Hypothesis testing", explanation: "Evaluate evidence; interpret p-values and effect sizes carefully to avoid false certainty." },
    ],
    components: [
      { id: "distribution", name: "Distributions", function: "Model variability", position: "Math model", madeFrom: "Probability functions" },
      { id: "sampling", name: "Sampling", function: "Connect models to observed data", position: "Data collection", madeFrom: "Experimental design" },
      { id: "inference", name: "Inference methods", function: "Estimate and test", position: "Analysis", madeFrom: "Algorithms and assumptions" },
    ],
    rawMaterials: [
      ...scienceMaterials(),
      ...computingMaterials().slice(0, 1),
    ],
    buildSteps: [
      { order: 1, title: "Define uncertainty explicitly", description: "Write what is random, what is fixed, and what you assume about noise.", prerequisiteTools: ["paper"], warningNote: "Hidden assumptions create fragile conclusions." },
      { order: 2, title: "Collect representative samples", description: "Design sampling to match the question; record context and confounders.", prerequisiteTools: ["measurement tools"], warningNote: "Biased sampling can overwhelm any analysis." },
      { order: 3, title: "Report error bounds", description: "Use confidence intervals or credible intervals; include effect sizes, not just significance.", prerequisiteTools: ["analysis tools"], warningNote: "Point estimates without uncertainty invite disaster." },
    ],
    history: [
      { year: "1600s-1800s", event: "Probability formalizes; statistics emerges with astronomy and social measurement.", location: "Europe" },
      { year: "1900s", event: "Modern statistical inference and experimental design mature.", location: "Global" },
      { year: "2000s", event: "Data-driven methods become central across domains.", location: "Global" },
    ],
    impact: para([
      "Probability and statistics make uncertainty manageable and decisions auditable. They reduce superstition and improve safety when used honestly.",
      "In The Codex, they are prerequisites for reliable medicine, engineering, and machine learning systems.",
    ]),
    sources: [
      src("casella-berger", "Casella & Berger — Statistical Inference", "book", null),
      src("jaynes", "Jaynes — Probability Theory: The Logic of Science", "book", null),
      src("wiki-probability", "Wikipedia — Probability theory", "wikipedia", "https://en.wikipedia.org/wiki/Probability_theory"),
    ],
  },

  {
    id: "calculus-and-optimization",
    name: "Calculus and Optimization",
    tagline: "Rates of change and constrained minimization for engineering design and machine learning",
    category: "science",
    era: "industrial",
    difficulty: 4,
    prerequisites: ["writing-early-systems", "paper-and-ink-media"],
    problem: para([
      "Engineering and learning systems require choosing parameters to minimize cost or maximize performance under constraints. Without calculus and optimization, tuning becomes trial-and-error and does not scale.",
      "Optimization turns goals into math: define an objective, compute sensitivities, and take steps toward better solutions while respecting constraints and stability.",
    ]),
    overview: para([
      "Calculus provides derivatives and integrals; optimization uses gradients, convexity, constraints, and numerical methods to find minima or maxima. Real problems are noisy, nonconvex, and constrained by resources.",
      "In AI, gradient-based optimization trains models. In physical systems, optimization designs structures, controllers, and processes. The same discipline applies: stable algorithms and honest evaluation.",
    ]),
    principles: [
      { name: "Derivatives", explanation: "Local sensitivity; gradients point in the steepest ascent direction." },
      { name: "Constraints", explanation: "Real systems have limits; constrained optimization handles feasibility and tradeoffs." },
      { name: "Numerical stability", explanation: "Finite precision and noise affect optimization; step sizes and conditioning matter." },
    ],
    components: [
      { id: "objective", name: "Objective function", function: "Defines what to optimize", position: "Model", madeFrom: "Math expression" },
      { id: "gradient", name: "Gradient", function: "Sensitivity of objective to parameters", position: "Optimization", madeFrom: "Derivatives" },
      { id: "constraints", name: "Constraints", function: "Limit feasible solutions", position: "Problem definition", madeFrom: "Inequalities/equalities" },
    ],
    rawMaterials: [
      ...scienceMaterials(),
      ...computingMaterials().slice(0, 1),
    ],
    buildSteps: [
      { order: 1, title: "Write the objective and constraints", description: "Define the goal in measurable terms; list constraints explicitly.", prerequisiteTools: ["paper"], warningNote: "If you cannot write the objective, you cannot optimize it." },
      { order: 2, title: "Compute derivatives", description: "Derive gradients; verify with finite-difference checks on small cases.", prerequisiteTools: ["calculator or computer"], warningNote: "Wrong gradients train the wrong system." },
      { order: 3, title: "Choose a stable method", description: "Select gradient descent variants or second-order methods; track conditioning and step size.", prerequisiteTools: ["numerical tools"], warningNote: "Unstable steps diverge and hide the root cause." },
    ],
    history: [
      { year: "1600s-1700s", event: "Calculus formalizes; optimization methods emerge.", location: "Europe" },
      { year: "1900s", event: "Convex optimization and numerical methods mature.", location: "Global" },
      { year: "2000s", event: "Optimization becomes central to ML training.", location: "Global" },
    ],
    impact: para([
      "Optimization improves designs and reduces waste by making tradeoffs explicit. It also introduces failure modes: local minima, instability, and overfitting to metrics.",
      "In The Codex, it is a prerequisite to modern control systems and to training large AI models.",
    ]),
    sources: [
      src("boyd-vandenberghe", "Boyd & Vandenberghe — Convex Optimization", "book", "https://web.stanford.edu/~boyd/cvxbook/"),
      src("nocedal-wright", "Nocedal & Wright — Numerical Optimization", "book", null),
      src("wiki-optimization", "Wikipedia — Mathematical optimization", "wikipedia", "https://en.wikipedia.org/wiki/Mathematical_optimization"),
    ],
  },

  {
    id: "gradient-descent",
    name: "Gradient Descent",
    tagline: "Iterative optimization using gradients to reduce an objective",
    category: "computing",
    era: "mid-20th",
    difficulty: 4,
    prerequisites: ["calculus-and-optimization", "linear-algebra"],
    problem: para([
      "Many objectives are too complex to solve in one step. You need an iterative method that improves a solution gradually using local information.",
      "Gradient descent provides a generic workhorse: use the gradient as a direction of improvement and take steps with a learning rate. The hard part is step size, noise, and conditioning.",
    ]),
    overview: para([
      "Basic gradient descent updates parameters by subtracting a scaled gradient. Variants include momentum and adaptive methods. Stochastic versions use minibatches to scale to large datasets.",
      "In engineering, the same idea appears as iterative refinement. In AI, it is the engine that trains neural networks when combined with backpropagation.",
    ]),
    principles: [
      { name: "Learning rate", explanation: "Too large diverges; too small stalls. Schedules and adaptive steps manage tradeoffs." },
      { name: "Stochastic approximation", explanation: "Noisy gradients can still converge with correct averaging and step sizes." },
      { name: "Conditioning", explanation: "Ill-conditioned problems require preconditioning or careful normalization." },
    ],
    components: [
      { id: "params", name: "Parameters", function: "Variables being optimized", position: "Model", madeFrom: "Vectors of numbers" },
      { id: "grad", name: "Gradient estimator", function: "Computes gradient or approximation", position: "Training loop", madeFrom: "Derivatives and data" },
      { id: "schedule", name: "Step schedule", function: "Controls step sizes over time", position: "Training loop", madeFrom: "Rules and hyperparameters" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      ...scienceMaterials().slice(0, 1),
    ],
    buildSteps: [
      { order: 1, title: "Define objective", description: "Write the loss you want to minimize and the parameters it depends on.", prerequisiteTools: ["paper"], warningNote: "Ambiguous objectives create misleading results." },
      { order: 2, title: "Compute gradients", description: "Derive or approximate gradients; verify on small examples.", prerequisiteTools: ["calculator or computer"], warningNote: "Gradient sign errors cause divergence." },
      { order: 3, title: "Choose step size and normalization", description: "Start conservative; normalize inputs; use schedules if needed.", prerequisiteTools: ["monitoring"], warningNote: "Exploding updates can corrupt checkpoints." },
      { order: 4, title: "Monitor convergence", description: "Track objective, validation metrics, and instability indicators.", prerequisiteTools: ["logs"], warningNote: "Training loss decreasing does not guarantee generalization." },
    ],
    history: [
      { year: "1900s", event: "Gradient-based methods become standard in numerical optimization.", location: "Global" },
      { year: "1980s-1990s", event: "Stochastic gradient descent becomes central to large-scale learning.", location: "Global" },
      { year: "2010s", event: "Adaptive methods and large-scale training popularize variants.", location: "Global" },
    ],
    impact: para([
      "Gradient descent makes optimization practical at scale and enables modern ML training. It also creates new failure modes: instability, overfitting, and brittle dependence on hyperparameters.",
      "In The Codex, it is a core algorithm node that unlocks deep learning when paired with backpropagation.",
    ]),
    sources: [
      src("nocedal-wright-nd", "Nocedal & Wright — Numerical Optimization", "book", null),
      src("goodfellow-sgd", "Goodfellow et al. — Deep Learning (optimization chapter)", "book", "https://www.deeplearningbook.org/"),
      src("wiki-sgd", "Wikipedia — Stochastic gradient descent", "wikipedia", "https://en.wikipedia.org/wiki/Stochastic_gradient_descent"),
    ],
  },

  {
    id: "backpropagation",
    name: "Backpropagation",
    tagline: "Efficient gradient computation for layered models via the chain rule",
    category: "computing",
    era: "late-20th",
    difficulty: 5,
    prerequisites: ["gradient-descent", "calculus-and-optimization", "stored-program-computer"],
    problem: para([
      "Neural networks and layered models have many parameters. Computing gradients naively is prohibitively expensive if you treat each parameter independently.",
      "Backpropagation solves this by reusing intermediate computations: apply the chain rule backward through the computation graph to compute gradients efficiently.",
    ]),
    overview: para([
      "Backprop treats a model as a sequence of operations. A forward pass computes outputs and caches intermediates; a backward pass propagates error signals and computes gradients for each parameter.",
      "The method is general: any differentiable computation graph can use it. Practical engineering issues include numerical stability, gradient explosion/vanishing, and correct implementation of derivatives.",
    ]),
    principles: [
      { name: "Chain rule", explanation: "Derivatives of composed functions multiply; backprop organizes this computation efficiently." },
      { name: "Computation graphs", explanation: "Represent complex functions as nodes/edges so gradients can be computed systematically." },
      { name: "Automatic differentiation", explanation: "Software implements backprop for arbitrary graphs; correctness requires careful testing." },
    ],
    components: [
      { id: "forward", name: "Forward pass", function: "Computes outputs and caches intermediates", position: "Training loop", madeFrom: "Model operations" },
      { id: "backward", name: "Backward pass", function: "Computes gradients via chain rule", position: "Training loop", madeFrom: "Derivatives and cached values" },
      { id: "graph", name: "Computation graph", function: "Structure that defines dependencies", position: "Model representation", madeFrom: "Nodes and edges" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Test cases",
        purpose: "Verify gradient correctness and stability",
        earthLocations: ["Engineering practice everywhere"],
        spaceAlternatives: "Same requirement: treat tests as life-support for software reliability.",
        processingRequired: "Finite-difference gradient checks and regression tests.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Write forward computation clearly", description: "Define layers/operations; cache intermediates needed for derivatives.", prerequisiteTools: ["programming environment"], warningNote: "Hidden state makes gradients wrong." },
      { order: 2, title: "Implement backward derivatives", description: "Compute local derivatives; propagate gradients backward through the graph.", prerequisiteTools: ["math references"], warningNote: "Small sign/shape bugs silently break training." },
      { order: 3, title: "Validate with gradient checks", description: "Compare analytic gradients to finite differences on small models.", prerequisiteTools: ["test harness"], warningNote: "Only checking loss curves is not proof of correctness." },
      { order: 4, title: "Stabilize training", description: "Add normalization, clipping, or better initialization when gradients explode/vanish.", prerequisiteTools: ["monitoring"], warningNote: "Unstable gradients can corrupt checkpoints." },
    ],
    history: [
      { year: "1960s-1980s", event: "Backprop and related methods formalize and spread in ML.", location: "Global" },
      { year: "2010s", event: "Automatic differentiation frameworks make backprop ubiquitous.", location: "Global" },
      { year: "2020s", event: "Scaling requires systems engineering and careful numerics.", location: "Global" },
    ],
    impact: para([
      "Backpropagation enables deep learning by making gradient computation tractable for large models. It turns learning into an optimization problem on a computation graph.",
      "In The Codex, backprop is the hinge between math and modern AI capability; it depends on disciplined software and testing culture.",
    ]),
    sources: [
      src("rumelhart-1986", "Rumelhart, Hinton, Williams (1986) — Learning representations by back-propagating errors", "paper", "https://www.nature.com/articles/323533a0"),
      src("goodfellow-backprop", "Goodfellow et al. — Deep Learning (backprop chapter)", "book", "https://www.deeplearningbook.org/"),
      src("wiki-backprop", "Wikipedia — Backpropagation", "wikipedia", "https://en.wikipedia.org/wiki/Backpropagation"),
    ],
  },

  {
    id: "neural-networks",
    name: "Neural Networks",
    tagline: "Parameterized function approximators built from layers of simple units",
    category: "computing",
    era: "late-20th",
    difficulty: 5,
    prerequisites: ["backpropagation", "gradient-descent", "linear-algebra", "probability-and-statistics"],
    problem: para([
      "Many phenomena are nonlinear and high-dimensional: vision, language, control, and forecasting. Linear models can be too weak, and rule-based systems are brittle.",
      "Neural networks approximate complex functions by composing simple nonlinear transformations. The challenge is training stability and generalization, not just expressive power.",
    ]),
    overview: para([
      "A neural network maps inputs to outputs through layers: linear transforms plus nonlinear activations. Training adjusts parameters to minimize loss on data.",
      "Architectures specialize: convolutional nets for images, recurrent nets for sequences, transformers for attention. The common backbone is differentiable composition trained by gradient methods.",
    ]),
    principles: [
      { name: "Universal approximation", explanation: "With sufficient capacity, networks can approximate many functions, but training and data constrain what is practical." },
      { name: "Regularization", explanation: "Techniques like weight decay, dropout, and early stopping reduce overfitting." },
      { name: "Initialization and normalization", explanation: "Good initialization and normalization stabilize gradients and speed learning." },
    ],
    components: [
      { id: "layers", name: "Layers", function: "Compose transformations", position: "Model", madeFrom: "Linear weights and biases" },
      { id: "activations", name: "Activation functions", function: "Introduce nonlinearity", position: "Between layers", madeFrom: "Math functions like ReLU" },
      { id: "loss", name: "Loss and metrics", function: "Defines training objective", position: "Training loop", madeFrom: "Math definitions" },
      { id: "regularizers", name: "Regularizers", function: "Improve generalization", position: "Training loop", madeFrom: "Penalties and stochastic methods" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Labeled data",
        purpose: "Supervised learning signals for many tasks",
        earthLocations: ["Human annotation; sensors with ground truth"],
        spaceAlternatives: "Use simulation and self-supervision where labels are scarce; prioritize safe data generation.",
        processingRequired: "Label quality checks and bias audits.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Start with a baseline", description: "Implement a small network and a simple baseline model; compare honestly.", prerequisiteTools: ["programming environment"], warningNote: "Skipping baselines hides whether the model helps." },
      { order: 2, title: "Train with stable settings", description: "Use reasonable learning rates, normalization, and regularization; log metrics.", prerequisiteTools: ["compute"], warningNote: "Instability can look like 'random bad luck' if you don't log." },
      { order: 3, title: "Evaluate failure modes", description: "Perform error analysis; check calibration and robustness to shifts.", prerequisiteTools: ["eval suite"], warningNote: "High average accuracy can hide catastrophic edge cases." },
      { order: 4, title: "Scale only after correctness", description: "Increase model size or data only after the pipeline is correct and measurable.", prerequisiteTools: ["monitoring"], warningNote: "Scaling amplifies bugs and costs." },
    ],
    history: [
      { year: "1940s-60s", event: "Early neural models and perceptrons proposed.", location: "Global" },
      { year: "1980s-90s", event: "Backprop training popularizes multilayer networks.", location: "Global" },
      { year: "2010s", event: "Deep learning becomes dominant in many perception tasks.", location: "Global" },
    ],
    impact: para([
      "Neural networks enable flexible models that learn from data, impacting communication, science, and automation. They also introduce new failure modes: opacity, bias, and overconfidence.",
      "In The Codex, neural networks are a prerequisite to modern AI but must be paired with rigorous evaluation and governance to be safe and useful.",
    ]),
    sources: [
      src("goodfellow-dl-nn", "Goodfellow, Bengio, Courville — Deep Learning", "book", "https://www.deeplearningbook.org/"),
      src("wiki-nn", "Wikipedia — Artificial neural network", "wikipedia", "https://en.wikipedia.org/wiki/Artificial_neural_network"),
      src("lecun-98", "LeCun et al. (1998) — Gradient-based learning applied to document recognition", "paper", "https://ieeexplore.ieee.org/document/726791"),
    ],
  },

  {
    id: "gpu-accelerated-computing",
    name: "GPU-Accelerated Computing",
    tagline: "Massively parallel computation for graphics, simulation, and ML training",
    category: "computing",
    era: "21st-century",
    difficulty: 5,
    prerequisites: ["microprocessor", "integrated-circuit", "electrical-power-grid"],
    problem: para([
      "Some workloads are dominated by linear algebra and parallel operations. CPUs excel at control flow, but they are inefficient for massive parallel numeric throughput.",
      "GPUs solve this by providing many simple cores and high memory bandwidth, enabling feasible training of large models and fast simulation.",
    ]),
    overview: para([
      "A GPU executes many threads in parallel, typically in lockstep groups. Performance depends on memory access patterns, batching, and avoiding divergence. Modern ML relies on GPU kernels for matrix multiplies and attention.",
      "For The Codex, GPUs are an infrastructure node: they require power, cooling, and software stacks, and they shift 'AI from scratch' from theory to practice when combined with datasets and training pipelines.",
    ]),
    principles: [
      { name: "Parallel throughput", explanation: "Many simple cores trade latency for throughput on data-parallel tasks." },
      { name: "Memory bandwidth", explanation: "Bandwidth and locality often dominate performance; compute alone is not the bottleneck." },
      { name: "Kernel fusion and batching", explanation: "Combine operations to reduce memory traffic and improve utilization." },
    ],
    components: [
      { id: "gpu", name: "GPU device", function: "Executes parallel kernels", position: "Compute node", madeFrom: "ICs, memory, power delivery" },
      { id: "memory", name: "High-bandwidth memory", function: "Feeds compute cores", position: "On-board", madeFrom: "GDDR/HBM" },
      { id: "cooling", name: "Cooling system", function: "Removes heat", position: "Chassis/rack", madeFrom: "Heatsinks, fans, liquid loops" },
      { id: "software", name: "Kernel and runtime stack", function: "Schedules and executes kernels", position: "Software layer", madeFrom: "Drivers, libraries" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Cooling capacity",
        purpose: "Heat rejection for sustained compute",
        earthLocations: ["Air/liquid cooling systems; HVAC infrastructure"],
        spaceAlternatives: "Radiators and thermal management are first-class constraints; power-limited regimes favor smaller models and efficient inference.",
        processingRequired: "Thermal design, monitoring, and maintenance routines.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Provision power and cooling first", description: "Ensure stable power delivery, airflow/liquid loops, and monitoring before running sustained workloads.", prerequisiteTools: ["power monitoring"], warningNote: "Thermal runaway causes hardware failures." },
      { order: 2, title: "Install runtime stack", description: "Use stable drivers and compute libraries; lock versions and document environment.", prerequisiteTools: ["software management"], warningNote: "Unpinned versions cause unreproducible results." },
      { order: 3, title: "Benchmark kernels", description: "Test matrix multiply throughput and memory bandwidth; detect bottlenecks.", prerequisiteTools: ["benchmarks"], warningNote: "Compute underutilization wastes power." },
      { order: 4, title: "Train with checkpointing and monitoring", description: "Track utilization, temperature, errors, and training stability.", prerequisiteTools: ["monitoring"], warningNote: "Silent errors can corrupt models." },
    ],
    history: [
      { year: "2000s", event: "GPUs shift from fixed-function graphics to programmable compute.", location: "Global" },
      { year: "2010s", event: "GPU computing becomes central to deep learning.", location: "Global" },
      { year: "2020s", event: "Specialized accelerators and efficient kernels dominate scaling.", location: "Global" },
    ],
    impact: para([
      "GPU computing makes modern AI training and simulation feasible and drives a new industrial layer: data centers, cooling, and specialized software stacks.",
      "In The Codex, GPUs are a bottleneck node: without them (or equivalents), large-model training becomes slow or impractical.",
    ]),
    sources: [
      src("cuda-programming-guide", "NVIDIA CUDA C++ Programming Guide", "institution", "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"),
      src("wiki-gpu", "Wikipedia — Graphics processing unit", "wikipedia", "https://en.wikipedia.org/wiki/Graphics_processing_unit"),
      src("goodfellow-dl", "Goodfellow, Bengio, Courville — Deep Learning", "book", "https://www.deeplearningbook.org/"),
    ],
  },

  {
    id: "integrated-circuit",
    name: "Integrated Circuit (IC)",
    tagline: "Multiple transistors and components fabricated on a single semiconductor die",
    category: "communication",
    era: "mid-20th",
    difficulty: 5,
    prerequisites: ["transistor", "semiconductor-crystal-growing-doping"],
    problem: para([
      "As circuits grow, wiring discrete components becomes a reliability and scale problem: solder joints fail, parasitics dominate, and assembly time explodes.",
      "Integrated circuits solve this by fabricating many devices together on one substrate, shrinking size, improving reliability, and enabling complex systems.",
    ]),
    overview: para([
      "ICs use photolithography and thin-film processes to pattern transistors, interconnects, and passivation on silicon. Design and manufacturing are tightly coupled: yield and defect control matter as much as schematic logic.",
      "For The Codex, ICs represent a major threshold: the required cleanliness, materials purity, and equipment are far beyond primitive industry, so early rebuild paths rely on importing ICs and building robust systems around them.",
    ]),
    principles: [
      { name: "Photolithography", explanation: "Pattern transfer at small scales enables dense circuits." },
      { name: "Planar processing", explanation: "Oxides and passivation stabilize surfaces and junctions." },
      { name: "Yield and defects", explanation: "Complexity increases defect sensitivity; process control dominates economics." },
    ],
    components: [
      { id: "die", name: "Die", function: "Houses the circuit", position: "Inside package", madeFrom: "Patterned silicon" },
      { id: "interconnect", name: "Interconnect", function: "Connects devices", position: "Metal layers", madeFrom: "Aluminum/copper" },
      { id: "package", name: "Package", function: "Protects die and provides pins", position: "Outside die", madeFrom: "Epoxy/ceramic, lead frame" },
    ],
    rawMaterials: [
      {
        name: "Silicon and dopants",
        purpose: "Semiconductor substrate and device formation",
        earthLocations: ["Global semiconductor supply chain"],
        spaceAlternatives: "Import packaged ICs early; local IC fab requires cleanrooms, ultrapure chemicals, and precision tooling.",
        processingRequired: "Ultrapure processing, lithography, and controlled diffusion/implant.",
      },
      {
        name: "Ultrapure chemicals",
        purpose: "Etching, cleaning, and deposition",
        earthLocations: ["Electronic chemical suppliers"],
        spaceAlternatives: "Closed-loop chemical management is mandatory off-world; waste handling is safety-critical.",
        processingRequired: "Contamination control, filtration, and neutralization.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Design for manufacturability", description: "Choose process node constraints; design test structures and margins.", prerequisiteTools: ["EDA tools"], warningNote: "A design that cannot be tested is not a product." },
      { order: 2, title: "Fabricate wafers", description: "Run lithography, doping, deposition, and etch steps with strict process logs.", prerequisiteTools: ["cleanroom tools"], warningNote: "Toxic and corrosive chemicals require professional safety systems." },
      { order: 3, title: "Test and package", description: "Probe wafers, dice, package, and perform burn-in screening.", prerequisiteTools: ["test equipment"], warningNote: "ESD and thermal overstress can destroy devices." },
    ],
    history: [
      { year: "1958-1959", event: "Early IC demonstrations enable integration.", location: "USA" },
      { year: "1960s-70s", event: "MOS and scaling drive complexity growth.", location: "Global" },
      { year: "2000s+", event: "Multi-layer interconnect and advanced nodes dominate.", location: "Global" },
    ],
    impact: para([
      "ICs enable computers, communications, and control systems at scales impossible with discrete components. They also create global supply-chain dependencies on specialized manufacturing.",
      "In The Codex, ICs are both a pinnacle manufacturing node and a dependency anchor for advanced computing and AI.",
    ]),
    sources: [
      src("wiki-ic", "Wikipedia — Integrated circuit", "wikipedia", "https://en.wikipedia.org/wiki/Integrated_circuit"),
      src("sze", "Sze & Ng — Physics of Semiconductor Devices", "book", null),
      src("ieee-sscs", "IEEE Solid-State Circuits Society", "institution", "https://sscs.ieee.org/"),
    ],
  },

  {
    id: "microprocessor",
    name: "Microprocessor",
    tagline: "A CPU implemented as an integrated circuit, enabling personal and embedded computing",
    category: "computing",
    era: "late-20th",
    difficulty: 5,
    prerequisites: ["integrated-circuit"],
    problem: para([
      "General-purpose computing was once room-sized and rare. Civilization needs computation everywhere: control systems, communications, instrumentation, and eventually personal devices.",
      "Microprocessors compress a CPU into a single chip, reducing cost and power while enabling mass deployment of programmable systems.",
    ]),
    overview: para([
      "A microprocessor integrates arithmetic logic, registers, control, and interfaces. It executes instructions from memory and interacts with peripherals via buses.",
      "The key to bootstrap is modularity: even if you cannot manufacture microprocessors locally, you can build robust systems around imported chips if you understand their constraints, power needs, and failure modes.",
    ]),
    principles: [
      { name: "Instruction execution", explanation: "Machine code drives a predictable state machine." },
      { name: "Memory hierarchy", explanation: "Caches and memory buses trade speed for capacity." },
      { name: "Clocking and timing", explanation: "Synchronous design requires stable clock distribution and timing margins." },
    ],
    components: [
      { id: "core", name: "CPU core", function: "Executes instructions", position: "On-die", madeFrom: "Logic gates and registers" },
      { id: "bus", name: "Bus interface", function: "Communicates with memory/peripherals", position: "Pins/controllers", madeFrom: "Drivers and protocols" },
      { id: "power", name: "Power regulation", function: "Provides stable voltages", position: "Board level", madeFrom: "Regulators, capacitors" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Printed circuit boards (PCBs)",
        purpose: "Mount and interconnect processors, memory, and peripherals",
        earthLocations: ["Electronics manufacturing globally"],
        spaceAlternatives: "Local PCB fab is plausible with chemicals and precision; early off-world relies on imported boards and careful repair.",
        processingRequired: "Copper etching/lamination, soldering, inspection, and rework capability.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Select a processor and document constraints", description: "Pick an architecture; record voltage, clocking, and I/O requirements.", prerequisiteTools: ["datasheets"], warningNote: "Wrong voltage kills chips instantly." },
      { order: 2, title: "Design stable power and clocking", description: "Add regulators, decoupling, and clock sources per reference designs.", prerequisiteTools: ["multimeter", "oscilloscope"], warningNote: "Power integrity issues cause intermittent faults." },
      { order: 3, title: "Bring up minimal firmware", description: "Boot a simple monitor; verify memory and I/O stepwise.", prerequisiteTools: ["programmer"], warningNote: "Complex software before hardware validation wastes time." },
      { order: 4, title: "Add peripherals and tests", description: "Integrate storage/networking; add self-tests and logs.", prerequisiteTools: ["test harness"], warningNote: "Without tests, repairs become folklore." },
    ],
    history: [
      { year: "1970s", event: "Early microprocessors enable embedded and personal computing.", location: "Global" },
      { year: "1990s-2000s", event: "High-performance CPUs and SoCs proliferate.", location: "Global" },
      { year: "2010s-2020s", event: "Energy efficiency and integration dominate design.", location: "Global" },
    ],
    impact: para([
      "Microprocessors make computation ubiquitous and enable automation, communication, and measurement across society.",
      "They also deepen dependencies on semiconductor manufacturing; The Codex treats them as a node that can be imported and maintained even if not locally fabricated.",
    ]),
    sources: [
      src("wiki-microprocessor", "Wikipedia — Microprocessor", "wikipedia", "https://en.wikipedia.org/wiki/Microprocessor"),
      src("hennessy-patterson", "Hennessy & Patterson — Computer Architecture: A Quantitative Approach", "book", null),
      src("arm-arch", "ARM Architecture Reference Manuals (general)", "institution", "https://developer.arm.com/documentation"),
    ],
  },

  {
    id: "data-storage-systems",
    name: "Data Storage Systems",
    tagline: "Persistent storage for documents, software, and datasets",
    category: "computing",
    era: "late-20th",
    difficulty: 4,
    prerequisites: ["microprocessor", "copper-wire-and-cable", "electric-motor"],
    problem: para([
      "Civilization fails when knowledge cannot persist. Memory inside a running computer is not enough: you need durable storage for documents, software, and measurements.",
      "Storage systems solve persistence with tradeoffs: cost, reliability, speed, and power. The hard part is not writing bits; it is integrity over time and repairability.",
    ]),
    overview: para([
      "Storage spans multiple tiers: paper and print, magnetic media, solid-state flash, and redundant distributed storage. Each tier has different failure modes: bit rot, mechanical wear, radiation, humidity, and human error.",
      "For The Codex, storage is a survival technology: keep critical references in multiple formats, with checksums and redundancy, and test restores regularly.",
    ]),
    principles: [
      { name: "Redundancy", explanation: "Multiple copies and parity prevent single failures from destroying knowledge." },
      { name: "Checksums and integrity", explanation: "Hashing detects corruption; regular verification is required." },
      { name: "Lifecycle and failure modes", explanation: "Media wear and environmental stress determine refresh schedules." },
    ],
    components: [
      { id: "media", name: "Storage media", function: "Holds bits", position: "Drives/tapes/print", madeFrom: "Magnetic domains, flash cells, ink" },
      { id: "controller", name: "Controller", function: "Reads/writes and manages errors", position: "Drive electronics", madeFrom: "ICs and firmware" },
      { id: "filesystem", name: "Filesystem and formats", function: "Organizes data into files", position: "Software layer", madeFrom: "Data structures and metadata" },
      { id: "backup", name: "Backup and replication", function: "Creates recoverable copies", position: "Operational process", madeFrom: "Procedures and automation" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Magnetic materials and precision parts",
        purpose: "Disk/tape media and mechanical assemblies (where used)",
        earthLocations: ["Industrial manufacturing supply chains"],
        spaceAlternatives: "Favor solid-state and printed backups early; mechanical storage is maintenance-heavy off-world.",
        processingRequired: "Clean assembly and alignment; environmental sealing.",
      },
      {
        name: "Printed references",
        purpose: "Human-readable backup for critical knowledge",
        earthLocations: ["Paper/ink supply chains"],
        spaceAlternatives: "Print key manuals; store in controlled environments; keep redundancy.",
        processingRequired: "Indexing, revision control, and archive discipline.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Choose redundancy strategy", description: "Define what must survive; decide copy count and locations; use offline backups.", prerequisiteTools: ["inventory"], warningNote: "If you have only one copy, you do not have the data." },
      { order: 2, title: "Define integrity checks", description: "Use checksums and periodic verification; record hash manifests.", prerequisiteTools: ["hash tools"], warningNote: "Silent corruption accumulates over time." },
      { order: 3, title: "Test restores", description: "Practice restoring from backup; document steps and dependencies.", prerequisiteTools: ["restore plan"], warningNote: "Backups that cannot be restored are theater." },
      { order: 4, title: "Refresh media on schedule", description: "Rotate and migrate data before end-of-life; store spares.", prerequisiteTools: ["maintenance logs"], warningNote: "Old media fails at the worst time." },
    ],
    history: [
      { year: "1900s", event: "Paper archives and microfilm scale knowledge storage.", location: "Global" },
      { year: "1950s-80s", event: "Magnetic tape and disks dominate computing storage.", location: "Global" },
      { year: "2000s+", event: "Flash and distributed storage become standard.", location: "Global" },
    ],
    impact: para([
      "Reliable storage is the difference between accumulated capability and repeated rediscovery. It enables science, engineering, governance, and long-term planning.",
      "In the Codex, storage sits near the base of modern computing and of any resilience strategy for collapse recovery or space settlement.",
    ]),
    sources: [
      src("wiki-data-storage", "Wikipedia — Data storage", "wikipedia", "https://en.wikipedia.org/wiki/Data_storage"),
      src("nist-hash", "NIST: Cryptographic Hash Functions (general guidance)", "institution", "https://csrc.nist.gov/projects/hash-functions"),
      src("tanenbaum-os", "Tanenbaum & Bos — Modern Operating Systems (storage/filesystems context)", "book", null),
    ],
  },

  {
    id: "programming-languages",
    name: "Programming Languages",
    tagline: "Human-readable abstractions for specifying computation",
    category: "computing",
    era: "mid-20th",
    difficulty: 4,
    prerequisites: ["stored-program-computer", "writing-early-systems"],
    problem: para([
      "Machine code is precise but costly to write and review. Complex systems built in raw opcodes become unmaintainable and error-prone.",
      "Programming languages solve this by providing structured abstractions: variables, functions, types, and modules. The real problem they solve is scalable coordination across many humans and years.",
    ]),
    overview: para([
      "A language defines syntax and semantics. Toolchains (assemblers, compilers, interpreters) translate source into executable behavior. Libraries and standards stabilize the ecosystem.",
      "For The Codex, languages are a leverage node: they make software reproducible and auditable, but only if versioning, testing, and documentation are disciplined.",
    ]),
    principles: [
      { name: "Abstraction", explanation: "Hide details behind interfaces so systems can scale." },
      { name: "Compilation and interpretation", explanation: "Translation strategies trade performance for flexibility." },
      { name: "Types and invariants", explanation: "Type systems express constraints that prevent entire bug classes." },
    ],
    components: [
      { id: "spec", name: "Language specification", function: "Defines meaning", position: "Reference", madeFrom: "Documents and examples" },
      { id: "toolchain", name: "Toolchain", function: "Translates and links code", position: "Build system", madeFrom: "Compilers, linkers, runtimes" },
      { id: "stdlib", name: "Standard library", function: "Reusable building blocks", position: "Ecosystem", madeFrom: "Code modules" },
      { id: "tests", name: "Testing culture", function: "Prevents regressions", position: "Process", madeFrom: "Test suites and CI" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Reference texts and examples",
        purpose: "Teach and preserve language semantics",
        earthLocations: ["Books, standards, archives"],
        spaceAlternatives: "Mirror compilers/specs offline; keep multiple redundant copies of toolchains and docs.",
        processingRequired: "Version pinning and reproducible builds.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Choose a language for the constraint", description: "Pick based on reliability, tooling, ecosystem, and hardware constraints.", prerequisiteTools: ["requirements"], warningNote: "Choosing by fashion increases long-term risk." },
      { order: 2, title: "Set up reproducible builds", description: "Pin toolchain versions; document build steps; store source and artifacts.", prerequisiteTools: ["version control"], warningNote: "Unreproducible builds make repair impossible." },
      { order: 3, title: "Write tests and docs as you go", description: "Treat tests and docs as part of the product, not optional.", prerequisiteTools: ["test runner"], warningNote: "Without tests, you cannot safely change anything later." },
    ],
    history: [
      { year: "1950s", event: "High-level languages reduce machine-code burden.", location: "Global" },
      { year: "1970s-90s", event: "Structured programming, type systems, and tooling mature.", location: "Global" },
      { year: "2000s+", event: "Open ecosystems and reproducible builds become essential.", location: "Global" },
    ],
    impact: para([
      "Programming languages make complex software possible by scaling human coordination and reducing error rates. They also introduce dependencies: compilers, runtimes, and libraries.",
      "In The Codex, languages are a prerequisite to building any serious AI system because training and evaluation pipelines require reliable software and repeatability.",
    ]),
    sources: [
      src("wiki-programming-language", "Wikipedia — Programming language", "wikipedia", "https://en.wikipedia.org/wiki/Programming_language"),
      src("dragon-book", "Aho, Lam, Sethi, Ullman — Compilers: Principles, Techniques, and Tools", "book", null),
      src("knuth-taocp", "Knuth — The Art of Computer Programming (foundations)", "book", null),
    ],
  },

  {
    id: "tokenization",
    name: "Tokenization",
    tagline: "Turns raw text into discrete symbols for language models",
    category: "computing",
    era: "21st-century",
    difficulty: 4,
    prerequisites: ["programming-languages", "machine-learning"],
    problem: para([
      "Text is not naturally a fixed-size numeric input. Models need a stable representation that is efficient, reversible enough for decoding, and compatible with training.",
      "Tokenization solves this by mapping text to token IDs. Poor tokenization inflates sequence length, harms multilingual performance, and creates brittle behavior around punctuation and whitespace.",
    ]),
    overview: para([
      "Modern tokenizers often use subword methods (BPE/Unigram) to balance vocabulary size against sequence length. The tokenizer becomes part of the model contract: changing it changes what the model can express and how it generalizes.",
      "For bootstrap, tokenization is attractive because it is reproducible without exotic hardware; the limiting factors are correct implementation and careful evaluation across languages and domains.",
    ]),
    principles: [
      { name: "Compression vs expressivity", explanation: "Smaller vocabularies increase sequence length; larger vocabularies increase sparsity and memory." },
      { name: "Reversibility", explanation: "Decoding should reconstruct text deterministically to preserve meaning." },
      { name: "Domain coverage", explanation: "Vocab must handle technical symbols, units, and scripts used by your corpus." },
    ],
    components: [
      { id: "vocab", name: "Vocabulary", function: "Maps symbols to IDs", position: "Tokenizer core", madeFrom: "List of tokens" },
      { id: "rules", name: "Segmentation rules", function: "Splits text into tokens", position: "Tokenizer core", madeFrom: "Algorithms and merges" },
      { id: "normalization", name: "Normalization", function: "Canonicalizes text", position: "Preprocessing", madeFrom: "Unicode rules, casing, whitespace" },
      { id: "decoder", name: "Decoder", function: "Reconstructs text from IDs", position: "Output", madeFrom: "Inverse mapping" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Representative text corpus",
        purpose: "Learns token merges or probabilities",
        earthLocations: ["Books, docs, repositories, curated text"],
        spaceAlternatives: "Use locally relevant corpora: technical manuals, logs, and training materials stored offline.",
        processingRequired: "Deduplicate, filter, and normalize; keep licensing and provenance records.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define corpus and normalization", description: "Choose what text represents your domain; define normalization rules up front.", prerequisiteTools: ["data pipeline"], warningNote: "Normalization changes meaning if done carelessly." },
      { order: 2, title: "Train tokenizer", description: "Train BPE/Unigram tokenizer; choose vocab size by evaluation, not aesthetics.", prerequisiteTools: ["tokenizer tool"], warningNote: "Too-small vocab explodes sequence lengths and compute." },
      { order: 3, title: "Evaluate edge cases", description: "Test with units, code, multilingual text, and punctuation-heavy content.", prerequisiteTools: ["test suite"], warningNote: "Tokenizer bugs become permanent model behavior." },
    ],
    history: [
      { year: "1990s-2000s", event: "Statistical NLP uses word-level and character models.", location: "Global" },
      { year: "2010s", event: "Subword tokenization becomes standard for neural NLP.", location: "Global" },
      { year: "2020s", event: "Tokenizer design becomes a core scaling decision.", location: "Global" },
    ],
    impact: para([
      "Tokenization shapes what a language model can learn and how efficiently it trains. It is a hidden but critical piece of the AI stack.",
      "In The Codex, tokenization is a gateway node between raw text archives and large-scale transformers.",
    ]),
    sources: [
      src("wiki-bpe", "Wikipedia — Byte pair encoding", "wikipedia", "https://en.wikipedia.org/wiki/Byte_pair_encoding"),
      src("sennrich-bpe", "Sennrich et al. (2016) — Neural Machine Translation of Rare Words with Subword Units", "paper", "https://arxiv.org/abs/1508.07909"),
      src("kudo-sentencepiece", "Kudo (2018) — SentencePiece", "paper", "https://arxiv.org/abs/1808.06226"),
    ],
  },

  {
    id: "dataset-curation",
    name: "Dataset Curation and Governance",
    tagline: "Provenance, filtering, and licensing discipline for training data",
    category: "computing",
    era: "21st-century",
    difficulty: 4,
    prerequisites: ["data-storage-systems", "probability-and-statistics", "programming-languages"],
    problem: para([
      "Training data determines model behavior. Uncurated corpora contain duplicates, low-quality text, toxic content, private information, and licensing problems.",
      "Dataset curation solves the governance problem: make data selection auditable, repeatable, and safe enough to support long-term systems without legal or ethical collapse.",
    ]),
    overview: para([
      "Curation includes provenance tracking, deduplication, filtering, normalization, and documentation. Governance includes access control, privacy review, and a change log so future teams can reproduce or revise decisions.",
      "For off-world settlement and collapse recovery, curated datasets matter even more: you cannot afford wasted compute or unsafe behavior from corrupted corpora.",
    ]),
    principles: [
      { name: "Provenance", explanation: "Record where data came from and under what conditions it can be used." },
      { name: "Deduplication", explanation: "Reduce memorization and overcounting; improves training efficiency and evaluation integrity." },
      { name: "Risk management", explanation: "Filter unsafe content; protect privacy; document known gaps and biases." },
    ],
    components: [
      { id: "catalog", name: "Dataset catalog", function: "Inventory datasets and versions", position: "Governance layer", madeFrom: "Metadata and manifests" },
      { id: "pipeline", name: "Curation pipeline", function: "Transforms raw into curated", position: "ETL process", madeFrom: "Code and filters" },
      { id: "policy", name: "Usage policy", function: "Defines access and constraints", position: "Governance", madeFrom: "Rules and review process" },
      { id: "docs", name: "Dataset documentation", function: "Explains decisions and limitations", position: "Artifact", madeFrom: "Text and examples" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Raw corpora",
        purpose: "Source material for curated datasets",
        earthLocations: ["Libraries, web archives, repositories"],
        spaceAlternatives: "Local archives and manuals; prioritize high-signal technical references and vetted local logs.",
        processingRequired: "Parsing, deduplication, filtering, and metadata extraction.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define data policy", description: "Specify what content is allowed, how provenance is tracked, and how privacy is protected.", prerequisiteTools: ["policy doc"], warningNote: "No policy means accidental data misuse." },
      { order: 2, title: "Ingest with metadata", description: "Store raw data with hashes, source identifiers, and licensing notes.", prerequisiteTools: ["storage", "hashing"], warningNote: "If you cannot trace origin, you cannot debug model behavior." },
      { order: 3, title: "Deduplicate and filter", description: "Remove near-duplicates; filter low-quality or unsafe content; record filter rules.", prerequisiteTools: ["curation pipeline"], warningNote: "Silent filters create hidden bias; document changes." },
      { order: 4, title: "Version and audit", description: "Publish dataset versions with changelogs and sample inspections.", prerequisiteTools: ["version control"], warningNote: "Unversioned data makes training irreproducible." },
    ],
    history: [
      { year: "2000s", event: "Data governance grows with web-scale systems.", location: "Global" },
      { year: "2010s", event: "Large-scale datasets become central to deep learning.", location: "Global" },
      { year: "2020s", event: "Dataset transparency and safety become critical concerns.", location: "Global" },
    ],
    impact: para([
      "Dataset governance determines whether AI systems are reproducible and safe. It reduces wasted compute and prevents preventable harms caused by contaminated corpora.",
      "In The Codex, dataset curation is part of the 'how to build AI' chain: models are downstream of data decisions.",
    ]),
    sources: [
      src("gebru-datasheets", "Gebru et al. (2021) — Datasheets for Datasets", "paper", "https://arxiv.org/abs/1803.09010"),
      src("wiki-data-governance", "Wikipedia — Data governance", "wikipedia", "https://en.wikipedia.org/wiki/Data_governance"),
      src("nist-ai-rmf", "NIST AI Risk Management Framework", "institution", "https://www.nist.gov/itl/ai-risk-management-framework"),
    ],
  },

  {
    id: "model-evaluation",
    name: "Model Evaluation and Benchmarking",
    tagline: "Tests generalization, safety, and reliability beyond training metrics",
    category: "computing",
    era: "21st-century",
    difficulty: 4,
    prerequisites: ["machine-learning", "probability-and-statistics"],
    problem: para([
      "Models can look good in training and still fail catastrophically in the real world due to leakage, distribution shift, or adversarial edge cases.",
      "Evaluation solves the honesty problem: define tests that reflect real use, measure uncertainty, and keep results comparable across versions.",
    ]),
    overview: para([
      "Evaluation uses held-out datasets, targeted stress tests, calibration checks, and red-teaming. It also includes operational monitoring after deployment, because the world changes.",
      "For The Codex, evaluation is a safety layer: it prevents deploying models that are confident, wrong, and unbounded in harm.",
    ]),
    principles: [
      { name: "Separation of concerns", explanation: "Training metrics do not equal real-world performance; use independent tests." },
      { name: "Calibration", explanation: "Confidence should match correctness; overconfidence is dangerous." },
      { name: "Distribution shift", explanation: "Performance changes when data changes; monitor and adapt." },
    ],
    components: [
      { id: "benchmarks", name: "Benchmarks", function: "Standard tasks and datasets", position: "Evaluation suite", madeFrom: "Curated test sets" },
      { id: "redteam", name: "Red-teaming", function: "Find failure modes intentionally", position: "Safety testing", madeFrom: "Prompts, scenarios, adversarial cases" },
      { id: "monitoring", name: "Monitoring", function: "Detect drift and regressions", position: "Operations", madeFrom: "Logs and alerts" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Test datasets and scenarios",
        purpose: "Independent evaluation signals",
        earthLocations: ["Curated datasets; domain test cases"],
        spaceAlternatives: "Use locally relevant scenarios and safety constraints; keep tests offline and versioned.",
        processingRequired: "Versioning, confidentiality controls, and consistent scoring.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Define evaluation goals", description: "Specify what failures matter (safety, accuracy, bias, robustness).", prerequisiteTools: ["requirements"], warningNote: "Undefined goals lead to cargo-cult benchmarks." },
      { order: 2, title: "Build an evaluation suite", description: "Create held-out tests and stress tests; pin versions.", prerequisiteTools: ["test harness"], warningNote: "Never evaluate on training data." },
      { order: 3, title: "Run pre-deploy gates", description: "Block releases that regress; require sign-off on safety-critical changes.", prerequisiteTools: ["CI/CD"], warningNote: "Without gates, regressions accumulate." },
      { order: 4, title: "Monitor post-deploy", description: "Track drift and user feedback; retrain responsibly.", prerequisiteTools: ["monitoring"], warningNote: "Unmonitored models silently fail." },
    ],
    history: [
      { year: "1900s", event: "Statistical evaluation methods mature.", location: "Global" },
      { year: "2010s", event: "Benchmark culture expands with ML competitions and shared datasets.", location: "Global" },
      { year: "2020s", event: "Safety evaluation and red-teaming become central for large models.", location: "Global" },
    ],
    impact: para([
      "Evaluation protects users and maintainers from false confidence. It enables responsible iteration and makes models comparable over time.",
      "In The Codex, evaluation is part of the technology, not paperwork: it is the only way to know if an AI system actually works safely.",
    ]),
    sources: [
      src("wiki-model-evaluation", "Wikipedia — Model selection", "wikipedia", "https://en.wikipedia.org/wiki/Model_selection"),
      src("bishop-prml", "Bishop — Pattern Recognition and Machine Learning", "book", null),
      src("nist-ai-rmf", "NIST AI Risk Management Framework", "institution", "https://www.nist.gov/itl/ai-risk-management-framework"),
    ],
  },

  {
    id: "distributed-training",
    name: "Distributed Training",
    tagline: "Trains large models across multiple accelerators and machines",
    category: "computing",
    era: "21st-century",
    difficulty: 5,
    prerequisites: ["gpu-accelerated-computing", "data-storage-systems", "internet-protocols-and-web"],
    problem: para([
      "Single machines have limited memory and compute. Large models and datasets require parallelism to finish training in reasonable time.",
      "Distributed training solves this by splitting computation and data across devices, but introduces new failure modes: synchronization bugs, silent corruption, and infrastructure fragility.",
    ]),
    overview: para([
      "Common strategies include data parallelism (replicate model, split data) and model parallelism (split model across devices). Communication bandwidth and latency become bottlenecks.",
      "A practical distributed system needs checkpointing, monitoring, and deterministic configuration management. The Codex treats this as both a software and infrastructure technology.",
    ]),
    principles: [
      { name: "Parallelism strategies", explanation: "Data/model/pipeline parallelism trade communication for memory and speed." },
      { name: "Synchronization", explanation: "Gradient averaging and parameter updates require consistent coordination." },
      { name: "Fault tolerance", explanation: "Failures are normal at scale; recovery must be designed in." },
    ],
    components: [
      { id: "cluster", name: "Compute cluster", function: "Provides many devices", position: "Infrastructure", madeFrom: "Nodes, accelerators, networking" },
      { id: "network", name: "High-speed network", function: "Moves gradients and activations", position: "Interconnect", madeFrom: "Switches, NICs, cables" },
      { id: "scheduler", name: "Job scheduler", function: "Allocates resources", position: "Operations", madeFrom: "Software and policies" },
      { id: "checkpoint", name: "Checkpointing system", function: "Saves state and enables recovery", position: "Storage", madeFrom: "Filesystems and metadata" },
    ],
    rawMaterials: [
      ...computingMaterials(),
      {
        name: "Network equipment",
        purpose: "Low-latency communication between nodes",
        earthLocations: ["Data center networking supply chains"],
        spaceAlternatives: "Bandwidth and power constraints push toward smaller models and more efficient training; prioritize robustness over peak throughput.",
        processingRequired: "Cabling discipline, configuration management, and monitoring.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Choose parallelism strategy", description: "Pick data vs model vs pipeline parallelism based on model size and network.", prerequisiteTools: ["design docs"], warningNote: "Wrong strategy wastes most compute on communication." },
      { order: 2, title: "Implement fault-tolerant checkpoints", description: "Checkpoint frequently; test resume; keep metadata stable.", prerequisiteTools: ["storage"], warningNote: "No resume plan means failed runs waste weeks." },
      { order: 3, title: "Instrument training", description: "Monitor throughput, errors, and divergence; alert on anomalies.", prerequisiteTools: ["monitoring"], warningNote: "Silent divergence produces useless models." },
      { order: 4, title: "Validate determinism and configs", description: "Pin software versions and configs; track seeds and dataset versions.", prerequisiteTools: ["config management"], warningNote: "Untracked configs make results non-reproducible." },
    ],
    history: [
      { year: "1990s-2000s", event: "Distributed systems mature in industry and HPC.", location: "Global" },
      { year: "2010s", event: "Distributed deep learning becomes common.", location: "Global" },
      { year: "2020s", event: "Large-model training becomes a systems engineering field.", location: "Global" },
    ],
    impact: para([
      "Distributed training enables large models but increases fragility and governance risks. It concentrates capability in organizations that can maintain complex infrastructure.",
      "In The Codex, it is near the top of the AI chain: do not attempt it without strong monitoring, evaluation, and safety governance.",
    ]),
    sources: [
      src("wiki-distributed-computing", "Wikipedia — Distributed computing", "wikipedia", "https://en.wikipedia.org/wiki/Distributed_computing"),
      src("dean-ghemawat", "Dean & Ghemawat (2008) — MapReduce", "paper", "https://dl.acm.org/doi/10.1145/1327452.1327492"),
      src("goodfellow-dl", "Goodfellow, Bengio, Courville — Deep Learning", "book", "https://www.deeplearningbook.org/"),
    ],
  },

  {
    id: "ai-safety-and-governance",
    name: "AI Safety and Governance",
    tagline: "Processes, evaluation, and constraints to reduce harm from deployed models",
    category: "science",
    era: "21st-century",
    difficulty: 4,
    prerequisites: ["model-evaluation", "dataset-curation", "machine-learning"],
    problem: para([
      "Powerful models can cause harm through mistakes, bias, misuse, or overconfidence. Treating safety as an afterthought creates brittle systems and public backlash.",
      "Governance solves the coordination problem: define risk thresholds, audit trails, and deployment constraints so AI remains a tool rather than a hazard multiplier.",
    ]),
    overview: para([
      "Safety includes technical work (evaluation, robustness, calibration, security) and organizational work (policy, reviews, incident response). Governance means decisions are documented and reversible.",
      "For The Codex, this node matters because 'AI from scratch' is not only math and compute. It is also deciding what you will not deploy, and how you will detect failure early.",
    ]),
    principles: [
      { name: "Risk management", explanation: "Identify hazards, likelihood, and impact; choose mitigations with accountable owners." },
      { name: "Defense in depth", explanation: "Layer dataset curation, evaluation, constraints, and monitoring." },
      { name: "Auditability", explanation: "Keep logs, provenance, and versioning so failures can be investigated." },
    ],
    components: [
      { id: "policy", name: "Policy and review", function: "Defines constraints and approvals", position: "Organization", madeFrom: "Rules and processes" },
      { id: "eval", name: "Safety evaluation", function: "Detects unsafe behaviors", position: "Pre/post deploy", madeFrom: "Tests and red-teams" },
      { id: "monitoring", name: "Operational monitoring", function: "Detects drift and incidents", position: "Operations", madeFrom: "Telemetry and alerts" },
    ],
    rawMaterials: [
      ...scienceMaterials(),
      {
        name: "Incident logs and feedback",
        purpose: "Learn from failures and near-misses",
        earthLocations: ["Operational systems and user reports"],
        spaceAlternatives: "Same requirement; treat incident response as life-support for software systems.",
        processingRequired: "Triage, root-cause analysis, and corrective actions.",
      },
      ...computingMaterials().slice(0, 1),
    ],
    buildSteps: [
      { order: 1, title: "Define unacceptable outcomes", description: "Write what harms must be prevented; map to measurable tests.", prerequisiteTools: ["policy doc"], warningNote: "If you cannot define harm, you cannot prevent it." },
      { order: 2, title: "Build evaluation gates", description: "Require passing safety tests before deployment; document exceptions.", prerequisiteTools: ["CI/CD"], warningNote: "Informal exceptions become permanent holes." },
      { order: 3, title: "Deploy with constraints", description: "Rate limits, access controls, and monitoring; keep rollback plans.", prerequisiteTools: ["ops tooling"], warningNote: "Unbounded systems fail at scale." },
      { order: 4, title: "Run incident response drills", description: "Practice failure handling; update playbooks.", prerequisiteTools: ["playbooks"], warningNote: "First incident is not the time to invent a process." },
    ],
    history: [
      { year: "2010s", event: "Safety concerns rise with model scale and deployment.", location: "Global" },
      { year: "2020s", event: "Risk frameworks and red-teaming become standard.", location: "Global" },
    ],
    impact: para([
      "Safety and governance determine whether AI accelerates civilization or becomes a destabilizing force. They also enable long-term maintainability through documentation and audit trails.",
      "In the Codex tree, this node is a prerequisite to responsible deployment of large-model systems in either Earth recovery or space settlement scenarios.",
    ]),
    sources: [
      src("nist-ai-rmf", "NIST AI Risk Management Framework", "institution", "https://www.nist.gov/itl/ai-risk-management-framework"),
      src("wiki-ai-safety", "Wikipedia — AI safety", "wikipedia", "https://en.wikipedia.org/wiki/AI_safety"),
      src("weapons-of-math-destruction", "O'Neil — Weapons of Math Destruction", "book", null),
    ],
  },

  // Civilisation chain fill-ins.
  {
    id: "fermentation-basic",
    name: "Fermentation (Basic)",
    tagline: "Uses microbes to preserve food, produce alcohol, and enable staple transformations",
    category: "food",
    era: "prehistoric",
    difficulty: 2,
    prerequisites: ["cooking", "sanitation-and-clean-water"],
    problem: para([
      "Fresh food spoils quickly and can be unsafe. Without refrigeration, civilizations need methods to preserve calories and make nutrients more bioavailable.",
      "Fermentation solves this by using controlled microbial processes to acidify, alcoholize, or otherwise stabilize foods. The challenge is control: contamination can harm or waste the batch.",
    ]),
    overview: para([
      "Fermentation uses yeasts and bacteria to convert sugars into acids, alcohols, and gases. Many traditions rely on stable starter cultures and workflow hygiene rather than advanced instruments.",
      "For bootstrap, fermentation is both food technology and microbiology education: it teaches contamination control, temperature management, and process repeatability.",
    ]),
    principles: [
      { name: "Microbial metabolism", explanation: "Microbes convert sugars into products that change taste, safety, and shelf life." },
      { name: "pH and preservation", explanation: "Acidification inhibits many pathogens and spoilage organisms." },
      { name: "Process control", explanation: "Temperature, cleanliness, and time determine outcomes." },
    ],
    components: [
      { id: "substrate", name: "Substrate (sugars/starches)", function: "Feeds microbes", position: "Fermentation vessel", madeFrom: "Grains, fruit, vegetables" },
      { id: "starter", name: "Starter culture", function: "Provides desired microbes", position: "Inoculation", madeFrom: "Yeast/bacteria from prior batch" },
      { id: "vessel", name: "Vessel and airlock", function: "Contains process and controls oxygen", position: "Container", madeFrom: "Ceramic/glass/food-safe wood" },
    ],
    rawMaterials: [
      {
        name: "Food substrates",
        purpose: "Sugars and starches for fermentation",
        earthLocations: ["Fruits, grains, root crops globally"],
        spaceAlternatives: "Hydroponic crops and stored carbohydrates; manage contamination carefully in closed habitats.",
        processingRequired: "Cleaning, crushing/mashing, and sometimes cooking to gelatinize starches.",
      },
      {
        name: "Clean water",
        purpose: "Mixing and sanitation",
        earthLocations: ["Wells, rivers, treated supplies"],
        spaceAlternatives: "Closed-loop water; prioritize for hygiene and safe food handling.",
        processingRequired: "Treat water to avoid introducing contamination.",
      },
      {
        name: "Salt (when used)",
        purpose: "Selects for desired microbes in pickling",
        earthLocations: ["Evaporite deposits; seawater evaporation"],
        spaceAlternatives: "Recycling salts from life support; manage corrosion and health constraints.",
        processingRequired: "Keep dry and uncontaminated; measure concentration.",
      },
    ],
    buildSteps: [
      { order: 1, title: "Choose product and method", description: "Decide acid fermentation, alcohol, or mixed; choose vessel and oxygen exposure accordingly.", prerequisiteTools: ["containers"], warningNote: "Wrong method can enable unsafe microbes." },
      { order: 2, title: "Sanitize tools and containers", description: "Clean thoroughly; use boiling water or approved sanitizers; avoid recontamination.", prerequisiteTools: ["heat source"], warningNote: "Dirty equipment causes batch failure or illness." },
      { order: 3, title: "Prepare substrate", description: "Crush, mash, or cook as needed; cool to inoculation temperature.", prerequisiteTools: ["knives", "pots"], warningNote: "Hot substrates can kill starter cultures." },
      { order: 4, title: "Inoculate and control environment", description: "Add starter; control temperature; limit oxygen if required; record times.", prerequisiteTools: ["thermometer if available"], warningNote: "Temperature swings change microbial dominance." },
      { order: 5, title: "Assess and store safely", description: "Use smell/taste/visual checks; discard suspicious batches; store in clean containers.", prerequisiteTools: ["clean containers"], warningNote: "Do not consume if mold/toxins are suspected." },
    ],
    history: [
      { year: "Prehistoric", event: "Fermented foods appear across cultures as preservation and nutrition technology.", location: "Global" },
      { year: "Ancient", event: "Beer, wine, and leavened breads scale urban caloric systems.", location: "Global" },
    ],
    impact: para([
      "Fermentation increases shelf life, can improve safety, and creates tradeable products. It also teaches process control and hygiene, which later supports medicine and industry.",
      "For The Codex, fermentation is a foundational capability for both survival and the long chain toward biotech and pharmaceuticals.",
    ]),
    sources: [
      src("wiki-fermentation", "Wikipedia — Fermentation", "wikipedia", "https://en.wikipedia.org/wiki/Fermentation"),
      src("who-food-safety", "WHO: Food safety", "institution", "https://www.who.int/health-topics/food-safety"),
      src("mcgee", "McGee — On Food and Cooking (fermentation sections)", "book", null),
    ],
  },
];

// NOTE: Start with a small batch in code; add more nodes incrementally to keep review manageable.
// This script is intended to be run repeatedly as the batch grows.

const index = JSON.parse(readFileSync(indexPath, "utf8"));
const indexIds = new Set(index.nodes.map((n) => n.id));

let addedToIndex = 0;
let wroteFiles = 0;
let skippedFiles = 0;

for (const def of BATCH) {
  if (!indexIds.has(def.id)) {
    index.nodes.push({ id: def.id });
    indexIds.add(def.id);
    addedToIndex += 1;
  }

  const outPath = join(techDir, `${def.id}.json`);
  if (!force && existsSync(outPath)) {
    skippedFiles += 1;
    continue;
  }

  const node = makeNode(def);
  writeFileSync(outPath, `${JSON.stringify(node, null, 2)}\n`);
  wroteFiles += 1;
}

writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

console.log(`Index: added ${addedToIndex} nodes`);
console.log(`Technologies: wrote ${wroteFiles}, skipped ${skippedFiles}`);
