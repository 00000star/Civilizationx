#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const techDir = join(root, "src", "data", "technologies");
const indexPath = join(root, "src", "data", "index.json");
const target = Number(process.argv.find((arg) => arg.startsWith("--target="))?.split("=")[1] ?? 324);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function wiki(name) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
}

const PROFILES = {
  survival: {
    era: "prehistoric",
    difficulty: 2,
    maturity: "draft",
    prerequisites: ["fire", "shelter-construction-basic", "sanitation-and-clean-water"],
    mission: "keeps people alive when ordinary infrastructure is missing",
    sourceAnchors: [
      ["fema-ready", "FEMA Ready - emergency preparedness", "institution", "https://www.ready.gov/"],
      ["who-wash", "WHO - water, sanitation and hygiene", "institution", "https://www.who.int/health-topics/water-sanitation-and-hygiene-wash"],
    ],
  },
  food: {
    era: "prehistoric",
    difficulty: 2,
    maturity: "draft",
    prerequisites: ["cooking", "food-preservation", "field-agriculture"],
    mission: "turns calories into safer, more durable, more teachable food systems",
    sourceAnchors: [
      ["fao-food", "FAO - food systems", "institution", "https://www.fao.org/food-systems/en/"],
      ["who-food-safety", "WHO - food safety", "institution", "https://www.who.int/health-topics/food-safety"],
    ],
  },
  agriculture: {
    era: "ancient",
    difficulty: 3,
    maturity: "draft",
    prerequisites: ["field-agriculture", "soil-science-and-composting", "basic-hand-tools"],
    mission: "keeps food production repeatable across seasons instead of depending on luck",
    sourceAnchors: [
      ["fao-conservation", "FAO - conservation agriculture", "institution", "https://www.fao.org/conservation-agriculture/en/"],
      ["usda-soil", "USDA NRCS - soil health", "institution", "https://www.nrcs.usda.gov/conservation-basics/soil/soil-health"],
    ],
  },
  medicine: {
    era: "industrial",
    difficulty: 4,
    maturity: "review-needed",
    prerequisites: ["sanitation-and-clean-water", "first-aid-and-wound-care", "germ-theory"],
    mission: "prevents avoidable death while making limits and escalation points explicit",
    sourceAnchors: [
      ["who-health", "WHO - health topics", "institution", "https://www.who.int/health-topics"],
      ["cdc", "CDC - health and safety topics", "institution", "https://www.cdc.gov/"],
    ],
  },
  materials: {
    era: "ancient",
    difficulty: 3,
    maturity: "review-needed",
    prerequisites: ["fire", "charcoal", "ceramics-and-pottery"],
    mission: "turns local matter into durable inputs for tools, shelter, power, and repair",
    sourceAnchors: [
      ["nist-materials", "NIST - materials science and engineering", "institution", "https://www.nist.gov/materials-science-and-engineering"],
      ["asm-handbook", "ASM Handbook series", "book"],
    ],
  },
  energy: {
    era: "industrial",
    difficulty: 4,
    maturity: "review-needed",
    prerequisites: ["fire", "electric-motor", "electrical-power-grid"],
    mission: "converts scarce energy into controlled work without hiding electrical, thermal, or fuel hazards",
    sourceAnchors: [
      ["doe", "U.S. Department of Energy", "institution", "https://www.energy.gov/"],
      ["iea", "International Energy Agency", "institution", "https://www.iea.org/"],
    ],
  },
  tools: {
    era: "ancient",
    difficulty: 3,
    maturity: "draft",
    prerequisites: ["basic-hand-tools", "lever-system", "wheel-and-axle"],
    mission: "makes repair and fabrication repeatable instead of depending on irreplaceable specialists",
    sourceAnchors: [
      ["nist-manufacturing", "NIST - manufacturing", "institution", "https://www.nist.gov/manufacturing"],
      ["machinery-handbook", "Machinery's Handbook", "book"],
    ],
  },
  construction: {
    era: "ancient",
    difficulty: 3,
    maturity: "review-needed",
    prerequisites: ["shelter-construction-basic", "basic-hand-tools", "lime-production"],
    mission: "turns materials and labour into safer structures with known load, water, and fire limits",
    sourceAnchors: [
      ["usace", "U.S. Army Corps of Engineers", "institution", "https://www.usace.army.mil/"],
      ["building-construction-illustrated", "Building Construction Illustrated", "book"],
    ],
  },
  transport: {
    era: "industrial",
    difficulty: 3,
    maturity: "draft",
    prerequisites: ["wheel-and-axle", "cart-and-wagon", "road-construction"],
    mission: "moves people, water, food, materials, and patients without exhausting the settlement",
    sourceAnchors: [
      ["fhwa", "Federal Highway Administration", "institution", "https://highways.dot.gov/"],
      ["transport-history", "The Evolution of Transport Technology", "book"],
    ],
  },
  communication: {
    era: "industrial",
    difficulty: 3,
    maturity: "draft",
    prerequisites: ["writing-early-systems", "paper-and-ink-media", "radio-broadcast-and-receiver"],
    mission: "keeps instructions, warnings, maps, decisions, and history from vanishing",
    sourceAnchors: [
      ["itu", "International Telecommunication Union", "institution", "https://www.itu.int/"],
      ["library-congress", "Library of Congress - preservation", "institution", "https://www.loc.gov/preservation/"],
    ],
  },
  computing: {
    era: "late-20th",
    difficulty: 4,
    maturity: "draft",
    prerequisites: ["stored-program-computer", "programming-languages", "data-storage-systems"],
    mission: "turns records, sensing, automation, and communication into reproducible digital systems",
    sourceAnchors: [
      ["nist-csrc", "NIST Computer Security Resource Center", "institution", "https://csrc.nist.gov/"],
      ["computer-history-museum", "Computer History Museum", "institution", "https://computerhistory.org/"],
    ],
  },
  science: {
    era: "early-modern",
    difficulty: 3,
    maturity: "draft",
    prerequisites: ["writing-early-systems", "probability-and-statistics", "linear-algebra"],
    mission: "makes knowledge testable, comparable, and teachable across generations",
    sourceAnchors: [
      ["openstax", "OpenStax science", "institution", "https://openstax.org/subjects/science"],
      ["nist-uncertainty", "NIST - uncertainty of measurement", "institution", "https://www.nist.gov/pml/nist-technical-note-1297"],
    ],
  },
  warfare: {
    era: "ancient",
    difficulty: 3,
    maturity: "review-needed",
    prerequisites: ["basic-hand-tools", "writing-early-systems", "navigation-celestial"],
    mission: "focuses on protection, logistics, de-escalation, records, and lawful defensive planning",
    sourceAnchors: [
      ["icrc", "ICRC - international humanitarian law", "institution", "https://www.icrc.org/en/law-and-policy"],
      ["sphere", "Sphere standards - humanitarian response", "standard", "https://spherestandards.org/"],
    ],
  },
};

