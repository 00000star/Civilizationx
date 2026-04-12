#!/usr/bin/env python3
"""Write remaining energy + communication technology JSON files."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "src/data/technologies"
ISO = "2026-04-10"

def W(obj):
    obj = {
        **obj,
        "lastUpdated": ISO,
        "verification": {
            "status": "unverified",
            "reviewedBy": None,
            "reviewDate": None,
            "warnings": [],
            "sources": [],
        },
    }
    (OUT / f"{obj['id']}.json").write_text(
        json.dumps(obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(obj["id"])


# --- Energy: 5 ---
W({
    "id": "high-voltage-ac-transmission",
    "name": "High-Voltage AC Transmission",
    "tagline": "Extra-high-voltage lines and substations that move gigawatts thousands of kilometres with controlled losses",
    "category": "energy",
    "era": "industrial",
    "difficulty": 4,
    "prerequisites": ["electrical-power-grid", "copper-wire-and-cable", "steel-production"],
    "unlocks": ["nuclear-fission-power-plant"],
    "problem": "Urban networks at kilovolt class cannot push power across continents — current squared times resistance devours megawatts as heat in conductors. Raising voltage lowers current for the same real power, shrinking copper tonnage and I²R loss. The problem is not only towers and wires but insulation coordination: lightning, switching surges, and contamination on insulators in fog and salt spray.\n\nStability also changes: long lines exhibit charging current, Ferranti rise, and low-frequency oscillations between regions. Series capacitors and FACTS devices become part of the physics package, not accessories.\n\nWithout EHV, remote hydro, nuclear, and wind basins cannot feed distant cities — civilisation recentralises on local fuel piles.",
    "overview": "Transformers step generation voltage to hundreds of kilovolts; bundle conductors control corona; shield wires intercept lightning; grounding grids manage fault currents. Substations house breakers, instrument transformers, and reactive compensation banks. Protection zones overlap so only the smallest necessary segment trips for a fault.\n\nEnvironmental design addresses audible noise from corona, right-of-way vegetation, and avian collisions. Underground EHV exists in cities but trades capacitance and cost against aesthetics.\n\nOperationally, maintenance is live-line work with robots and helicopters in some grids — a reminder that infrastructure is theatre as well as steel.\n\nStandards bodies harmonise insulation levels (BIL), clearances, and testing so equipment from different factories interoperates on the same corridor.",
    "principles": [
        {"name": "Surge impedance loading", "explanation": "Natural power transfer capability of a lossless line relates to voltage and surge impedance — compensation adjusts effective electrical length."},
        {"name": "Corona onset", "explanation": "Electric field at conductor surface ionises air; bundle conductors reduce peak field for the same phase voltage."},
        {"name": "Reactive power flow", "explanation": "Line inductance consumes vars; shunt reactors at light load prevent overvoltage from line charging."},
        {"name": "Single-line-to-ground statistics", "explanation": "Most faults are SLG; zero-sequence networks determine relaying and grounding strategy."},
    ],
    "components": [
        {"id": "conductors", "name": "Bundled phase conductors", "function": "Carries current with controlled field gradient", "position": "Between towers", "madeFrom": "ACSR or ACCC composite"},
        {"id": "insulators", "name": "Insulator strings", "function": "Supports conductors electrically above steel", "position": "Suspension or tension sets", "madeFrom": "Porcelain or silicone composite"},
        {"id": "towers", "name": "Lattice or tubular towers", "function": "Mechanical support; lightning shield attachment", "position": "Spanning terrain", "madeFrom": "Galvanised steel"},
        {"id": "substation", "name": "EHV substation yard", "function": "Breaks and transforms paths; hosts protection", "position": "Line terminals", "madeFrom": "SF6 breakers, CTs, PTs, reactors"},
        {"id": "relay", "name": "Line differential and distance relays", "function": "Clears faults with selectivity", "position": "Control house", "madeFrom": "Microprocessor IEDs"},
    ],
    "rawMaterials": [
        {"name": "Aluminium rod for stranding", "purpose": "Lightweight conductor with steel core for strength", "earthLocations": ["Bauxite-to-smelter chains globally"], "spaceAlternatives": "Copper heavier — launch-cost sensitive", "processingRequired": "Continuous casting and rod breakdown"},
        {"name": "Zinc for galvanising", "purpose": "Corrosion protection on towers", "earthLocations": ["Sphalerite deposits worldwide"], "spaceAlternatives": "Stainless steel more costly", "processingRequired": "Hot-dip galvanising baths"},
        {"name": "Porcelain or epoxy insulators", "purpose": "Dielectric support", "earthLocations": ["Ceramic districts in China, EU"], "spaceAlternatives": "Composite sheds lighter", "processingRequired": "Glazing and proof testing"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Route selection and EMF studies", "description": "Optimise corridor; model corona audible noise; consult land tenure.", "prerequisiteTools": ["LiDAR", "EMF calculators"], "warningNote": "Underestimated icing loads collapse spans"},
        {"order": 2, "title": "Foundations and tower erection", "description": "Geotech borings; micropiles in rock; torque bolts to spec.", "prerequisiteTools": ["cranes", "theodolite"], "warningNote": "Guyed assembly near energized lines — induction risk"},
        {"order": 3, "title": "String insulators and sag", "description": "Tension versus suspension; sag at max temperature; clearance to ground.", "prerequisiteTools": ["dynamometers"], "warningNote": "Over-tension cracks porcelain"},
        {"order": 4, "title": "Commission protection", "description": "End-to-end fibre differential; GPS time sync; staged fault tests.", "prerequisiteTools": ["relay test sets"], "warningNote": "Incorrect CT polarity trips wrong breaker"},
        {"order": 5, "title": "Energise at reduced voltage then full", "description": "Infrared scan joints; corona camera at night; record signature.", "prerequisiteTools": ["thermal camera"], "warningNote": "Corona ozone is an environmental permit item"},
    ],
    "history": [
        {"year": 1891, "event": "Three-phase transmission at 25 kV class demonstrates scalable polyphase lines.", "location": "Germany"},
        {"year": 1954, "event": "First 345 kV lines in North America scale bulk transfer.", "location": "USA"},
        {"year": 2009, "event": "HVDC overlays expand for asynchronous interconnection and submarine links.", "location": "Global"},
    ],
    "inventors": [],
    "impact": "EHV turned continents into single electrical machines — with the political entanglements of mutual dependence that implies.\n\nIt is prerequisite to siting generation where fuel or sun exists, not where load sits.",
    "images": [],
    "videos": [{"id": "ehv-lines", "title": "EHV transmission engineering", "description": "Accredited power engineering lectures on corona, bundles, and reactive compensation.", "durationSeconds": 900}],
    "externalLinks": [
        {"id": "cigre", "title": "CIGRE — international grid research", "url": "https://www.cigre.org/"},
        {"id": "ferc", "title": "FERC — transmission policy context (USA)", "url": "https://www.ferc.gov/"},
    ],
})

W({
    "id": "dc-power-transmission-and-motor-drives",
    "name": "DC Power Transmission and Motor Drives",
    "tagline": "Rectifiers, inverters, and choppers that move or motor power when AC alone is insufficient",
    "category": "energy",
    "era": "mid-20th",
    "difficulty": 4,
    "prerequisites": ["electrical-power-grid", "electric-motor", "copper-wire-and-cable"],
    "unlocks": [],
    "problem": "AC won distribution because transformers are simple, but long submarine cables look like enormous capacitors — charging current can exceed useful load. HVDC links move power as DC with converters at ends, decoupling grids that cannot synchronise. Urban traction and battery vehicles need controlled DC buses; variable-speed drives need frequency synthesis AC from fixed grid.\n\nThe obstacle is power electronics: mercury-arc valves historically, thyristors, GTOs, IGBTs, and now SiC MOSFETs — each step raises switching frequency and efficiency but demands protection against shoot-through and voltage transients.\n\nHarmonics pollute the AC side; filters and PWM strategies are part of the civic duty of converters.",
    "overview": "Line-commutated converters use thyristor bridges with AC grid commutation; weak grids struggle — voltage-source converters with IGBTs and PWM self-commutate and support black-start services. MMC topologies stack submodules for smooth waveforms. Motor drives rectify incoming AC, buffer on DC link, then invert to variable frequency for induction or PM motors.\n\nProtection includes DC breakers (harder than AC zero-cross interruption), metallic return electrodes for monopolar operation, and coordination with AC-side relays. Control systems run real-time models to damp subsynchronous oscillations on series-compensated lines feeding converters.\n\nSubmarine HVDC ties land offshore wind; overhead HVDC appears where right-of-way width must shrink for the same power.\n\nThe technology is the diplomatic interface between incompatible grids — and between chemical batteries and rotating masses.",
    "principles": [
        {"name": "Line versus self commutation", "explanation": "LCC needs strong AC voltage to commutate current; VSC can form its own sinusoids with PWM."},
        {"name": "DC cable ampacity", "explanation": "No skin effect at DC — conductor used more uniformly than AC at same size, helping submarine economics."},
        {"name": "PWM harmonic spectrum", "explanation": "Carrier frequency and modulation index set harmonic amplitudes filtered by LCL networks."},
        {"name": "Four-quadrant operation", "explanation": "Drives can motor or regenerate — braking energy returns to grid or burns in resistors if infrastructure forbids."},
    ],
    "components": [
        {"id": "thyristor-bridge", "name": "Thyristor or IGBT valves", "function": "Rectifies or inverts power", "position": "Converter hall", "madeFrom": "Series-connected devices with snubbers"},
        {"id": "dc-reactor", "name": "DC smoothing reactor", "function": "Limits fault di/dt; smooths current in LCC", "position": "DC bus", "madeFrom": "Air-core or iron-core inductors"},
        {"id": "ac-filter", "name": "AC harmonic filters", "function": "Shunts characteristic harmonics", "position": "Converter AC bus", "madeFrom": "L-C branches tuned to 11th, 13th, etc."},
        {"id": "cooling", "name": "Deionised water cooling", "function": "Removes heat from valve towers", "position": "Indoor converter", "madeFrom": "Stainless plate heat exchangers"},
        {"id": "control", "name": "Real-time controller", "function": "Executes vector control or MMC balancing", "position": "Redundant CPUs", "madeFrom": "FPGA + DSP platforms"},
    ],
    "rawMaterials": [
        {"name": "Silicon or SiC dies", "purpose": "Switching devices", "earthLocations": ["Wafer fabs globally"], "spaceAlternatives": "Import modules until fabs exist", "processingRequired": "Wire bond, solder, void-free attach"},
        {"name": "Copper buswork", "purpose": "Low inductance interconnections", "earthLocations": ["Refined copper"], "spaceAlternatives": "Aluminium bus for weight", "processingRequired": "Silver plating contacts"},
        {"name": "Mica or polymer films", "purpose": "DC bus capacitors", "earthLocations": ["Film capacitor plants"], "spaceAlternatives": "Electrolytics for cost at low voltage", "processingRequired": "Self-healing metallisation"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Load flow and dynamic studies", "description": "Model LCC versus VSC; check SCR of receiving AC system; tune PLL gains.", "prerequisiteTools": ["EMTDC/PSCAD class tools"], "warningNote": "Undamped SSR can wreck turbine shafts"},
        {"order": 2, "title": "Assemble valve stacks", "description": "Series connect devices with grading resistors; torque bus to spec; hi-pot each level.", "prerequisiteTools": ["partial discharge meter"], "warningNote": "Static discharge kills gate oxides"},
        {"order": 3, "title": "Commission controls", "description": "Verify firing order; test fault ride-through scripts; black-start drills if applicable.", "prerequisiteTools": ["oscilloscope with isolated probes"], "warningNote": "Ground loops corrupt measurements — use fibre-isolated front ends"},
        {"order": 4, "title": "Energise at reduced DC voltage", "description": "Ramp power; monitor valve temperatures; scan harmonics at POC.", "prerequisiteTools": ["PQ analyser"], "warningNote": "Filter detuning from temperature shifts passbands"},
        {"order": 5, "title": "Handover with spares policy", "description": "Stock redundant submodule cards; train operators on alarm trees.", "prerequisiteTools": ["asset management software"], "warningNote": "Firmware version drift across spares causes mysterious trips"},
    ],
    "history": [
        {"year": 1954, "event": "Gotland HVDC link demonstrates commercial submarine DC transmission.", "location": "Sweden"},
        {"year": 1972, "event": "Eel River back-to-back LCC ties asynchronous eastern and western North American grids.", "location": "Canada"},
        {"year": 2010, "event": "Modular multilevel converters proliferate in offshore wind and city infeed projects.", "location": "Europe and China"},
    ],
    "inventors": [],
    "impact": "HVDC and drives are the duct tape of modern power — stitching asynchronous regions and spinning motors at arbitrary speed without mechanical gears.\n\nThey are also harmonic pollution sources if designed without civic filters.",
    "images": [],
    "videos": [{"id": "hvdc-basics", "title": "HVDC converter concepts", "description": "University lectures comparing LCC and VSC topologies.", "durationSeconds": 1200}],
    "externalLinks": [
        {"id": "abb-hvdc", "title": "Hitachi Energy — HVDC reference projects (industry)", "url": "https://www.hitachienergy.com/us/en/offers/product-system/high-voltage-direct-current-hvdc"},
        {"id": "iea-hvdc", "title": "IEA — grid integration reports", "url": "https://www.iea.org/"},
    ],
})

W({
    "id": "nuclear-fission-power-plant",
    "name": "Nuclear Fission Power Plant",
    "tagline": "Controlled chain reaction steam supply that decouples electricity from chemical fuel oxidation for years per refuelling",
    "category": "energy",
    "era": "mid-20th",
    "difficulty": 5,
    "prerequisites": ["steam-turbine-electric-generation", "boiler-feedwater-treatment", "high-voltage-ac-transmission", "steel-production"],
    "unlocks": [],
    "problem": "Fossil steam ties megawatt-years to combustion chemistry and CO₂ venting. Fission concentrates energy in heavy nuclei — a teaspoon of idea-level fuel carries road-train coal energy if released in a disciplined lattice. The engineering problem is kinetics: sustain exactly one neutron per fission causing another fission; remove heat faster than meltdown; confine radioactive products across earthquakes and human error.\n\nMaterials face neutron embrittlement, helium bubbles in vessels, and boron depletion in absorbers. Chemistry faces radiolysis, crud on fuel surfaces, and iodine spike risks during transients.\n\nSocially, the technology cannot be honest without waste stewardship, proliferation safeguards, and transparent regulation — physics alone is insufficient.",
    "overview": "Light-water reactors use low-enriched uranium oxide pellets in zirconium alloy cladding, cooled by pressurised water transferring heat to a steam generator or boiling directly in BWRs. Control rods and soluble boron shim reactivity. Pressurisers or level control maintain coolant inventory. Containment buildings resist pressure from pipe breaks and hydrogen deflagrations if mitigation fails.\n\nSecondary steam systems resemble fossil plants — turbines, condensers, feed trains — except radiation zoning demands remote maintenance and shielding mazes. Spent fuel pools cool decay heat for years before dry cask storage or reprocessing politics.\n\nAdvanced designs propose coolants from helium to liquid sodium, each trading corrosion, activation, and leak reactivity.\n\nOperation is a licence to practice applied ethics: every alarm ties to a scenario analysis written in blood or ink from prior plants.",
    "principles": [
        {"name": "Six-factor formula intuition", "explanation": "Thermal utilisation, resonance escape, fast fission, reproduction factor, non-leakage probabilities multiply to k-effective — kept near 1.000 by operators."},
        {"name": "Doppler broadening", "explanation": "Fuel temperature rise broadens resonances, increasing absorption — negative reactivity feedback that buys seconds in transients."},
        {"name": "Decay heat", "explanation": "After shutdown, fission products still release ~6-7% power immediately — cooling must persist through blackouts or ponds boil."},
        {"name": "Dose ALARA", "explanation": "As low as reasonably achievable — optimisation under uncertainty, not minimisation regardless of cost."},
    ],
    "components": [
        {"id": "vessel", "name": "Reactor pressure vessel", "function": "Contains core and coolant at pressure", "position": "Containment well", "madeFrom": "Forged low-alloy steel with stainless clad"},
        {"id": "fuel", "name": "Fuel assemblies", "function": "Host fission in moderated spectrum", "position": "Core lattice", "madeFrom": "UO₂ pellets, Zircaloy tubes, spacer grids"},
        {"id": "steam-gen", "name": "Steam generator (PWR)", "function": "Transfers primary heat to secondary feedwater", "position": "Between primary and turbine island", "madeFrom": "Inconel tubesheets, alloy-690 tubes"},
        {"id": "rcp", "name": "Reactor coolant pumps", "function": "Circulates primary water", "position": "Hot leg to steam generator", "madeFrom": "Austenitic stainless castings, flywheels"},
        {"id": "containment", "name": "Containment and suppression", "function": "Holds fission product releases", "position": "Surrounds RPV", "madeFrom": "Prestressed concrete, steel liner, ice condensers in some designs"},
    ],
    "rawMaterials": [
        {"name": "Uranium concentrate", "purpose": "Fuel feed after conversion and enrichment", "earthLocations": ["Kazakhstan, Canada, Australia, Namibia"], "spaceAlternatives": "Terrestrial import — lunar He-3 is a different reactor class", "processingRequired": "Conversion to UF₆, centrifuge enrichment, reduction to UO₂"},
        {"name": "Heavy forgings", "purpose": "RPV shell monolithic integrity", "earthLocations": ["JSW, Creusot Loire historical"], "spaceAlternatives": "Import — cannot improvise", "processingRequired": "Quench and temper, UT inspection"},
        {"name": "Boron carbide", "purpose": "Control rod poison", "earthLocations": ["Turkey, Argentina boron sources"], "spaceAlternatives": "Hafnium rods alternative", "processingRequired": "Sintered pellets in stainless cladding"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Licensing and safety analysis", "description": "Probabilistic risk assessment; severe accident management; emergency planning zones.", "prerequisiteTools": ["RELAP, MELCOR class codes"], "warningNote": "Skipping peer review is criminal negligence"},
        {"order": 2, "title": "Fabricate nuclear-grade components", "description": "Material certificates; weld procedure qualification; clean-room assembly for internals.", "prerequisiteTools": ["radiography", "eddy current"], "warningNote": "Counterfeit bolts have killed projects"},
        {"order": 3, "title": "Fuel load and criticality benchmark", "description": "Approach critical with small boron dilution steps; compare keff to predictions.", "prerequisiteTools": ["startup instrumentation"], "warningNote": "Mis-counted bundles have approached criticality wrong — check twice"},
        {"order": 4, "title": "Hot functional testing", "description": "Run primary loops at temperature without fission power; vibration baseline pumps.", "prerequisiteTools": ["seismic monitors"], "warningNote": "Water hammer cracks steam generator tubes"},
        {"order": 5, "title": "Power ascension and relicensing", "description": "Ramp power through xenon transients; verify radiation monitors; maintain ageing management programmes.", "prerequisiteTools": ["health physics lab"], "warningNote": "Organisational drift causes accidents — training is hardware"},
    ],
    "history": [
        {"year": 1942, "event": "First self-sustaining chain reaction at Chicago Pile-1.", "location": "USA", "person": "Enrico Fermi"},
        {"year": 1954, "event": "Obninsk APS-1 supplies grid power — first civilian nuclear electricity.", "location": "USSR"},
        {"year": 1957, "event": "Shippingport reactor demonstrates PWR lineage in United States.", "location": "USA"},
    ],
    "inventors": [
        {"name": "Enrico Fermi", "contribution": "First controlled nuclear chain reaction", "years": "1901-1954", "nationality": "Italian-American"},
    ],
    "impact": "Nuclear plants supplied large fractions of carbon-free electricity in several nations — and concentrated waste, risk, and regulatory expertise.\n\nRestart without enrichment and metallurgy knowledge is effectively impossible; preserving documents is not enough without institutions.",
    "images": [],
    "videos": [{"id": "pwr-thermo", "title": "Pressurised water reactor thermohydraulics", "description": "Accredited nuclear engineering course segments on decay heat and containment.", "durationSeconds": 1500}],
    "externalLinks": [
        {"id": "iaea", "title": "IAEA — nuclear power information", "url": "https://www.iaea.org/topics/energy/nuclear-power"},
        {"id": "nrc", "title": "U.S. NRC — reactor concepts", "url": "https://www.nrc.gov/reading-rm/basic-ref/students/reactor-types.html"},
    ],
})

W({
    "id": "solar-photovoltaic-power-systems",
    "name": "Solar Photovoltaic Power Systems",
    "tagline": "Semiconductor junctions that convert sunlight directly into DC electricity — modular generation without rotating prime movers",
    "category": "energy",
    "era": "late-20th",
    "difficulty": 4,
    "prerequisites": ["transistor", "glass-making", "copper-wire-and-cable", "electrical-power-grid"],
    "unlocks": [],
    "problem": "Steam plants excel at baseload but demand fuel logistics. Photovoltaics harvest radiative flux where it lands — no turbine hall, no cooling water mandate for the cell itself. The problem is intermittency and area: sun returns vary with weather and season; useful power densities are orders of magnitude below fossil chemical bonds per kilogram of hardware.\n\nCell manufacturing couples semiconductor purity with micrometre metallisation and encapsulation that survives decades of UV, humidity, and thermal cycling. Field systems add trackers, inverters, and grid integration rules for frequency and voltage ride-through.\n\nWithout power electronics literacy, solar becomes a fragile sticker on roofs rather than grid infrastructure.",
    "overview": "Silicon cells begin as doped wafers; screen-print or plate front grid fingers; anti-reflection coat; interconnect ribbons string cells into modules laminated between glass and EVA backsheet. Modules series-parallel into strings; string inverters or central inverters convert DC to grid-synchronous AC. Maximum power point trackers adjust voltage to harvest changing irradiance.\n\nThin-film alternatives trade efficiency for manufacturing throughput on glass. Bifacial modules harvest albedo from below. Utility scales add single-axis trackers with backtracking algorithms to avoid row shading.\n\nDegradation modes include potential-induced degradation, snail trails, and solder bond fatigue — reliability engineering is outdoor weathering science.\n\nRecycling loops recover silver, silicon, and aluminium frames — emerging as gigawatts age out.",
    "principles": [
        {"name": "Shockley-Queisser limit", "explanation": "Single-junction detailed balance caps ideal efficiency near 33% for silicon under AM1.5 — tandem cells relax limit at cost."},
        {"name": "MPP tracking", "explanation": "Panel I-V curve shifts with irradiance and temperature; operating away from knee wastes harvest."},
        {"name": "Temperature coefficient", "explanation": "Higher cell temperature reduces open-circuit voltage — desert installs trade sun for heat penalty."},
        {"name": "Harmonics from inverters", "explanation": "PWM grid ties must meet utility THD and anti-islanding rules."},
    ],
    "components": [
        {"id": "cell", "name": "Solar cell", "function": "Photovoltaic conversion", "position": "Module string", "madeFrom": "Silicon PERC or heterojunction stacks"},
        {"id": "module", "name": "Glass-encapsulated module", "function": "Protects cells; provides frame mounting", "position": "Array field", "madeFrom": "Low-iron glass, EVA, backsheet"},
        {"id": "inverter", "name": "Grid-tie inverter", "function": "MPPT and grid synchronisation", "position": "String or central", "madeFrom": "IGBT H-bridge, DSP control"},
        {"id": "tracker", "name": "Tracker actuator", "function": "Aims modules toward sun", "position": "Row torque tube", "madeFrom": "Slew drives, anemometer interlock"},
        {"id": "transformer", "name": "Step-up transformer", "function": "Matches inverter voltage to medium-voltage collection", "position": "Pad mount", "madeFrom": "Dry-type or liquid-filled"},
    ],
    "rawMaterials": [
        {"name": "Polysilicon", "purpose": "Wafer feedstock", "earthLocations": ["China, Germany, USA polysilicon plants"], "spaceAlternatives": "Import until chlorosilane chain exists", "processingRequired": "Directional solidification ingots, wire saw"},
        {"name": "Silver paste", "purpose": "Front contacts", "earthLocations": ["Precious metals refiners"], "spaceAlternatives": "Copper plating under development to cut Ag", "processingRequired": "Fire-through contact firing profile"},
        {"name": "Low-iron glass", "purpose": "High transmission front sheet", "earthLocations": ["Float lines near deserts"], "spaceAlternatives": "Thin films on flexible substrates", "processingRequired": "Tempering for mechanical load"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Site insolation and interconnection study", "description": "Model shading, soil resistivity for grounding, and queue position on grid.", "prerequisiteTools": ["PVsyst or equivalent"], "warningNote": "Transformer tap mismatch causes chronic inverter trips"},
        {"order": 2, "title": "Mechanical install and bonding", "description": "Torque clamps; equipotential bonding; lightning protection down conductors.", "prerequisiteTools": ["torque wrenches", "megger"], "warningNote": "Wind torsion cracks cells if clamps underspecified"},
        {"order": 3, "title": "Commission inverters", "description": "Set anti-islanding; verify G59/G83 class protections; harmonics scan at POC.", "prerequisiteTools": ["PQ analyser"], "warningNote": "Lagging power factor penalties erase revenue"},
        {"order": 4, "title": "Performance ratio monitoring", "description": "Irradiance sensors versus expected kWh; identify string outages.", "prerequisiteTools": ["SCADA"], "warningNote": "Snail trails start as warranty fights — photograph modules at handover"},
        {"order": 5, "title": "Plan end-of-life logistics", "description": "Track serials for silver recovery; avoid landfill arsenic from thin-film panels if used.", "prerequisiteTools": ["recycler contracts"], "warningNote": "Firefighters need module hazard sheets — DC strings stay live in daylight"},
    ],
    "history": [
        {"year": 1954, "event": "Bell Labs demonstrates silicon solar cell with useful efficiency.", "location": "USA"},
        {"year": 2000, "event": "Grid parity pursuit drives polysilicon scaling and feed-in tariff experiments.", "location": "Germany, Spain"},
        {"year": 2020, "event": "Utility PV becomes cheapest new generation in many sunbelt markets.", "location": "Global"},
    ],
    "inventors": [
        {"name": "Russell Ohl", "contribution": "Patent work on silicon photovoltaic effect at Bell Labs", "years": "1898-1987", "nationality": "American"},
    ],
    "impact": "PV decentralised generation to rooftops and deserts alike — and forced grids to learn flexibility, storage, and forecasting.\n\nIt is semiconductor manufacturing wearing a civil engineering hat.",
    "images": [],
    "videos": [{"id": "pv-mppt", "title": "Solar MPPT and grid integration", "description": "Renewable energy engineering courses on inverter controls.", "durationSeconds": 720}],
    "externalLinks": [
        {"id": "nrel-pv", "title": "NREL — photovoltaics research", "url": "https://www.nrel.gov/pv/"},
        {"id": "iea-pvps", "title": "IEA PVPS programme", "url": "https://iea-pvps.org/"},
    ],
})

W({
    "id": "high-capacity-electrochemical-batteries",
    "name": "High-Capacity Electrochemical Batteries",
    "tagline": "Reversible electron transfer cells that store grid and mobility energy as chemical potential — hours to days of buffer",
    "category": "energy",
    "era": "late-20th",
    "difficulty": 4,
    "prerequisites": ["copper-wire-and-cable", "steel-production", "smelting-bronze-age", "electric-motor"],
    "unlocks": [],
    "problem": "Electricity is notoriously hard to inventory as electricity — without rotation or chemistry it vanishes in milliseconds of mismatch. Batteries store energy as compositional gradients across electrodes and electrolyte, releasing it when ions shuffle back under controlled electron flow through external circuits.\n\nScaling requires managing dendrites, thermal runaway, gas venting, and state-of-charge estimation across thousands of series cells. Recycling demands separation of cobalt, nickel, lithium, and fluorinated salts without poisoning workers.\n\nLead-acid taught industry about stratification and sulfation; lithium-ion taught it about nail penetration tests and shipping regulations — each chemistry has its moral syllabus.",
    "overview": "Primary cells are single-use; secondary cells intercalate ions reversibly. Lead-acid uses Pb and PbO₂ in sulphuric acid — heavy but recyclable. Lithium-ion inserts Li⁺ into graphite and metal oxide cathodes with carbonate electrolytes; solid-state variants promise safer electrolytes at manufacturing pain cost. Flow batteries shunt energy into dissolved redox couples in tanks, decoupling power from energy capacity.\n\nBattery management systems monitor cell voltages and temperatures, balance series strings, and isolate faults. Thermal systems use cold plates or refrigerant loops for fast charge.\n\nGrid-scale containers integrate inverters, transformers, and fire suppression — codes are evolving as incidents teach what 'thermal propagation' means in a packed aisle.\n\nSecond-life EV packs for stationary storage extend useful life before recycling — if state-of-health algorithms are honest.",
    "principles": [
        {"name": "Nernst voltage", "explanation": "Open-circuit potential ties to activities of redox species — SOC estimation fuses voltage with coulomb counting."},
        {"name": "Solid-electrolyte interphase", "explanation": "Passivation layer on anode consumes lithium irreversibly — formation cycles matter."},
        {"name": "C-rate limits", "explanation": "High current raises ohmic loss and lithium plating risk on graphite — fast charge needs thermal headroom."},
        {"name": "Arrhenius ageing", "explanation": "Calendar and cycle life accelerate exponentially with temperature — parking a hot EV full kills capacity quietly."},
    ],
    "components": [
        {"id": "cell", "name": "Cell can or pouch", "function": "Holds electrodes, separator, electrolyte", "position": "Module building block", "madeFrom": "Aluminium pouch or steel cylindrical can"},
        {"id": "separator", "name": "Microporous separator", "function": "Ionically conductive, electronically insulating", "position": "Between electrodes", "madeFrom": "PE/PP trilayer with shutdown melt"},
        {"id": "bms", "name": "Battery management system", "function": "Balances, protects, estimates SOC/SOH", "position": "Module or pack controller", "madeFrom": "ASIC front ends, microcontroller, contactors"},
        {"id": "cooling", "name": "Thermal management", "function": "Keeps cells within safe map", "position": "Cold plates or refrigerant loop", "madeFrom": "Aluminium extrusions, glycol"},
        {"id": "inverter", "name": "Bidirectional inverter", "function": "Charges/discharges pack to AC grid", "position": "Container skid", "madeFrom": "IGBT stack matching dc-power drives"},
    ],
    "rawMaterials": [
        {"name": "Lithium salts", "purpose": "Electrolyte LiPF₆ etc.", "earthLocations": ["Atacama brines, Australian spodumene"], "spaceAlternatives": "Import until brine processing exists", "processingRequired": "Dry rooms during cell fill"},
        {"name": "Nickel cobalt manganese oxides", "purpose": "Cathode active material", "earthLocations": ["New Caledonia, Indonesia nickel laterites"], "spaceAlternatives": "LFP cathodes reduce cobalt dependence", "processingRequired": "Hydrothermal co-precipitation, lithiation calcine"},
        {"name": "Graphite anodes", "purpose": "Intercalation host", "earthLocations": ["China synthetic graphite dominant"], "spaceAlternatives": "Silicon blends for higher capacity — swelling challenges", "processingRequired": "Spheroidisation and carbon coating"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Electrode coating and calendering", "description": "Slurry coat foils; dry; compress to target porosity; slit widths.", "prerequisiteTools": ["coating lines", "beta gauges"], "warningNote": "Humidity spikes gel slurries — dew point control"},
        {"order": 2, "title": "Stack and fill", "description": "Wind jelly rolls or stack prismatic layers; electrolyte fill under vacuum; seal.", "prerequisiteTools": ["leak testers"], "warningNote": "Contaminant ppm levels shift cycle life by double digits"},
        {"order": 3, "title": "Formation cycling", "description": "Slow charge cycles grow SEI; sort cells by capacity.", "prerequisiteTools": ["cycler farms"], "warningNote": "Gas generation during formation needs vent paths"},
        {"order": 4, "title": "Pack integration and abuse testing", "description": "Nail crush, overcharge, external fire protocols for certification.", "prerequisiteTools": ["calorimeter"], "warningNote": "Propagation tests must be witnessed remotely"},
        {"order": 5, "title": "Deploy with EMS integration", "description": "Ancillary service schedules; SOC guard bands for warranty; recycling contracts.", "prerequisiteTools": ["grid SCADA APIs"], "warningNote": "Cycling to 100% daily voids warranties fast"},
    ],
    "history": [
        {"year": 1859, "event": "Planté rechargeable lead-acid cell demonstrates secondary battery concept.", "location": "France", "person": "Gaston Planté"},
        {"year": 1991, "event": "Sony commercialises lithium-ion cylindrical cells for consumer electronics.", "location": "Japan"},
        {"year": 2010, "event": "Grid-scale lithium containers proliferate with renewable integration.", "location": "USA, Australia, EU"},
    ],
    "inventors": [
        {"name": "John Goodenough", "contribution": "Cathode materials enabling rechargeable lithium batteries", "years": "1922-2023", "nationality": "American"},
    ],
    "impact": "Batteries made handheld computers and EVs credible — and forced chemists, fire departments, and miners into one supply chain argument.\n\nThey are chemical factories folded into flat packs — respect the vent.",
    "images": [],
    "videos": [{"id": "li-ion-safety", "title": "Lithium-ion safety mechanisms", "description": "Accredited materials science lectures on SEI and thermal runaway.", "durationSeconds": 900}],
    "externalLinks": [
        {"id": "battery-university", "title": "Battery University — technical primers", "url": "https://batteryuniversity.com/"},
        {"id": "iea-batteries", "title": "IEA — batteries and secure transitions", "url": "https://www.iea.org/energy-system/electricity/batteries"},
    ],
})

# --- Communication (10 new; 3 existing: semiconductor, vacuum, transistor) ---

W({
    "id": "spoken-language",
    "name": "Spoken Language",
    "tagline": "Shared sound patterns that coordinate teaching, planning, and culture faster than gesture alone",
    "category": "communication",
    "era": "prehistoric",
    "difficulty": 1,
    "prerequisites": [],
    "unlocks": ["writing-early-systems"],
    "problem": "Without speech, knowledge is bound to immediate demonstration. Multi-step plans — hunting drives, bridge building, negotiating truce — collapse when participants cannot serialise intentions into compact symbols others correct. Sound crosses brush and dark; it frees hands; it enables children to download centuries in years.\n\nThe obstacle is not vocal cords alone but social agreement: stable meanings, norms of truthfulness, and institutions that correct drift. Oral societies preserve technique in metre and story — beautiful but lossy across bottlenecks.\n\nEvery later communication technology is compression of speech: writing freezes word order; telegraph pays per character; codecs predict phonemes.",
    "overview": "Spoken language combines a finite phoneme inventory with compositional grammar. Prosody layers intent and affect. Acquisition in children couples statistical learning with caregiver feedback; adults learn second languages with more effort but the same combinatorial core.\n\nOral corpora — law, medicine, navigation — rely on rhythm and redundancy for fidelity. Writing partially replaces those affordances with external error correction.\n\nFor recovery, preserving fluent expert dialogue alongside books rebuilds tacit motor skills faster than silent reading alone.",
    "principles": [
        {"name": "Compositionality", "explanation": "Finite means, infinite use — new sentences remain interpretable if grammar is shared."},
        {"name": "Pragmatic enrichment", "explanation": "Context disambiguates reference; without shared ground, even perfect syntax miscommunicates."},
        {"name": "Sound change", "explanation": "Pronunciation drifts; orthography lags — literacy partially freezes phonology."},
        {"name": "Displacement", "explanation": "Language references absent objects and times — prerequisite for planning and history."},
    ],
    "components": [
        {"id": "phonology", "name": "Phonological inventory", "function": "Contrasts meaningful sounds", "position": "Learned early", "madeFrom": "Neural maps shaped by exposure"},
        {"id": "lexicon", "name": "Lexicon", "function": "Stores form-meaning mappings", "position": "Long-term memory", "madeFrom": "Distributed cortical traces"},
        {"id": "grammar", "name": "Grammar", "function": "Combines morphemes into interpretable utterances", "position": "Real-time production and parsing", "madeFrom": "Rule-like regularities or constraint interactions"},
        {"id": "pragmatics", "name": "Pragmatics", "function": "Manages implicature, politeness, turn-taking", "position": "Every utterance", "madeFrom": "Social norms"},
    ],
    "rawMaterials": [
        {"name": "Living speech community", "purpose": "Maintains and negotiates the code", "earthLocations": ["Everywhere humans congregate"], "spaceAlternatives": "Scheduled social bandwidth; latency harms prosody cues", "processingRequired": "Intergenerational teaching institutions"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Anchor joint attention", "description": "Pair words with salient objects and actions until learners expect labels.", "prerequisiteTools": ["caregivers", "stable routines"], "warningNote": "Coercion without meaning produces mimicry only"},
        {"order": 2, "title": "Expand core vocabulary", "description": "Prioritise hazards, tools, kinship, and directions observable in environment.", "prerequisiteTools": ["naming games"], "warningNote": "Homonyms across dialects confuse rebuild teams — document senses"},
        {"order": 3, "title": "Teach narrative and argument", "description": "Use stories with false-belief tasks; train correction culture.", "prerequisiteTools": ["council meetings"], "warningNote": "Gossip can destroy trust faster than fire"},
        {"order": 4, "title": "Drill noisy-channel resilience", "description": "Practice high wind, long distance, and interrupted turns — maritime and steppe cultures preserved such drills.", "prerequisiteTools": ["whistles optional"], "warningNote": "Homophones become dangerous in aviation-style readbacks"},
        {"order": 5, "title": "Record oral corpus when possible", "description": "Even before writing, cyclic festivals audit technical terms for drift.", "prerequisiteTools": ["memory techniques"], "warningNote": "Power hierarchies distort transcripts — rotate scribes"},
    ],
    "history": [
        {"year": "300000+ years ago", "event": "Debate continues on timing of full language; anatomical proxies suggest long evolution.", "location": "Africa"},
        {"year": "Upper Palaeolithic", "event": "Symbolic behaviour and trade imply complex proposition exchange.", "location": "Global"},
    ],
    "inventors": [],
    "impact": "Speech is the substrate of law, science, and love letters yet unwritten. Lose fluent communities and you lose more than accent — you lose debugging bandwidth.",
    "images": [],
    "videos": [{"id": "lang-acq", "title": "Language acquisition overview", "description": "Accredited linguistics lectures on child-directed speech.", "durationSeconds": 600}],
    "externalLinks": [
        {"id": "wals", "title": "World Atlas of Language Structures", "url": "https://wals.info/"},
        {"id": "plato-lang", "title": "Stanford Encyclopedia — philosophy of language", "url": "https://plato.stanford.edu/entries/language/"},
    ],
})

W({
    "id": "writing-early-systems",
    "name": "Writing (Early Systems)",
    "tagline": "Visible marks that store language across time — from tokens to cuneiform and hieroglyphs",
    "category": "communication",
    "era": "ancient",
    "difficulty": 2,
    "prerequisites": ["spoken-language", "ceramics-and-pottery"],
    "unlocks": ["paper-and-ink-media"],
    "problem": "Speech fades when the breath stops. Accounting for granaries, tithes, and loans needed tallies that survived seasons. Early writing solves external memory: marks on clay, stone, or papyrus that rehydrate meaning in competent readers.\n\nThe obstacle shifts from air to material: durable substrates, standardised signs, and scribal training. Pictographic and syllabic systems trade learnability for compactness; mastering thousands of signs is a profession.\n\nWriting also enables law codes and propaganda — power concentrates around literate castes until literacy spreads.",
    "overview": "Proto-writing used clay tokens then impressed tablets; cuneiform pressed wedge strokes into wet clay; Egyptian hieroglyphs mixed logographic and phonetic signs. Rebus principle maps sound of pictured word to unrelated homonyms — bridge to syllabaries.\n\nScribes used styluses, palettes, and firing kilns for tablets. Copying errors become manuscript traditions; commentaries fossilise readings.\n\nLiteracy rates stayed tiny for millennia; still, writing let empires administer distance — orders could outlive couriers if sealed and authenticated.\n\nDecipherment today uses bilinguals like Rosetta parallels — a warning to archive dictionaries, not just texts.",
    "principles": [
        {"name": "Rebus and phonetisation", "explanation": "Pictures of things whose names sound like abstract words bootstrap syllabic spelling."},
        {"name": "Determinatives", "explanation": "Silent classifiers disambiguate homographic logograms — early error correction."},
        {"name": "Material constraints", "explanation": "Clay encourages wedge strokes; papyrus encourages ink flows — script shape is partly substrate physics."},
        {"name": "Orthographic depth", "explanation": "Mapping from graphemes to phonemes can be opaque — reading becomes partially memorised lexicon even in alphabets."},
    ],
    "components": [
        {"id": "substrate", "name": "Tablet or scroll substrate", "function": "Carries marks physically", "position": "Archive or messenger tube", "madeFrom": "Clay, papyrus, stone"},
        {"id": "stylus", "name": "Stylus, brush, or chisel", "function": "Applies marks with repeatable strokes", "position": "Scribe hand", "madeFrom": "Reed, bone, metal"},
        {"id": "signary", "name": "Sign inventory", "function": "Encodes morphemes, syllables, or words", "position": "Pedagogical curriculum", "madeFrom": "Curated tradition"},
        {"id": "seal", "name": "Seal and authentication", "function": "Binds identity to document", "position": "Clay envelope or tag", "madeFrom": "Stone cylinder seals"},
    ],
    "rawMaterials": [
        {"name": "Clay and temper", "purpose": "Tablet medium", "earthLocations": ["Mesopotamian alluvium", "Nile mud"], "spaceAlternatives": "Sintered regolith tablets if humour permits", "processingRequired": "Levigate; wedge while leather-hard; fire optional"},
        {"name": "Carbon black and gum", "purpose": "Ink precursors on papyrus", "earthLocations": ["Lampblack production", "acacia gum"], "spaceAlternatives": "Synthetic pigments later", "processingRequired": "Mulling into binder"},
        {"name": "Papyrus or parchment", "purpose": "Flexible scrolls", "earthLocations": ["Nile delta papyrus", "sheep economies for parchment"], "spaceAlternatives": "Paper replaces when available", "processingRequired": "Layering, pressing, polishing"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Standardise sign list", "description": "Choose finite repertory; document stroke order; forbid idiosyncratic squiggles in official tablets.", "prerequisiteTools": ["master scribe"], "warningNote": "Sign multiplication defeats pedagogy"},
        {"order": 2, "title": "Prepare tablets", "description": "Uniform thickness; smooth face; control drying rate to avoid curling.", "prerequisiteTools": ["wooden battens"], "warningNote": "Air bubbles pop during firing — inspect leather-hard"},
        {"order": 3, "title": "Teach copying cycles", "description": "Dictation then independent composition; peer marking reduces drift.", "prerequisiteTools": ["schoolroom"], "warningNote": "Dyslexia analogues exist — rotate teaching methods"},
        {"order": 4, "title": "Archive with indexes", "description": "Edge marks, tags, and shelved orientation speed retrieval.", "prerequisiteTools": ["shelves", "catalogue tablets"], "warningNote": "Flood and fire are symmetric threats — duplicate sites"},
        {"order": 5, "title": "Publish law and ritual corpora", "description": "Visible stelae synchronise public meaning; reduces elite-only drift.", "prerequisiteTools": ["stone masons"], "warningNote": "Propaganda risk — pair with critique institutions"},
    ],
    "history": [
        {"year": "3400-3100 BCE", "event": "Proto-cuneiform accounting tablets in Uruk.", "location": "Mesopotamia"},
        {"year": "3200 BCE", "event": "Early hieroglyphic inscription on labels in Abydos contexts.", "location": "Egypt"},
    ],
    "inventors": [],
    "impact": "Writing turned speech into inventory — law, recipe, and insult alike. It also created scribal power until alphabets and printing widened access.",
    "images": [],
    "videos": [{"id": "cuneiform", "title": "Cuneiform and early writing", "description": "Museum educator videos on clay tablet production.", "durationSeconds": 720}],
    "externalLinks": [
        {"id": "met-writing", "title": "The Met — origins of writing", "url": "https://www.metmuseum.org/toah/hd/writing/hd_writing.htm"},
        {"id": "britannica-cuneiform", "title": "Britannica — cuneiform", "url": "https://www.britannica.com/topic/cuneiform"},
    ],
})

W({
    "id": "paper-and-ink-media",
    "name": "Paper and Ink Media",
    "tagline": "Thin cellulose sheets and fluid pigments that make writing lightweight, foldable, and mass-producible",
    "category": "communication",
    "era": "ancient",
    "difficulty": 2,
    "prerequisites": ["writing-early-systems", "cooking"],
    "unlocks": ["printing-press-movable-type"],
    "problem": "Clay is heavy; parchment is expensive; bamboo slips shuffle apart. Paper — fibrillated cellulose matted into sheets — offers a portable, cuttable substrate that accepts ink without immediate bleed-through if sized.\n\nManufacturing must beat pests: silverfish, mould, and acidic lignin that embrittles sheets. Inks must not fade instantly nor corrode fibres — iron gall ink taught archivists about acidity centuries before pH meters.\n\nPaper made bureaucracy portable enough for empires and later for printed broadsides — a logistics revolution disguised as stationery.",
    "overview": "Traditional paper pulps rags or wood, beats fibres in water, forms sheets on moulds, presses, and dries. Sizing with gelatin or starch reduces feathering. East Asian papers used mulberry and rice straw; Islamic mills refined rag paper; European industrialisation added Hollander beaters and Fourdrinier machines.\n\nInks span carbon soot binders, iron gall, and later aniline dyes. Fountain pens demanded controlled surface tension; ballpoints needed quick-drying oils.\n\nArchival practice deacidifies; stores in climate control; digitises as insurance — paper is mortal.\n\nFor recovery, rag supply chains and clear water matter as much as presses.",
    "principles": [
        {"name": "Hydrogen bonding network", "explanation": "Cellulose fibres mat through hydrogen bonds when drained — strength scales with beating energy and fibre length."},
        {"name": "Sizing chemistry", "explanation": "Fill pores partially so ink sits atop; oversizing repels ink — balance is empirical."},
        {"name": "Lignin yellowing", "explanation": "Mechanical wood pulp retains lignin that oxidises — newsprint is ephemeral by chemistry."},
        {"name": "Capillary wicking", "explanation": "Porosity and fibre orientation set anisotropic spread — grain direction matters for folding and printing."},
    ],
    "components": [
        {"id": "pulp", "name": "Pulp slurry", "function": "Suspends separated fibres", "position": "Vat or machine chest", "madeFrom": "Rag or wood chips after cook"},
        {"id": "mould", "name": "Mould and deckle", "function": "Forms sheet area and edge", "position": "Hand papermaking", "madeFrom": "Woven brass or plastic screens"},
        {"id": "press", "name": "Press section", "function": "Removes water mechanically", "position": "Fourdrinier line", "madeFrom": "Felt belts, rollers"},
        {"id": "size", "name": "Size bath", "function": "Treats sheet surface", "position": "Post-formation", "madeFrom": "Starch or AKD emulsion modern"},
        {"id": "ink", "name": "Ink formulation", "function": "Provides stable pigment dispersion", "position": "Printer or pen", "madeFrom": "Pigment, vehicle, surfactants"},
    ],
    "rawMaterials": [
        {"name": "Cellulosic fibre", "purpose": "Paper body", "earthLocations": ["Cotton and linen rags historically", "softwood kraft pulp modern"], "spaceAlternatives": "Recycled fibre loops", "processingRequired": "Cook, bleach selectively, beat"},
        {"name": "Water", "purpose": "Slurry medium and washing", "earthLocations": ["River mills"], "spaceAlternatives": "Closed-loop treatment", "processingRequired": "Clarify to avoid spots"},
        {"name": "Pigments", "purpose": "Ink colour", "earthLocations": ["Carbon black", "organic dyes"], "spaceAlternatives": "Mineral pigments", "processingRequired": "Disperse to submicron to avoid clogging"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Fibre preparation", "description": "Sort rags; remove buttons; cook with lime if needed; beat to fibrillation target.", "prerequisiteTools": ["Hollander beater or stamp mill"], "warningNote": "Metallic fasteners destroy beaters"},
        {"order": 2, "title": "Sheet formation", "description": "Vat dip or machine lay; control basis weight with consistency loop.", "prerequisiteTools": ["scales", "micrometres"], "warningNote": "Uneven couching tears on printing press"},
        {"order": 3, "title": "Press and dry", "description": "Gradual drying prevents cockling; restraint drying for flatness.", "prerequisiteTools": ["screw press", "loft"], "warningNote": "Too-fast drying case-hardens surfaces"},
        {"order": 4, "title": "Size and polish", "description": "Brush gelatin size; calendar if high gloss needed.", "prerequisiteTools": ["brushes"], "warningNote": "Acidic alum size ages poorly — track pH"},
        {"order": 5, "title": "Test print", "description": "Proof with intended ink and press pressure; adjust absorbency.", "prerequisiteTools": ["proof press"], "warningNote": "Coated paper needs different inks than offset stock"},
    ],
    "history": [
        {"year": "105 CE (traditional)", "event": "Cai Lun associated with papermaking improvement in Chinese tradition.", "location": "China", "person": "Cai Lun"},
        {"year": 1150, "event": "Paper mill established in Xàtiva region — spreads in Islamic world and Europe.", "location": "Al-Andalus"},
    ],
    "inventors": [
        {"name": "Cai Lun", "contribution": "Traditional attribution for Han-era papermaking improvements", "years": "c. 50-121 CE", "nationality": "Chinese"},
    ],
    "impact": "Paper lowered the mass-per-word of bureaucracy and scholarship — prerequisite for printing’s economics and for modern notebooks that think alongside engineers.",
    "images": [],
    "videos": [{"id": "hand-paper", "title": "Hand papermaking", "description": "Craft demonstrations of mould and deckle technique.", "durationSeconds": 480}],
    "externalLinks": [
        {"id": "getty-paper", "title": "Getty — paper conservation", "url": "https://www.getty.edu/conservation/publications_resources/pdf_publications/paper.pdf"},
        {"id": "iapaper", "title": "International Association of Paper Historians", "url": "http://www.paperhistory.org/"},
    ],
})

W({
    "id": "printing-press-movable-type",
    "name": "Printing Press (Movable Type)",
    "tagline": "Mechanised impression of reusable type — mass duplication of text with repeatable fidelity",
    "category": "communication",
    "era": "medieval",
    "difficulty": 3,
    "prerequisites": ["paper-and-ink-media", "steel-production", "basic-hand-tools"],
    "unlocks": ["electrical-telegraph"],
    "problem": "Scriptoria copied manuscripts slowly; errors compounded; cost limited books to institutions. Movable type cuts marginal cost per page after the first composition: each character is a durable punch, cast in alloy, arranged into a forme, inked, and pressed uniformly.\n\nThe engineering problems are mechanical: even impression across a wide platen, ink viscosity that neither dries on type nor bleeds on paper, and alloy hardness that survives millions of impacts. The information problem is workflow: justification, proofing, and distribution of corrected editions.\n\nPrinting did not invent text — it industrialised fidelity and speed, enabling law, science, and heresy to travel faster than censors could rewrite by hand.",
    "overview": "Punches cut in steel are struck into copper matrices; type is cast in lead-tin-antimony alloy with a shoulder for locking. Compositors set lines in composing sticks; furniture and quoins lock the chase. The press supplies gradual pressure via screw or later lever and toggle mechanisms; platen or cylinder designs evolve toward rotary newspaper presses.\n\nOil-based inks coat metal type better than water-based on greasy fingers — formulation becomes chemistry. Paper must withstand squeeze without embossing through; dampening helps some processes.\n\nPost-Gutenberg evolution added stereotype plates, linotype slug casting, and offset lithography — but movable type is the conceptual fork between copying and manufacturing text.\n\nDigital fonts are coordinate lists — intellectual descendants of the punchcutter’s file.",
    "principles": [
        {"name": "Viscosity and tack", "explanation": "Ink must split cleanly between type surface and paper without picking fibres — temperature and pigment load tune rheology."},
        {"name": "Hardness matching", "explanation": "Type metal softer than punch steel but harder than paper contaminants — otherwise letters mushroom."},
        {"name": "Impression pressure distribution", "explanation": "Platen parallelism and packing paper shims equalise density — else outer lines fade."},
        {"name": "Justification geometry", "explanation": "Word spacing and thin spaces absorb line-length slack — hyphenation rules are hyphenation algorithms."},
    ],
    "components": [
        {"id": "type", "name": "Movable type sorts", "function": "Carries reversed letter relief", "position": "Locked in chase", "madeFrom": "Pb-Sn-Sb alloy"},
        {"id": "chase", "name": "Chase and furniture", "function": "Holds composed forme under pressure", "position": "On press bed", "madeFrom": "Hardwood or metal"},
        {"id": "press", "name": "Press mechanism", "function": "Applies controlled normal force", "position": "Workshop floor", "madeFrom": "Iron screw, later lever systems"},
        {"id": "ink", "name": "Printing ink", "function": "Transfers pigment under shear", "position": "Brayer or roller", "madeFrom": "Linseed oil, carbon pigment historically"},
        {"id": "composition", "name": "Composing stick and cases", "function": "Human interface for setting lines", "position": "Compositors bench", "madeFrom": "Wood, divided type cases"},
    ],
    "rawMaterials": [
        {"name": "Type metal", "purpose": "Casts sharp yet tough type", "earthLocations": ["Lead smelters", "tin trade routes"], "spaceAlternatives": "3D-printed polymer type for short runs — wears fast", "processingRequired": "Remelt with antimony adjustment"},
        {"name": "Punch steel", "purpose": "Cut master letters", "earthLocations": ["Tool steel supply"], "spaceAlternatives": "Electrical discharge machining later", "processingRequired": "Harden and temper; polish striking face"},
        {"name": "Paper stock", "purpose": "Receives impression", "earthLocations": ["Paper mills"], "spaceAlternatives": "Rag paper historically", "processingRequired": "Grain direction aligned to press"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Cut and justify punches", "description": "File counters; proof on smoke-blackened paper; strike matrix.", "prerequisiteTools": ["punch vise", "10x loupe"], "warningNote": "Lead dust — ventilation and hygiene"},
        {"order": 2, "title": "Cast type to height", "description": "Measure type height to press standard; shave feet if needed.", "prerequisiteTools": ["type height gauge"], "warningNote": "Mixed heights crack formes under pressure"},
        {"order": 3, "title": "Compose and lock", "description": "Insert leads; lock with quoins; proof on waste sheets.", "prerequisiteTools": ["composing stick"], "warningNote": "Bruised sorts print grey — replace"},
        {"order": 4, "title": "Ink and pull", "description": "Charge rollers evenly; two-pull habit for solids; inspect register.", "prerequisiteTools": ["composition rollers"], "warningNote": "Over-ink fills counters"},
        {"order": 5, "title": "Distribute and maintain", "description": "Return sorts to cases; melt worn type; document font inventory.", "prerequisiteTools": ["melting pot"], "warningNote": "Antimony fumes — respirators"},
    ],
    "history": [
        {"year": "c. 1040", "event": "Bi Sheng experiments with ceramic movable type in Chinese tradition.", "location": "China", "person": "Bi Sheng"},
        {"year": "c. 1450", "event": "Gutenberg Bible era printing with metal type and press in Mainz.", "location": "Germany", "person": "Johannes Gutenberg"},
    ],
    "inventors": [
        {"name": "Johannes Gutenberg", "contribution": "European metal movable-type printing with oil ink and press", "years": "c. 1400-1468", "nationality": "German"},
    ],
    "impact": "Printing collapsed the price of identical knowledge — law, scripture, and diagrams could disagree in public because multiple copies existed. It preconditioned scientific societies and newspapers.\n\nMovable type’s social externalities include propaganda at scale — technology never prints only truth.",
    "images": [],
    "videos": [{"id": "letterpress", "title": "Letterpress printing", "description": "Museum demonstrations of composition and pull.", "durationSeconds": 600}],
    "externalLinks": [
        {"id": "britannica-printing", "title": "Britannica — printing press", "url": "https://www.britannica.com/technology/printing-press"},
        {"id": "gutenberg-museum", "title": "Gutenberg Museum", "url": "https://www.gutenberg-museum.de/"},
    ],
})

W({
    "id": "electrical-telegraph",
    "name": "Electrical Telegraph",
    "tagline": "Pulses on wires encoding letters at light-speed — shrinking command-and-control latency across continents",
    "category": "communication",
    "era": "industrial",
    "difficulty": 3,
    "prerequisites": ["printing-press-movable-type", "copper-wire-and-cable", "glass-making", "steel-production"],
    "unlocks": ["telephone-exchange-system", "radio-broadcast-and-receiver"],
    "problem": "Horse couriers and semaphore chains could not keep pace with rail timetables, naval logistics, or commodity prices. The telegraph encodes language into electrical events — closing circuits for dots and dashes — so operators transcribe at human speed while propagation delay is negligible on land.\n\nChallenges include insulation on long buried or submarine cables, lightning induction burning instruments, and synchronising clocks for train safety. Codebooks compress proprietary business messages; cryptography appears immediately.\n\nEconomically, telegraphy priced information like freight — but by the bit, not the ton.",
    "overview": "A battery keys a line; an electromagnet pulls a sounder or marks a paper tape. Repeater stations regenerate weak signals. Insulators of glass or porcelain separate wires from earth; lightning arrestors sacrifice paths to protect offices.\n\nSubmarine cables add gutta-percha or polyethylene jackets, armouring, and repeaters in fibre era — but copper coax ancestors carried telegraphy across oceans first with heroic thickness and regretful engineering guesses about capacitance.\n\nMorse code standardises timing; continental variants tweak alphabet mappings. Training schools produce operators with rhythmic ears — a craft killed by telephone speech then resurrected as CW ham radio.\n\nTelegraph offices became nodes in graphs; stock tickers and train order offices were clients — infrastructure thinking we now call networking.",
    "principles": [
        {"name": "Ohm’s law on long lines", "explanation": "Leakage conductance and capacitance smear pulses — Heaviside’s loading coils and later repeaters fight distortion."},
        {"name": "Signal-to-noise in wet insulation", "explanation": "Moisture raises conductance — maintenance crews walk lines with megohmmeters."},
        {"name": "Human baud rate", "explanation": "Skilled Morse beats naive typing for skinny channels — ergonomics of rhythm."},
        {"name": "Common versus metallic circuit", "explanation": "Early earth returns save copper; interference teaches symmetric pairs."},
    ],
    "components": [
        {"id": "key", "name": "Morse key and sounder", "function": "Human I/O for code", "position": "Operator desk", "madeFrom": "Brass contacts, electromagnet"},
        {"id": "battery", "name": "Grove or Daniell cells historically", "function": "Supplies line current", "position": "Office", "madeFrom": "Zinc, copper, acid"},
        {"id": "line", "name": "Iron or copper line wire", "function": "Propagates pulses", "position": "Poles or buried", "madeFrom": "Galvanised iron then copper"},
        {"id": "insulator", "name": "Glass insulator", "function": "Supports wire electrically", "position": "Crossarm pins", "madeFrom": "Porcelain or glass"},
        {"id": "relay", "name": "Telegraph relay", "function": "Regenerates weak currents", "position": "Repeater huts", "madeFrom": "Sensitive coil, local battery"},
    ],
    "rawMaterials": [
        {"name": "Copper wire", "purpose": "Low resistance long lines", "earthLocations": ["Telegraph boom districts 19c"], "spaceAlternatives": "Optical later", "processingRequired": "Annealed soft draw for wrapping"},
        {"name": "Lead-acid batteries", "purpose": "Station power", "earthLocations": ["Lead smelters"], "spaceAlternatives": "Dynamos later", "processingRequired": "Form plates and activate"},
        {"name": "Gutta-percha", "purpose": "Submarine insulation historically", "earthLocations": ["Southeast Asia latex historically"], "spaceAlternatives": "PE jackets modern", "processingRequired": "Extrusion"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Survey right-of-way", "description": "Negotiate poles with landowners; map river crossings.", "prerequisiteTools": ["transits"], "warningNote": "Induced liability from fallen wires — tension engineering"},
        {"order": 2, "title": "String and sag", "description": "Match mechanical tension to wind and ice load; bond grounds.", "prerequisiteTools": ["dynamometers"], "warningNote": "Ground potential differences shock animals tied to wet earth returns"},
        {"order": 3, "title": "Install protection", "description": "Lightning horns; fuses; office grounding mats.", "prerequisiteTools": ["megger"], "warningNote": "Nearby lightning magnetises sounders — false clicks"},
        {"order": 4, "title": "Train operators", "description": "Copy qualification tests; procedural language for train orders.", "prerequisiteTools": ["practice sets"], "warningNote": "Ambiguous prosigns cause collisions"},
        {"order": 5, "title": "Maintain repeaters", "description": "Log battery voltages; clean relay contacts; document drift.", "prerequisiteTools": ["contact burnishers"], "warningNote": "Pitting raises minimum operating current"},
    ],
    "history": [
        {"year": 1837, "event": "Patent demonstrations of practical electromagnetic telegraphs in UK and USA.", "location": "UK/USA", "person": "William Fothergill Cooke, Charles Wheatstone, Samuel Morse"},
        {"year": 1866, "event": "Successful transatlantic telegraph cable after earlier failures.", "location": "Atlantic Ocean"},
    ],
    "inventors": [
        {"name": "Samuel Morse", "contribution": "Practical telegraph instrument and Morse code co-development", "years": "1791-1872", "nationality": "American"},
    ],
    "impact": "Telegraphy coordinated empires and markets in real time — shrinking strategic surprise while raising the tempo of war and finance.\n\nIt is the ancestor of every packet — meaning encoded as physical state on a wire.",
    "images": [],
    "videos": [{"id": "morse-code", "title": "Morse code and telegraphy", "description": "Amateur radio society training materials.", "durationSeconds": 480}],
    "externalLinks": [
        {"id": "itu-history", "title": "ITU — history of telecommunications", "url": "https://www.itu.int/en/history/Pages/default.aspx"},
        {"id": "smithsonian-telegraph", "title": "Smithsonian — telegraph collections", "url": "https://americanhistory.si.edu/collections/object-groups/telegraph"},
    ],
})

W({
    "id": "telephone-exchange-system",
    "name": "Telephone Exchange System",
    "tagline": "Switched analogue speech networks — circuit establishment, ringing, billing, and human-scale switching fabrics",
    "category": "communication",
    "era": "industrial",
    "difficulty": 4,
    "prerequisites": ["electrical-telegraph", "copper-wire-and-cable", "electrical-power-grid"],
    "unlocks": [],
    "problem": "Telegraphy sends bursts; telephony sends continuous waveforms that must arrive recognisably at the other ear. The exchange problem is switching: connecting any subscriber to any other without dedicated pairwise wires between every home — a full mesh is N² madness.\n\nEarly manual boards used cord circuits and ringing generators; Strowger and crossbar switches automated selection; digital switches later sample audio into time slots. Transmission needed loading coils and repeaters to preserve voice band across miles.\n\nPower for carbon microphones and signalling rode the same copper in creative phantom configurations — a reminder that telephony is power electronics wearing a conversation.",
    "overview": "A subscriber goes off-hook; DC current flows; exchange detects seizure. Dial pulses or DTMF tones convey destination digits; switches hunt an idle path through trunks; supervisory tones communicate progress — ringback, busy, reorder. Billing gear counts pulses or samples call detail records.\n\nTransmission plant uses twisted pairs to reject common-mode noise; carrier systems multiplex many voice channels on coax or microwave before fibre. Echo cancellers fight delay in satellite links.\n\nModern PSTN interworks with cellular and VoIP via gateways — SS7 signalling historically, SIP later — but the human expectation of dialling a number and hearing a ring tone is a century-old interface contract.\n\nStorm resilience, central office battery backup, and craft dispatch are operational technologies as important as schematics.",
    "principles": [
        {"name": "Twisted pair balance", "explanation": "Equal and opposite currents cancel radiated pickup — why untwisted house wire hums on audio."},
        {"name": "4 kHz channel spacing", "explanation": "Legacy FDM stacks 300–3400 Hz voice channels — defines digital sampling at 8 kHz after Nyquist guard."},
        {"name": "Blocking probability", "explanation": "Erlang models size trunk groups — insufficient trunks yield post-dial busy flashes."},
        {"name": "Signalling separation", "explanation": "Out-of-band SS7 decouples call setup from voice path — enables mobility and fraud if not authenticated."},
    ],
    "components": [
        {"id": "switch", "name": "Switching fabric", "function": "Connects lines to trunks", "position": "Central office", "madeFrom": "Electromechanical selectors or digital TDM buses"},
        {"id": "line-card", "name": "Line circuit card", "function": "Battery feed, overvoltage protection, ringing relay", "position": "Main distribution frame", "madeFrom": "SLIC chips modern; relays historically"},
        {"id": "trunk", "name": "Trunk multiplex equipment", "function": "Aggregates channels", "position": "Tandem offices", "madeFrom": "PDH/SDH muxes historically"},
        {"id": "mdf", "name": "Main distribution frame", "function": "Cross-connect field copper to equipment", "position": "CO vault", "madeFrom": "Punchdown blocks, lightning protectors"},
        {"id": "power", "name": "Office -48 V plant", "function": "Feeds subscriber loops during outages", "position": "Battery room", "madeFrom": "Lead-acid strings, rectifiers"},
    ],
    "rawMaterials": [
        {"name": "PE-insulated copper pairs", "purpose": "Outside plant cable", "earthLocations": ["Cable factories globally"], "spaceAlternatives": "Fibre backhaul later", "processingRequired": "Colour code pairs; fill gel against moisture"},
        {"name": "Central office steel", "purpose": "Racks and frames", "earthLocations": ["Rolling mills"], "spaceAlternatives": "Aluminium frames", "processingRequired": "Bonding and grounding"},
        {"name": "Rare metals in relays", "purpose": "Wiping contacts", "earthLocations": ["Silver cadmium oxide contacts"], "spaceAlternatives": "Solid-state relays", "processingRequired": "Reflow assembly"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Engineer outside plant", "description": "Gauge pairs for loop length; place loading coils; calculate lightning exposure.", "prerequisiteTools": ["cable gauges", "TDR"], "warningNote": "Pair swaps mislabel MDNs — database reconciliation"},
        {"order": 2, "title": "Install MDF and protectors", "description": "Grounding per telcordia/IEC; fuse coordination.", "prerequisiteTools": ["megger"], "warningNote": "Ground loops cause hum — single-point earth"},
        {"order": 3, "title": "Commission switch translations", "description": "Digit maps; routing tables; toll fraud filters.", "prerequisiteTools": ["test calls"], "warningNote": "Misrouted international prefixes bankrupt small carriers"},
        {"order": 4, "title": "Load-test trunk groups", "description": "Generate Erlang traffic; measure blocking; tune alternate routes.", "prerequisiteTools": ["traffic simulators"], "warningNote": "Mother’s Day spikes need seasonal margins"},
        {"order": 5, "title": "Document craft procedures", "description": "Night shift playbooks for card swaps; E911 database updates.", "prerequisiteTools": ["ticketing system"], "warningNote": "Stale 911 address data kills people"},
    ],
    "history": [
        {"year": 1876, "event": "Bell patents telephone; first exchanges follow within years.", "location": "USA", "person": "Alexander Graham Bell"},
        {"year": 1892, "event": "Automatic Strowger switch reduces operator labour for small cities.", "location": "USA", "person": "Almon Brown Strowger"},
    ],
    "inventors": [
        {"name": "Alexander Graham Bell", "contribution": "Patent for harmonic telegraph leading to telephone", "years": "1847-1922", "nationality": "Scottish-Canadian-American"},
    ],
    "impact": "Telephony put voices in real time across cities — reshaping business, intimacy, and emergency response. Exchanges were the first large-scale connection-oriented networks computers later mimicked.\n\nRecovery must preserve craft knowledge of copper plant, not only VoIP overlays.",
    "images": [],
    "videos": [{"id": "pstn-arch", "title": "PSTN architecture overview", "description": "Telecommunications engineering lectures on CO functions.", "durationSeconds": 900}],
    "externalLinks": [
        {"id": "itu-t", "title": "ITU-T — telecommunication standardization", "url": "https://www.itu.int/en/ITU-T/about/"},
        {"id": "fcc-voip", "title": "FCC — voice services context (USA)", "url": "https://www.fcc.gov/consumers/guides/voice-over-internet-protocol-voip"},
    ],
})

W({
    "id": "radio-broadcast-and-receiver",
    "name": "Radio Broadcast and Receiver",
    "tagline": "Modulated electromagnetic waves carrying voice and music — spectrum, antennas, and detectors at civilisation scale",
    "category": "communication",
    "era": "early-20th",
    "difficulty": 4,
    "prerequisites": ["vacuum-tube-electronics", "electrical-telegraph", "electrical-power-grid"],
    "unlocks": ["communication-satellites"],
    "problem": "Wires cannot follow ships at sea or cars at speed without ruinous cost. Radio encodes information on sinusoidal carriers — amplitude or frequency modulation early, single-sideband for spectrum efficiency later. The obstacle is physics: antennas must be significant fractions of wavelength; receivers must select one station among megahertz of chaos; transmitters must not deafen neighbours with harmonics.\n\nRegulatory technology matters as much as hardware: ITU allocations, licensing exams, and enforcement against spark-gap villains who jam distress frequencies.\n\nBroadcasting created simultaneous audiences — politics, music, and emergency alerts share one-to-many topology unlike telephony’s mesh.",
    "overview": "A transmitter chain oscillates carrier, modulates with audio or digital symbols, amplifies through tuned stages, and feeds an antenna with correct impedance match. Receivers superheterodyne to a fixed IF for stable filtering; AGC rides fading; detectors recover baseband. FM trades bandwidth for noise immunity on VHF.\n\nStudio-to-transmitter links moved from leased lines to microwave STL; RDS embeds metadata on FM subcarriers. Digital modes (DRM, HD Radio, DAB) squeeze more bits per hertz with error correction — coexistence with analogue legacy is a regulatory negotiation.\n\nAntenna farms pattern energy toward population centres; skywave HF reaches continents at night with ionospheric refraction — delightful until solar storms erase paths.\n\nEmergency systems (EPIRB, weather radio) embed radio into survival kits — collapse-relevant even after cellular primacy.",
    "principles": [
        {"name": "Antenna reciprocity", "explanation": "Transmit and receive patterns match for passive antennas — design once, use both ways."},
        {"name": "Superheterodyne image rejection", "explanation": "Mixing creates sum and difference frequencies — front-end filtering must kill the image band."},
        {"name": "Capture effect in FM", "explanation": "Stronger station captures demodulator — blessing and curse in overlapping markets."},
        {"name": "Shannon-Hartley limit", "explanation": "Channel capacity grows with bandwidth and SNR — guides digital rollouts."},
    ],
    "components": [
        {"id": "oscillator", "name": "Master oscillator and PLL", "function": "Sets carrier frequency stability", "position": "Exciter", "madeFrom": "Crystal reference, varactor tuning"},
        {"id": "pa", "name": "Power amplifier", "function": "Boosts signal to legal ERP", "position": "Transmitter chain", "madeFrom": "Tube or solid-state pallets with combiners"},
        {"id": "antenna", "name": "Antenna and transmission line", "function": "Radiates with desired pattern", "position": "Tower", "madeFrom": "Aluminium yagi or panel arrays"},
        {"id": "receiver-front", "name": "Receiver RF front end", "function": "Selects and amplifies weak signals", "position": "Handset or car radio", "madeFrom": "SAW filters, LNA, mixer"},
        {"id": "detector", "name": "Detector and audio chain", "function": "Recovers audio or I/Q baseband", "position": "IF strip", "madeFrom": "Diode envelope, quadrature demod"},
    ],
    "rawMaterials": [
        {"name": "Aluminium tower sections", "purpose": "Elevated radiators", "earthLocations": ["Extrusion mills"], "spaceAlternatives": "Deployable antennas", "processingRequired": "Galvanising or anodising"},
        {"name": "Coaxial cable", "purpose": "Low-loss feedlines at UHF", "earthLocations": ["Cable plants"], "spaceAlternatives": "Waveguide at microwave", "processingRequired": "Foam dielectric extrusion"},
        {"name": "Ferrite cores", "purpose": "IF transformers", "earthLocations": ["Mn-Zn ferrite factories"], "spaceAlternatives": "Air-core at VHF", "processingRequired": "Sintering and gapping"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Frequency coordination", "description": "Apply for allocation; measure existing noise floor; avoid radar bands.", "prerequisiteTools": ["spectrum analyser"], "warningNote": "Illegal harmonics into aviation band is criminal"},
        {"order": 2, "title": "Install antenna and grounding", "description": "Lightning protection; tower climbing safety; VSWR trim.", "prerequisiteTools": ["vector network analyser"], "warningNote": "High RF burns without contact — respect ERP"},
        {"order": 3, "title": "Align transmitter chain", "description": "Bias PA; neutralise if tube; intermodulation test two-tone.", "prerequisiteTools": ["two-tone generator"], "warningNote": "Splatter triggers neighbour complaints"},
        {"order": 4, "title": "Certify spurious emissions", "description": "Mask compliance to FCC/ETSI masks; notch harmonics.", "prerequisiteTools": ["EMI receiver"], "warningNote": "Failed certification cannot legally air"},
        {"order": 5, "title": "Receiver field tests", "description": "Drive tests for multipath; audio loudness standards; RDS verification.", "prerequisiteTools": ["mobile logging"], "warningNote": "Tunnel dead zones need translators"},
    ],
    "history": [
        {"year": 1895, "event": "Marconi experiments with wireless telegraphy; transatlantic spark follows.", "location": "Italy/UK", "person": "Guglielmo Marconi"},
        {"year": 1920, "event": "Scheduled audio broadcasting begins in multiple countries.", "location": "USA, Europe"},
    ],
    "inventors": [
        {"name": "Guglielmo Marconi", "contribution": "Practical wireless telegraphy and early radio systems", "years": "1874-1937", "nationality": "Italian"},
    ],
    "impact": "Radio created national simultaneity — coronations, wars, and jazz in every kitchen. It also taught spectrum as finite commons — a tragedy-of-the-commons problem solved imperfectly by law.",
    "images": [],
    "videos": [{"id": "superhet", "title": "Superheterodyne receiver", "description": "Ham radio licence training on mixing and IF.", "durationSeconds": 720}],
    "externalLinks": [
        {"id": "itu-r", "title": "ITU-R — radiocommunication sector", "url": "https://www.itu.int/en/ITU-R/Pages/default.aspx"},
        {"id": "arrl", "title": "ARRL — amateur radio handbook context", "url": "https://www.arrl.org/"},
    ],
})

W({
    "id": "communication-satellites",
    "name": "Communication Satellites",
    "tagline": "Microwave repeaters in orbit — global footprints, transponders, and the geometry of delay",
    "category": "communication",
    "era": "mid-20th",
    "difficulty": 5,
    "prerequisites": ["radio-broadcast-and-receiver", "transistor", "fixed-wing-aircraft"],
    "unlocks": ["optical-fiber-communications"],
    "problem": "HF skywave is moody; submarine cables are expensive to lay across all oceans. Satellites sit line-of-sight to enormous ground swaths — one transponder hop replaces chains of microwave towers. The catch is rocketry, radiation, and orbital mechanics: launch costs, station-keeping fuel, and handoffs between beams as Earth rotates.\n\nGeostationary orbit simplifies antennas but injects quarter-second echo on voice — TCP misreads as congestion unless engineered. Low Earth orbit constellations trade latency for handover complexity.\n\nSpace environment kills electronics: total ionising dose, single-event upsets, and atomic oxygen in LEO — satellite engineering is rad-hard packaging plus redundancy.",
    "overview": "A bus provides power from solar arrays and batteries, thermal control via heat pipes and radiators, attitude control with reaction wheels and thrusters, and command telemetry via S-band links. Payload is C/Ku/Ka-band transponders: LNA, channelised filters, TWTA or SSPA amplifiers, output multiplexers. Ground segment uses large parabolic dishes with tracking servos and low-noise cryogenic amplifiers for deep space budgets.\n\nFrequency plans avoid intermodulation; polarisation reuse doubles capacity. Digital carriers pack many carriers per transponder with MCPC; beam shaping limits interference footprints.\n\nEnd-of-life graveyard orbits mitigate debris; regulatory filings at ITU coordinate slot assignments — orbital slots became property-like.\n\nSatellite phones and GPS ride related technologies — navigation is communication with math differentials.",
    "principles": [
        {"name": "Link budget", "explanation": "C/N0 integrates EIRP, path loss, G/T, and losses — closes whether a modem can lock."},
        {"name": "Shannon limit on transponder", "explanation": "Operating back-off from saturation trades linearity for capacity — multicarrier needs linear amps."},
        {"name": "Doppler in LEO", "explanation": "Fast satellites shift carrier — receivers track with PLL bandwidth."},
        {"name": "Radiation hardness", "explanation": "Shielding, RHBD logic, and EDAC mitigate SEUs — watchdogs reboot gracefully."},
    ],
    "components": [
        {"id": "bus", "name": "Satellite bus", "function": "Power, thermal, ADCS, propulsion", "position": "Structure", "madeFrom": "Al honeycomb, carbon composite"},
        {"id": "payload", "name": "Payload transponder", "function": "Amplifies and translates frequency", "position": "Deck", "madeFrom": "TWTA chains or SSPAs"},
        {"id": "antenna", "name": "Payload antennas", "function": "Shapes coverage", "position": "Earth-facing deck", "madeFrom": "Feed horns, reflectors, phased arrays"},
        {"id": "ground", "name": "Earth station", "function": "Large aperture and tracking", "position": "Teleports", "madeFrom": "Parabolic reflector, radome"},
        {"id": "ttc", "name": "Telemetry, tracking, command", "function": "Housekeeping comms", "position": "Omni antennas", "madeFrom": "S-band transceivers"},
    ],
    "rawMaterials": [
        {"name": "GaAs and GaN MMICs", "purpose": "Payload amplification", "earthLocations": ["Compound semiconductor fabs"], "spaceAlternatives": "Import dies; rad screen", "processingRequired": "Burn-in, hermetic packaging"},
        {"name": "Xenon or hydrazine", "purpose": "Electric or chemical propulsion", "earthLocations": ["Chemical suppliers"], "spaceAlternatives": "Water electrolysis propellant concepts", "processingRequired": "High-pressure loading"},
        {"name": "Solar cells", "purpose": "Primary power", "earthLocations": ["III-V multi-junction fabs"], "spaceAlternatives": "Deployable arrays", "processingRequired": "Coverglass radiation shield"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Define service area and ITU filing", "description": "Coordination with neighbouring satellites; PFD masks.", "prerequisiteTools": ["link budget spreadsheets"], "warningNote": "Violations cause intentional jamming diplomatic incidents"},
        {"order": 2, "title": "Qualify parts to radiation", "description": "TID testing; SEE cross-section; latch-up screening.", "prerequisiteTools": ["cyclotron access"], "warningNote": "Commercial COTS without test dies in weeks"},
        {"order": 3, "title": "Integrate and vibration test", "description": "Random vibration on shaker; sine burst; modal survey.", "prerequisiteTools": ["vibration lab"], "warningNote": "Undetected solder cracks wake in orbit"},
        {"order": 4, "title": "Thermal vacuum cycling", "description": "Bakeout; eclipse simulation; deployables release.", "prerequisiteTools": ["TVAC chamber"], "warningNote": "Outgassing contaminates optics"},
        {"order": 5, "title": "Launch and LEOP", "description": "Acquire signal; deploy solar arrays; raise orbit; drift to slot.", "prerequisiteTools": ["ground network"], "warningNote": "Single-command error can fuel vent — redundancy"},
    ],
    "history": [
        {"year": 1960, "event": "Echo 1 passive reflector; Telstar active relay follows.", "location": "USA/Europe"},
        {"year": 1965, "event": "Intelsat I Early Bird commercial geostationary service.", "location": "Atlantic", "person": "Harold Rosen (concept lineage)"},
    ],
    "inventors": [
        {"name": "Arthur C. Clarke", "contribution": "Geostationary relay concept article 1945", "years": "1917-2008", "nationality": "British"},
    ],
    "impact": "Satellites made live global television and intercontinental telephony routine — and turned orbital slots into strategic assets.\n\nCollapse without launch cadence still benefits from understanding link budgets for terrestrial relays.",
    "images": [],
    "videos": [{"id": "link-budget", "title": "Satellite link budgets", "description": "Accredited satellite communications courses.", "durationSeconds": 1200}],
    "externalLinks": [
        {"id": "itu-sat", "title": "ITU — satellite filings", "url": "https://www.itu.int/en/ITU-R/space/Pages/default.aspx"},
        {"id": "nasa-deep-space", "title": "NASA — Deep Space Network", "url": "https://www.nasa.gov/directorates/heo/scan/services/networks/deep_space_network/about"},
    ],
})

W({
    "id": "optical-fiber-communications",
    "name": "Optical Fiber Communications",
    "tagline": "Dielectric waveguides carrying terabits on photons — low loss, high bandwidth, immunity to copper theft",
    "category": "communication",
    "era": "late-20th",
    "difficulty": 5,
    "prerequisites": ["communication-satellites", "transistor", "glass-making"],
    "unlocks": ["internet-protocols-and-web"],
    "problem": "Copper pairs attenuate and pick up EMI; coax thickens with distance. Glass fibres guide infrared light in total internal reflection with losses below 0.2 dB/km — enabling transoceanic routes without repeaters every kilometre. The problem is purity: ppm metal ions quench transparency; splices must align cores sub-micron; lasers must modulate GHz without chirp smearing pulses.\n\nDWDM stacks dozens of lambdas on one fibre — turning spectrum economics into optical physics. Dispersion and nonlinearities limit reach; Raman amplification and coherent detection push thousands of kilometres.\n\nFibre is fragile — macrobends and dirty connectors dominate field faults more than cable theft.",
    "overview": "Preforms are deposited with MCVD or OVD; drawn into fibre; coated with UV acrylate; cabled with strength members and gel. Lasers (DFB, tunable) launch into single-mode fibre at 1310/1550 nm windows. EDFA amplifiers boost WDM combes en route. Receivers use PIN or APD photodiodes then TIAs and DSPs in coherent systems.\n\nPON access splits one feeder to hundreds of homes with passive splitters — GPON/XGS-PON standards govern bursts upstream.\n\nSplicing uses fusion arcs; OTDR reflects locate breaks; cleaning sticks fix most ‘mysterious’ outages.\n\nDark fibre leases became financial instruments — idle strands as options on future bandwidth.",
    "principles": [
        {"name": "V-number and modes", "explanation": "Single-mode cutoff ensures one spatial mode — avoids modal dispersion."},
        {"name": "Material and waveguide dispersion", "explanation": "Chromatic dispersion broadens pulses; dispersion-shifted fibre trades against nonlinear penalties."},
        {"name": "WDM crosstalk", "explanation": "Imperfect filters leak neighbours; guard bands cost capacity."},
        {"name": "Shot noise limit", "explanation": "Photons arrive Poisson — sensitivity floors for given BER."},
    ],
    "components": [
        {"id": "laser", "name": "Laser transmitter", "function": "Intensity or phase modulates carrier", "position": "Transponder", "madeFrom": "InP DFB laser, driver IC"},
        {"id": "fiber", "name": "Single-mode fibre span", "function": "Low-loss medium", "position": "Duct or submarine", "madeFrom": "Fused silica core, cladding"},
        {"id": "edfa", "name": "Erbium-doped fibre amplifier", "function": "Optical gain inline", "position": "Repeater hut", "madeFrom": "EDF, pump lasers at 980/1480 nm"},
        {"id": "mux", "name": "WDM multiplexer", "function": "Combines lambdas", "position": "Terminal", "madeFrom": "AWG or thin-film filters"},
        {"id": "coherent-dsp", "name": "Coherent receiver DSP", "function": "Equalises CD and PMD digitally", "position": "Line card", "madeFrom": "ASIC FEC and carrier recovery"},
    ],
    "rawMaterials": [
        {"name": "Silicon tetrachloride", "purpose": "MCVD glass precursor", "earthLocations": ["Chlor-alkali industry"], "spaceAlternatives": "Import preforms", "processingRequired": "Ultra-dry delivery lines"},
        {"name": "Germanium dopant", "purpose": "Core index raising", "earthLocations": ["ZnO smelter byproduct streams"], "spaceAlternatives": "Alternative dopants", "processingRequired": "Controlled partial pressure in preform"},
        {"name": "Indium phosphide wafers", "purpose": "Laser chips", "earthLocations": ["III-V fabs"], "spaceAlternatives": "Silicon photonics hybrid", "processingRequired": "Facet coating anti-reflection"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Design span budget", "description": "Choose launch power, amplifier spacing, and FEC overhead; verify nonlinear SNI limit.", "prerequisiteTools": ["simulation tools"], "warningNote": "Too high launch worsens FWM"},
        {"order": 2, "title": "Install cable with bend radius", "description": "Mandrel tests; tensile during pull; splice trailers climate controlled.", "prerequisiteTools": ["OTDR"], "warningNote": "Tight bends add permanent attenuation"},
        {"order": 3, "title": "Fusion splice and proof test", "description": "Core alignment; tensile proof; heat-shrink protectors.", "prerequisiteTools": ["fusion splicer"], "warningNote": "Dirty fibres arc and pit"},
        {"order": 4, "title": "Characterise PMD and CD", "description": "Field measurements for coherent provisioning; update DSP presets.", "prerequisiteTools": ["PMD analyser"], "warningNote": "Old fibre plant surprises new gear"},
        {"order": 5, "title": "Turn-up with loopbacks", "description": "BER tests; optical spectrum snapshots; alarm integration to NOC.", "prerequisiteTools": ["BER tester"], "warningNote": "Wrong wavelength channel wipes wrong customer"},
    ],
    "history": [
        {"year": 1970, "event": "Low-loss fused silica fibre breakthrough at Corning.", "location": "USA", "person": "Robert Maurer, Donald Keck, Peter Schultz"},
        {"year": 1988, "event": "TAT-8 first transatlantic submarine fibre cable.", "location": "Atlantic"},
    ],
    "inventors": [
        {"name": "Charles K. Kao", "contribution": "Pioneering work on fibre communications feasibility", "years": "1933-2018", "nationality": "British-American"},
    ],
    "impact": "Fibre carries the bulk backbone of the internet — satellites and radio are edges; glass is the spine.\n\nUnderstanding OTDR is understanding archaeology for light.",
    "images": [],
    "videos": [{"id": "fiber-drawing", "title": "Fibre drawing tower", "description": "Factory tours of preform to fibre.", "durationSeconds": 600}],
    "externalLinks": [
        {"id": "itu-t-fiber", "title": "ITU-T — optical transport standards", "url": "https://www.itu.int/en/ITU-T/about/"},
        {"id": "ofc", "title": "OFC — optical fibre communication conference", "url": "https://www.ofcconference.org/"},
    ],
})

W({
    "id": "internet-protocols-and-web",
    "name": "Internet Protocols and the World Wide Web",
    "tagline": "TCP/IP internetworking plus HTTP, HTML, TLS, and DNS — packets, names, and documents on one stack",
    "category": "communication",
    "era": "21st-century",
    "difficulty": 5,
    "prerequisites": ["transistor", "telephone-exchange-system", "radio-broadcast-and-receiver", "optical-fiber-communications"],
    "unlocks": [],
    "problem": "Circuit-switched telephony ties bandwidth whether you speak or not; bursty data needs statistical multiplexing. Packet networks slice information into self-describing datagrams routed independently; TCP adds reliability and congestion control at the ends while IP provides best-effort delivery — the substrate on which everything else sits.\n\nAbove transport, humans need documents and services addressed by names, fetched with caching, and protected against tampering on untrusted paths. The web stacks HTTP semantics on TLS on DNS on BGP-routed IP — each layer a failure mode: certificate authorities, cache poisoning, mixed content, and tracking economies.\n\nScaling required hierarchical addressing, CIDR aggregation, CDNs, anycast, and eventual consistency databases — latency engineering disguised as sociology (where you place caches shapes who loads faster).\n\nThe political problem equals the technical: centralised platforms, censorship, and misinformation ride the same protocols that host scientific collaboration and disaster coordination.",
    "overview": "Hosts encapsulate TCP or UDP segments into IP packets; routers longest-prefix match tables updated by IGPs internally and BGP between autonomous systems. Ethernet MAC frames carry IP on LANs; MPLS labels speed carrier cores; VPNs tunnel across untrusted paths. TCP’s AIMD congestion control reacts to loss; QUIC merges encryption with UDP-based transport for the web.\n\nBrowsers resolve names via DNS (often over HTTPS), open TCP or QUIC connections, negotiate TLS certificates, then request resources with HTTP verbs. HTML structures documents; CSS styles; JavaScript executes client-side logic. MIME types teach parsers how to interpret bytes. REST and GraphQL pattern APIs beyond pages.\n\nSearch engines crawl links; robots.txt expresses politeness; sitemaps assist discovery. Email and calendaring are parallel application stacks — SMTP, IMAP, CalDAV — showing the internet is families of protocols, not only the web.\n\nAccessibility (ARIA), internationalisation (Unicode), and performance budgets (Core Web Vitals) encode engineering ethics as metrics. Archiving fights link rot — the web forgets by default.",
    "principles": [
        {"name": "End-to-end argument", "explanation": "Smart edges, dumb network — reliability and semantics belong where application knowledge lives unless performance forces middlebox exceptions."},
        {"name": "Longest-prefix routing", "explanation": "Aggregating routes shrinks tables but can blackhole if summaries are wrong — operations risk as much as code risk."},
        {"name": "Layered security", "explanation": "TLS authenticates and encrypts transport; CSP restricts content sources; each layer assumes the below may be malicious."},
        {"name": "Same-origin policy", "explanation": "Isolates scripts unless explicitly relaxed — cornerstone of browser security against cross-site data theft."},
    ],
    "components": [
        {"id": "router", "name": "Internet router", "function": "Forwards IP packets using longest-prefix match and queueing", "position": "POP and backbone", "madeFrom": "TCAM ASICs, buffer memory, optics"},
        {"id": "browser", "name": "Web browser engine", "function": "Parses, renders, executes", "position": "Client", "madeFrom": "HTML/CSS/JS engines, sandbox"},
        {"id": "server", "name": "Origin server", "function": "Authoritative content", "position": "Data centre", "madeFrom": "HTTP daemons, app runtimes"},
        {"id": "cdn", "name": "CDN edge PoPs", "function": "Caches static assets near users", "position": "Global cities", "madeFrom": "Reverse proxies, SSD tiers"},
        {"id": "ca", "name": "Certificate authority ecosystem", "function": "Issues trust anchors", "position": "Global", "madeFrom": "HSM-backed signing infrastructure"},
        {"id": "resolver", "name": "Public DNS resolver", "function": "Resolves names with caching and filtering options", "position": "Anycast network", "madeFrom": "Unbound/BIND clusters"},
    ],
    "rawMaterials": [
        {"name": "TCAM and NPU silicon", "purpose": "Router forwarding at line rate", "earthLocations": ["Network silicon vendors"], "spaceAlternatives": "Software routers for low speeds", "processingRequired": "Thermal design for datacentre racks"},
        {"name": "Server CPUs and DRAM", "purpose": "Web and DNS serving", "earthLocations": ["Foundry fabs"], "spaceAlternatives": "ARM cloud instances", "processingRequired": "ECC RAM for silent error mitigation"},
        {"name": "SSD NAND", "purpose": "Durable storage for sites", "earthLocations": ["Flash fabs"], "spaceAlternatives": "Tape archives cold tier", "processingRequired": "Wear levelling firmware"},
    ],
    "buildSteps": [
        {"order": 1, "title": "Address plan and BGP policy", "description": "Allocate aggregates; document RIR justification; peer with prefix filters and RPKI ROV.", "prerequisiteTools": ["IPAM", "IRR tools"], "warningNote": "Fat-finger exports leak internal routes"},
        {"order": 2, "title": "Operate IGP and monitoring", "description": "OSPF/IS-IS areas; BFD; sFlow to telemetry stack.", "prerequisiteTools": ["NOC dashboards"], "warningNote": "Area0 partitions blackhole regions"},
        {"order": 3, "title": "Threat model the web service", "description": "STRIDE analysis; TLS and key management; CSP headers.", "prerequisiteTools": ["security review template"], "warningNote": "Mixed content silently downgrades security"},
        {"order": 4, "title": "Performance and accessibility budget", "description": "Lighthouse for LCP/CLS/INP; axe for WCAG contrast and keyboard paths.", "prerequisiteTools": ["CI checks"], "warningNote": "Third-party scripts veto your budget"},
        {"order": 5, "title": "Archive and license content", "description": "Creative Commons where possible; sitemaps; permalinks to Internet Archive.", "prerequisiteTools": ["crawler tooling"], "warningNote": "Robots.txt cannot revoke legal obligations"},
    ],
    "history": [
        {"year": 1974, "event": "Cerf and Kahn publish foundational internetworking ideas leading to TCP/IP.", "location": "USA", "person": "Vint Cerf, Bob Kahn"},
        {"year": 1983, "event": "ARPANET flag day transitions hosts to TCP/IP.", "location": "USA"},
        {"year": 1989, "event": "Tim Berners-Lee proposes the World Wide Web at CERN.", "location": "Switzerland", "person": "Tim Berners-Lee"},
        {"year": 1993, "event": "Mosaic browser popularises the graphical web.", "location": "USA"},
    ],
    "inventors": [
        {"name": "Vint Cerf", "contribution": "Co-design of TCP/IP protocols", "years": "1943-", "nationality": "American"},
        {"name": "Bob Kahn", "contribution": "Co-design of TCP/IP protocols", "years": "1938-", "nationality": "American"},
        {"name": "Tim Berners-Lee", "contribution": "World Wide Web (HTTP, HTML, URI concepts)", "years": "1955-", "nationality": "British"},
    ],
    "impact": "The web made the internet legible to billions — and concentrated attention economics into a few dashboards. It is simultaneously library, marketplace, and battleground.\n\nPreserving it requires archiving, open standards, and constant security patching — eternal maintenance, not a finished monument.",
    "images": [],
    "videos": [{"id": "how-web-works", "title": "How the web works", "description": "Accredited web development courses on DNS-TLS-HTTP stack.", "durationSeconds": 720}],
    "externalLinks": [
        {"id": "w3c", "title": "W3C — web standards", "url": "https://www.w3.org/"},
        {"id": "mozilla-mdn", "title": "MDN Web Docs", "url": "https://developer.mozilla.org/"},
    ],
})

print("batch2 script complete")