const TOPICS = {
  survival: [
    "Rainwater Harvesting", "Protected Spring Development", "Hand Dug Wells", "Emergency Water Storage", "Greywater Separation",
    "Handwashing Station Design", "Latrine Site Selection", "Waste Burial and Isolation", "Vector Exclusion Netting", "Smoke Ventilation",
    "Cold Weather Clothing", "Heat Shelter Design", "Flood Response Basics", "Drought Response Basics", "Firebreak Construction",
    "Camp Layout and Zoning", "Quarantine Shelter Layout", "Emergency Signaling", "Weather Observation", "Landmark Navigation",
    "Community Watch Rotation", "Emergency Pack Systems", "Search and Rescue Marking", "Rope Rescue Basics", "Safe Fuel Storage",
  ],
  food: [
    "Grain Milling", "Flatbread Baking", "Legume Cooking", "Root Crop Processing", "Oilseed Pressing",
    "Dairy Handling", "Cheese Making", "Yogurt Culturing", "Meat Drying", "Fish Smoking",
    "Pickling Vegetables", "Salt Curing", "Fruit Drying", "Sprouting Grains", "Community Granary Management",
    "Rodent Proof Food Storage", "Nutritional Deficiency Prevention", "Infant Food Preparation", "Communal Kitchen Workflow", "Food Inspection and Sorting",
    "Emergency Crop Substitution", "Meal Planning for Heavy Labor", "Safe Leftover Management", "Solar Food Drying", "Smokehouse Operation",
  ],
  agriculture: [
    "Seed Saving", "Crop Rotation", "Irrigation Furrows", "Terrace Farming", "Raised Bed Gardening",
    "Green Manure Crops", "Compost Quality Control", "Orchard Establishment", "Fruit Tree Grafting", "Vineyard Trellising",
    "Pollinator Habitat", "Pest Scouting", "Integrated Pest Management", "Greenhouse Growing", "Nursery Propagation",
    "Animal Manure Management", "Pasture Rotation", "Fodder Production", "Grain Threshing", "Winnowing",
    "Seed Germination Testing", "Soil pH Testing", "Small Livestock Housing", "Aquaponic Crop Beds", "Mulch Systems",
  ],
  medicine: [
    "Triage Systems", "Vital Signs Monitoring", "Bandage Sterilization", "Fracture Splinting", "Burn Care Principles",
    "Heat Illness Response", "Hypothermia Response", "Oral Rehydration Stock Management", "Maternal Hygiene", "Child Growth Monitoring",
    "Nutrition Screening", "Dental Hygiene", "Community Health Records", "Isolation Ward Workflow", "Vector Control",
    "Sharps Waste Handling", "Basic Epidemiology", "Vaccination Cold Chain", "Pharmacy Inventory Control", "Antiseptic Workflow",
    "Waterborne Disease Surveillance", "Mental Health First Response", "Wound Dressing Change Workflow", "Patient Transport Triage", "Clinic Sterile Zones",
  ],
  materials: [
    "Clay Brick Production", "Adobe Blocks", "Natural Hydraulic Lime", "Gypsum Plaster", "Pozzolan Mortar",
    "Wood Tar and Pitch", "Natural Rubber Processing", "Leather Tanning", "Papermaking Pulp", "Textile Fiber Spinning",
    "Weaving Looms", "Dye Extraction", "Glass Annealing", "Ceramic Glazes", "Refractory Brick",
    "Bloomery Iron Refining", "Wrought Iron Forging", "Cast Iron Founding", "Steel Heat Treatment", "Copper Smelting",
    "Tin and Bronze Casting", "Lead Sheet Production", "Zinc Galvanizing", "Charcoal Briquettes", "Resin Adhesives",
    "Bioplastic Starch Films", "Stone Quarrying", "Lumber Seasoning", "Cement Kiln Feed Preparation", "Sand and Gravel Grading",
  ],
  energy: [
    "Wood Gas Generator", "Water Wheel", "Windmill Mechanical Power", "Animal Treadmill Power", "Biogas Digester",
    "Charcoal Furnace", "Micro Hydro Turbine", "Steam Boiler Operation", "Solar Thermal Collector", "Solar Water Heater",
    "Battery Charging Station", "Lead Acid Battery", "Flywheel Energy Storage", "Compressed Air Storage", "Thermoelectric Generator",
    "Kerosene Lamp", "Alcohol Fuel Distillation", "Methane Capture", "District Heating", "Heat Exchanger Basics",
    "Insulated Thermal Storage", "Generator Maintenance", "Load Shedding Operations", "Microgrid Islanding", "Power Metering",
  ],
  tools: [
    "Drill and Brace", "Files and Rasps", "Clamps and Vises", "Measuring Calipers", "Plumb Bob and Level",
    "Sharpening Stones", "Blacksmith Anvil", "Forge Bellows", "Tongs and Pliers", "Screw Thread Cutting",
    "Lathe Basics", "Water Powered Trip Hammer", "Workbench Design", "Soldering Tools", "Riveting Tools",
    "Grinding Wheel", "Hand Pump", "Block and Tackle", "Tool Steel Tempering", "Woodworking Plane",
    "Mortise and Tenon Jigs", "Basic Metrology", "Workshop Safety Workflow", "Spare Parts Standardization", "Hand Saw Sharpening",
  ],
  construction: [
    "Timber Framing", "Post and Beam Construction", "Roof Trusses", "Thatch Roofing", "Tile Roofing",
    "Stone Masonry", "Arch Construction", "Vault Construction", "Foundation Footings", "Drainage Ditches",
    "Retaining Walls", "Scaffolding", "Lime Plastering", "Insulation Materials", "Window Glazing",
    "Door and Hinge Making", "Earthquake Bracing", "Fire Resistant Layout", "Workshop Building", "Warehouse Design",
    "Bridge Abutments", "Waterproofing Membranes", "Stair Design", "Chimney Construction", "Stormwater Channels",
  ],
  transport: [
    "Pack Animal Saddles", "Harness and Yoke Systems", "Boat Hull Carving", "Sail Rigging", "Canoe Construction",
    "Canal Locks", "Bridge Decking", "Rail Track Laying", "Horse Drawn Carriage", "Bicycle Maintenance",
    "Motorcycle Basics", "Truck Cargo Logistics", "Fuel Storage Depot", "Harbor Docking", "Navigation Buoys",
    "Rope Ferry", "Road Signage", "Traffic Flow Control", "Vehicle Suspension", "Tire Repair",
    "Patient Evacuation Routes", "Cargo Weighing", "Footpath Maintenance", "Animal Cart Maintenance", "River Landing Design",
  ],
  communication: [
    "Postal Relay Systems", "Semaphore Towers", "Signal Flags", "Optical Telegraph", "Printing Ink Production",
    "Bookbinding", "Newspaper Workflow", "Public Notice Boards", "Cipher Basics", "Map Printing",
    "Radio Antenna Tuning", "Field Telephone Lines", "Switchboard Operations", "Broadcast Scheduling", "Emergency Radio Net",
    "Acoustic Signaling", "Library Cataloguing", "Archive Preservation", "Technical Drawing Standards", "Translation Workflow",
    "Public Health Bulletins", "Disaster Message Forms", "Knowledge Apprenticeship Records", "Local Gazette Production", "Weather Bulletin Network",
  ],
  computing: [
    "Operating Systems", "File Systems", "Compiler Construction", "Relational Databases", "Computer Networking",
    "Packet Switching", "Cryptographic Hashing", "Public Key Cryptography", "Version Control", "Software Testing",
    "Embedded Systems", "Real Time Control", "Sensor Data Logging", "Human Computer Interaction", "Search Indexing",
    "Data Compression", "Error Correcting Codes", "Distributed Consensus", "Cloud Computing", "Cybersecurity Operations",
    "Backup and Restore", "Open Source Governance", "Robotics Control", "Geographic Information Systems", "Offline Knowledge Mirrors",
  ],
  science: [
    "Scientific Method", "Experimental Design", "Measurement Uncertainty", "Unit Systems", "Laboratory Notebooks",
    "Optical Microscopy", "Basic Chemistry Lab", "Distillation Apparatus", "Titration", "Spectroscopy Basics",
    "Astronomical Observation", "Surveying", "Cartography", "Weather Station Instruments", "Geology Field Mapping",
    "Mineral Identification", "Statistics Sampling", "Quality Control Charts", "Peer Review Workflow", "Standards and Calibration",
    "Education Curriculum Design", "Apprenticeship Systems", "Research Library Management", "Patent Documentation", "Risk Analysis",
  ],
  warfare: [
    "Defensive Palisades", "Watchtowers", "Nonlethal Crowd Barriers", "Armour Repair", "Field Fortifications",
    "Perimeter Lighting", "Convoy Logistics", "Secure Camp Discipline", "Conflict De Escalation", "Rules of Engagement Records",
    "Emergency Evacuation Routes", "Signal Security", "Shelter Hardening", "Food Store Protection", "Medical Neutrality Marking",
    "Prisoner Handling Records", "Checkpoint Safety", "Civilian Warning Systems", "Fire Watch Patrols", "Critical Infrastructure Guarding",
  ],
};

function sourceList(profile, id, name) {
  return [
    ...profile.sourceAnchors.map(([sourceId, title, type, url]) => ({
      id: `${id}-${sourceId}`,
      title,
      type,
      ...(url ? { url } : {}),
    })),
    {
      id: `${id}-wiki`,
      title: `Wikipedia - ${name}`,
      type: "wikipedia",
      url: wiki(name),
      note: "Orientation source only; replace with stronger topic-specific references during deep review.",
    },
  ];
}

function warnings(category, name) {
  const base = [
    `${name} is a draft expansion entry. It is useful for navigation and planning, but it is not field-guide-ready until reviewed against local conditions and stronger topic-specific sources.`,
    "Do not rely on this entry alone where failure could injure people, contaminate water or food, collapse structures, start fires, or damage critical equipment.",
  ];
  if (category === "medicine") {
    return [
      "Contraindications: patient age, pregnancy, allergies, chronic disease, immune status, and drug interactions can change what is safe.",
      "Overdose: dose, concentration, route, timing, and frequency errors can cause serious injury or death.",
      "Sterility: contaminated hands, instruments, dressings, fluids, or rooms can turn treatment into infection.",
      "Professional verification is required before use on a human being.",
      `${name} requires clinical governance, referral limits, records, and review by qualified medical personnel.`,
    ];
  }
  if (category === "warfare") {
    return [
      `${name} is documented for protection, logistics, de-escalation, emergency planning, and historical literacy.`,
      "Civilian protection, medical neutrality, proportionality, accountability, and lawful authority must govern every use.",
      "Do not use this entry to harm civilians, evade law, or build offensive capability.",
    ];
  }
  return base;
}

function rawMaterials(category, name) {
  const sets = {
    survival: ["Safe water and containers", "Cordage, covers, stakes, and labels", "Local terrain knowledge", "Community labour and watch records"],
    food: ["Edible raw inputs", "Clean water and heat", "Food-safe vessels", "Storage labels and inspection records"],
    agriculture: ["Seed or planting stock", "Soil, compost, and mulch", "Water and drainage paths", "Field records and hand tools"],
    medicine: ["Clean water and hygiene supplies", "Sterile or clean medical consumables", "Patient records and referral forms", "Protective barriers and waste containers"],
    materials: ["Primary feedstock", "Fuel, heat, or curing environment", "Handling tools and containers", "Inspection samples and labels"],
    energy: ["Primary energy source", "Conversion hardware", "Controls, meters, and protection devices", "Maintenance spares and logs"],
    tools: ["Tool stock and handles", "Abrasives, fasteners, and lubricants", "Measuring references", "Workholding and storage"],
    construction: ["Structural materials", "Binders, fasteners, or joinery", "Layout and lifting tools", "Drainage, fire, and inspection records"],
    transport: ["Structural members and running gear", "Ropes, harness, bearings, or fasteners", "Route markers and maps", "Repair kits and load records"],
    communication: ["Message medium", "Encoding and formatting rules", "Relay or archive hardware", "Authentication and revision records"],
    computing: ["Electric power", "Computing hardware", "Storage media", "Documentation, backups, and checksums"],
    science: ["Measuring instruments", "Recording media", "Reference standards", "Sample containers and labels"],
    warfare: ["Protective materials", "Maps, signs, and records", "Lighting and communication tools", "Medical and civilian-protection supplies"],
  };
  return sets[category].map((material, index) => ({
    name: material,
    purpose: `${material} provides the ${index === 0 ? "core input" : index === 1 ? "operating support" : index === 2 ? "control layer" : "continuity layer"} for ${name.toLowerCase()}.`,
    earthLocations: [
      "Local workshops, farms, clinics, libraries, salvage stores, trade networks, natural deposits, or public infrastructure depending on region",
    ],
    spaceAlternatives:
      "Use imported starter stock first, then reduce dependence through recycling, standardised parts, controlled production, strict inventory records, and redundant procedures.",
    processingRequired:
      "Inspect for contamination or damage, label source and date, store away from incompatible materials, and record failures so unsafe substitutions are not repeated.",
  }));
}

function makeEntry(category, name) {
  const profile = PROFILES[category];
  const id = slugify(name);
  return {
    id,
    name,
    tagline: `${name} as a documented civilization capability: inputs, limits, warnings, records, and recovery pathways`,
    category,
    era: profile.era,
    difficulty: profile.difficulty,
    prerequisites: profile.prerequisites,
    unlocks: [],
    problem: `${name} is included because civilizations often fail at the support capabilities between famous inventions. A settlement may know about fire, steel, writing, medicine, or electricity and still lose lives because ${name.toLowerCase()} is absent, undocumented, improvised under stress, or held only in one person's memory.\n\nThe practical problem is not just making or doing the thing once. It is making the capability teachable, inspectable, repairable, and bounded by safety rules. The Codex entry must tell a future reader what ${name.toLowerCase()} is for, which inputs it depends on, what can go wrong, what needs measurement, and when to stop and escalate rather than pushing a dangerous guess further.`,
    overview: `${name} ${profile.mission}. In a recovery setting it should be understood as a small operating system: materials, tools, workspace, trained people, inspection points, maintenance, records, and limits. The entry is therefore structured around the questions a real settlement has to answer before use: what does it prevent, what does it consume, how is it checked, and how does it fail?\n\nFor collapse recovery, the focus is local substitution, safe simplification, and training more than one operator. A process that works only when an expert is present is fragile. For space settlement, the same capability must be redesigned around closed-loop resources, contamination control, power budgets, limited spare parts, and redundant documentation.\n\nThis expansion entry is intentionally conservative. It gives the Codex enough depth for search, planning, teaching, and dependency mapping, but it does not pretend to replace specialist review. Later work should add diagrams, measurements, regional variants, deeper history, and stronger topic-specific sources before promotion to field-guide-ready.`,
    principles: [
      {
        name: "Function before form",
        explanation: `Start with the job ${name.toLowerCase()} performs; historical forms can be copied only after their purpose and limits are understood.`,
      },
      {
        name: "Inputs determine reliability",
        explanation: "Material quality, water, power, labour, weather, contamination, and skill limits usually decide whether the method works.",
      },
      {
        name: "Inspection prevents silent failure",
        explanation: "Checklists, measurements, labels, and post-use inspection turn hidden failure into visible maintenance work.",
      },
      {
        name: "Escalation is part of the design",
        explanation: "A safe entry states when to stop, isolate the hazard, seek expert help, or switch to a lower-risk alternative.",
      },
    ],
    components: [
      {
        id: "use-case",
        name: "Defined use case",
        function: `States what ${name.toLowerCase()} is meant to accomplish and what it is not meant to do`,
        position: "Before design or operation",
        madeFrom: "Written requirements, local survey, risk notes, and responsible operator assignment",
        criticalNote: "Vague goals create unsafe improvisation.",
      },
      {
        id: "input-set",
        name: "Input set",
        function: "Collects materials, tools, labour, information, water, power, and time",
        position: "Before operation",
        madeFrom: "Local supplies, verified salvage, trained people, and source records",
        criticalNote: "Unknown or contaminated inputs must be isolated until checked.",
      },
      {
        id: "workspace",
        name: "Controlled workspace",
        function: "Separates clean, dirty, hot, sharp, electrical, structural, or public areas as needed",
        position: "Around the work",
        madeFrom: "Benches, barriers, labels, ventilation, drainage, lighting, and access rules",
        criticalNote: "Many injuries come from poor layout rather than the core method.",
      },
      {
        id: "operating-checks",
        name: "Operating checks",
        function: "Defines setup, in-process inspection, shutdown, cleaning, and storage criteria",
        position: "During each use",
        madeFrom: "Checklists, gauges, samples, witness marks, logs, and trained observation",
        criticalNote: "If nobody knows how to detect failure, the process is not ready.",
      },
      {
        id: "record-loop",
        name: "Record and review loop",
        function: "Preserves results, failures, maintenance, changes, and training status",
        position: "After each use and during review",
        madeFrom: "Notebook, labels, diagrams, issue list, stock cards, and revision history",
        criticalNote: "Unrecorded local knowledge disappears quickly during crisis or migration.",
      },
    ],
    rawMaterials: rawMaterials(category, name),
    buildSteps: [
      {
        order: 1,
        title: "Define the local problem and stop conditions",
        description: `Write down why ${name.toLowerCase()} is needed, who is responsible, what success means, and what conditions require stopping or escalation.`,
        prerequisiteTools: ["notebook", "local survey", "risk checklist"],
        warningNote: "Do not start if the likely failure modes and escalation path are unknown.",
      },
      {
        order: 2,
        title: "Inventory inputs and substitutions",
        description: "List required materials, tools, water, power, space, records, people, and protective equipment. Mark substitutions and the performance or safety risk they introduce.",
        prerequisiteTools: ["inventory ledger", "labels", "storage area"],
        warningNote: "Substitutions can introduce contamination, fire, structural, medical, chemical, or electrical hazards.",
      },
      {
        order: 3,
        title: "Prepare the workspace",
        description: "Separate clean and dirty zones, establish lighting and ventilation, protect bystanders, mark exits, and place waste containers before work begins.",
        prerequisiteTools: ["barriers", "signs", "cleaning tools"],
        warningNote: "A poor workspace can make a correct procedure unsafe.",
      },
      {
        order: 4,
        title: "Run a small controlled trial",
        description: "Test the smallest useful version first. Record quantities, timing, conditions, operators, observations, and failure points before scaling.",
        prerequisiteTools: ["measuring tools", "test log", "safe test area"],
        warningNote: "Prototype failures must not threaten people, water, food stores, shelter, or critical equipment.",
      },
      {
        order: 5,
        title: "Create the operating checklist",
        description: "Turn the successful trial into setup, operation, shutdown, cleaning, storage, and maintenance checks that another trained person can follow.",
        prerequisiteTools: ["checklist", "maintenance log", "labels"],
        warningNote: "If the process depends on memory alone, it is not resilient enough for crisis use.",
      },
      {
        order: 6,
        title: "Train, review, and mark maturity honestly",
        description: "Train at least two operators, compare results, collect failures, update diagrams and notes, and keep the entry at draft or review-needed until stronger evidence supports promotion.",
        prerequisiteTools: ["training record", "review meeting", "revision log"],
        warningNote: "Do not mark this as field-guide-ready until independent review confirms the details.",
      },
    ],
    history: [
      {
        year: "Traditional practice",
        event: `${name} appears as practical knowledge where communities need repeated solutions to survival, food, health, materials, logistics, or records problems.`,
        location: "Multiple regions",
      },
      {
        year: "Industrial and modern standardisation",
        event: "Craft practice, institutional training, measurements, and written standards make the capability more transferable between communities.",
        location: "Global",
      },
      {
        year: "Collapse-recovery relevance",
        event: "The capability becomes important again when supply chains, specialist labour, or central infrastructure are interrupted.",
        location: "Local settlements and emergency systems",
      },
    ],
    inventors: [],
    impact: `${name} makes the Codex more useful because it fills one of the practical links between major inventions. Its value is not only the immediate task; it helps preserve teachable routines, safer substitutions, maintenance habits, and records. The entry should be treated as a serious draft: enough to orient planning, not enough to remove the need for expert review where lives, structures, food, water, or critical equipment are at risk.`,
    images: [
      {
        id: "workflow",
        filename: "workflow.svg",
        caption: `${name} dependency workflow: use case, inputs, workspace, checks, records, review`,
        type: "diagram",
        credit: "The Codex project",
        license: "CC0",
      },
    ],
    videos: [],
    externalLinks: [
      {
        id: `${id}-wiki`,
        title: `Wikipedia - ${name}`,
        url: wiki(name),
        note: "Orientation link; deeper review should replace this with stronger topic-specific references.",
      },
    ],
    lastUpdated: todayIso(),
    maturity: profile.maturity,
    verification: {
      status: "unverified",
      reviewedBy: null,
      reviewDate: null,
      warnings: warnings(category, name),
      sources: sourceList(profile, id, name),
    },
  };
}

const index = JSON.parse(readFileSync(indexPath, "utf8"));
const existingIds = new Set(index.nodes.map((node) => node.id));
for (const file of readdirSync(techDir).filter((file) => file.endsWith(".json"))) {
  existingIds.add(file.replace(/\.json$/, ""));
}

const candidates = [];
let round = 0;
let found = true;
while (found) {
  found = false;
  for (const [category, topics] of Object.entries(TOPICS)) {
    const topic = topics[round];
    if (!topic) continue;
    candidates.push(makeEntry(category, topic));
    found = true;
  }
  round += 1;
}

let added = 0;
let skipped = 0;
for (const entry of candidates) {
  if (index.nodes.length >= target) break;
  if (existingIds.has(entry.id) || existsSync(join(techDir, `${entry.id}.json`))) {
    skipped += 1;
    continue;
  }
  index.nodes.push({ id: entry.id });
  existingIds.add(entry.id);
  writeFileSync(join(techDir, `${entry.id}.json`), `${JSON.stringify(entry, null, 2)}\n`);
  added += 1;
}

writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);

console.log(`Target: ${target}`);
console.log(`Total entries: ${index.nodes.length}`);
console.log(`Added: ${added}`);
console.log(`Skipped existing: ${skipped}`);

if (index.nodes.length < target) {
  console.error(`Expansion catalog exhausted at ${index.nodes.length}; add more topics.`);
  process.exit(1);
}
