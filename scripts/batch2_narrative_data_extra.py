# Remaining batch-2 narrative patches (merged by apply_batch2_narrative_rewrites.py)
from batch2_narrative_data import STEP

NARRATIVE = {
    "high-voltage-ac-transmission": {
        "problem": (
            "A distribution network built for a town cannot push the same power across a continent without turning conductors into toasters. Loss grows with the square of current, so the naive fix — thicker copper — becomes its own logistics problem: every extra tonne of metal needs towers strong enough to hold it and rights-of-way wide enough to keep it from the ground.\n\n"
            "Raising voltage lowers current for the same real power, which shrinks both loss and the cross-section you must hang in the sky. That shift buys a new class of headaches: the air itself begins to glow around conductors if the electric field at the surface is too high; lightning and switching surges hunt for the weakest insulator; fog and salt spray turn porcelain into a leakage path.\n\n"
            "Long lines are not passive ropes. They store electric and magnetic energy in their length, which shows up as charging current, voltage rise at light load, and sometimes slow oscillations between distant regions. Engineers add reactors, capacitors, and controlled devices as deliberately as steam engineers add valves — not as ornaments but as stability tools.\n\n"
            "Without extra-high-voltage corridors, civilisation must sit generation beside load again — good for resilience in one sense, bad for using distant hydro, wind, or nuclear basins. The political shape of energy follows the physics of insulation."
        ),
        "overview": (
            "At a corridor scale, generation voltage is stepped up to hundreds of kilovolts, then carried on bundled conductors that split the electric field across several subwires so corona hisses less. Shield wires ride above phase conductors to intercept lightning; grounding systems give fault currents a controlled path into earth. Substations are fenced cities of steel full of breakers, instrument transformers, and banks of reactive equipment.\n\n"
            "Protection is staged like nested fences: relays try to trip only the smallest segment that contains a fault so the rest of the grid keeps serving hospitals and pumps. Operators rehearse N-1 contingencies — losing any single element without losing stability — because weather and backhoes rarely announce appointments.\n\n"
            "Environmental engineering matters: corona can sing loudly enough to annoy neighbours; right-of-way clearing changes fire ecology; bird flight diverters reduce collisions. Underground extra-high-voltage appears in dense cities where aesthetics and lightning immunity outweigh cost and heat.\n\n"
            "Standards bodies harmonise insulation levels and testing so a breaker from one factory closes against a disconnect from another without a negotiation in the arc gap. That interoperability is easy to forget because it works — until a supplier skips a test and a line trips on mist alone."
        ),
        "buildSteps": [
            STEP(1, "Pick a route humans and wildlife can live beside for decades", "Walk or fly the corridor before ordering steel. Note crossings of roads, rivers, forests, and houses. Mark where towers must turn, where ice loads worst, and where access roads can reach without carving unstable slopes. Document who owns or governs each segment — a perfect electrical route that ignores land tenure is a lawsuit with foundations.", ["maps", "notebook", "camera"], "Underestimated icing or wind load collapses spans and kills crews"),
            STEP(2, "Pour foundations and stand towers plumb", "Follow geotechnical borings: some soils need micropiles, rock needs anchors. Torque structural bolts to the spec — partial tightening warps lattices. Keep lifting plans conservative; a swinging conductor near an energised line can induce lethal voltages in supposedly dead spans.", ["crane", "theodolite", "torque wrench"], "Work near live lines only under written permits and trained supervision"),
            STEP(3, "String insulators and set sag with seasons in mind", "Choose suspension versus tension sets per span physics. Measure sag at the hottest temperature you design for, not only at the pleasant day of construction. Verify ground clearance for vehicles, floods, and crop sprayers.", ["dynamometer", "temperature log"], "Over-tension cracks porcelain; under-tension touches ground"),
            STEP(4, "Commission protection before energising at full voltage", "Test fibre differential or distance schemes end-to-end; verify GPS time sync if your relays use it. Stage through reduced voltage if your procedure allows, watching corona with UV cameras at night. File setting sheets where operators can find them during storms.", ["relay test set", "labels"], "Wrong CT polarity trips the healthy side and leaves the fault burning"),
            STEP(5, "Energise, then monitor thermals and noise for a commissioning window", "Infrared-scan joints after load appears; listen for corona change after rain. Record baseline vibration on sensitive spans. Teach maintenance crews which spans are never to be climbed live and why.", ["thermal camera", "sound level meter"], "Corona ozone and nitric acid can become environmental permit issues near towns"),
        ],
        "rawMaterials": {
            0: "Ship ACSR or ACCC conductor from terrestrial mills; early off-world longlines may use aluminium bus in vacuum with wider phase spacing until stranding plants exist; copper where mass matters less than simplicity",
            1: "Hot-dip galvanised structural steel from zinc-rich ore chains; stainless hardware in salt spray without full stainless towers",
            2: "Composite polymer insulators for weight savings on launch; porcelain where UV and tracking resistance favours mature supply",
        },
    },
    "dc-power-transmission-and-motor-drives": {
        "problem": (
            "Alternating current won cities because a transformer is a simple, reliable impedance translator. But physics punishes AC on very long submarine cables: the cable itself behaves like a giant capacitor, and charging current can eat the ampacity you thought you bought. High-voltage direct current links move energy as DC between converter stations, letting asynchronous grids shake hands without synchronising every generator.\n\n"
            "The same semiconductor families that rescue cables also reinvent the workshop: a motor no longer needs to locked to line frequency if an inverter synthesises whatever Hz the load wants. Braking energy can return to the grid instead of smoking in a resistor bank — when regulations and hardware allow.\n\n"
            "Power electronics trade old problems for new ones. Switching devices must not shoot through; snubbers and layout fight voltage spikes; harmonics on the AC side can overheat neutrals and nuisance-trip upstream protection. A drive cabinet is therefore both liberator and neighbour: done well it is whisper-quiet; done poorly it is a radio jammer and a fire starter.\n\n"
            "Interruption is harder on DC than AC — there is no natural current zero every half-cycle — so breaker technology, fault detection, and coordination remain active engineering frontiers, not solved textbook trivia."
        ),
        "overview": (
            "Historically, mercury-arc valves and later thyristor bridges rectified and inverted bulk power; today IGBT and silicon-carbide stacks PWM approximate sine waves with self-commutation, helping weak grids and enabling black-start services modular converters can provide. Modular multilevel converters stack many small cells so waveforms are smooth and filters shrink.\n\n"
            "Motor drives typically rectify AC to a DC link, filter briefly, then invert to variable frequency for induction or permanent-magnet motors. Four-quadrant drives can motor or regenerate; ship propulsion and elevators exploit that daily. Cable and motor must be matched to fast edges — reflections from impedance mismatch can overvoltage windings.\n\n"
            "HVDC overlays connect offshore wind fields, cross mountain ranges with narrower right-of-way than AC for the same power, and tie islands to continents. Metallic return electrodes handle monopolar schemes; insulation coordination on DC bushings borrows from AC craft but is not identical.\n\n"
            "Harmonic filters and PWM strategies are civic infrastructure: they keep your drive from being the reason a hospital’s imaging suite ghosts artifacts. Standards encode emission limits; compliance is part of the product, not an afterthought."
        ),
        "buildSteps": [
            STEP(1, "Write the electrical story on one page before ordering semiconductors", "State input voltage class, DC bus target, switching frequency, maximum load current, and whether you must regenerate to the grid. Sketch the path from grid terminals through precharge, DC link, inverter, and motor. Note ambient temperature and altitude — semiconductors derate sharply when air is thin or hot.", ["notebook", "multimeter"], "Skipping precharge dumps inrush into capacitors and welds contacts"),
            STEP(2, "Lay out busbars and gate drives for short, low-inductance loops", "Follow manufacturer layout guides for module placement; keep gate-drive twisted pairs away from switching nodes. Add RC or TVS snubbers where datasheets hint at ringing. Torque semiconductor packages evenly so heatsinks mate flat.", ["torque screwdriver", "thermal paste or pads"], "Uneven clamp pressure creates hot spots that fail silently then suddenly"),
            STEP(3, "Install line reactors, DC chokes, and filters where the design calls for them", "Reactors soften di/dt and help compliance with harmonic limits; DC chokes limit fault rise rates in some topologies. Label each inductor with its function — future you will forget why it sat there.", ["LCR meter if available"], "Undersized DC-link capacitors let voltage sag trip undervoltage faults during acceleration"),
            STEP(4, "Program protections before connecting the motor", "Set overcurrent, overvoltage, earth-fault, and thermal models conservatively. Verify encoder or resolver direction matches motor rotation command — a wrong sign can run away until mechanical limits stop it. Test emergency stop paths independently of software.", ["laptop with vendor tool", "isolated scope probe"], "Never defeat interlocks for a quick test"),
            STEP(5, "Ramp from crawl speed with a mechanical guard, then tune control", "Start with current limit low enough to stop safely if wiring is wrong. Listen for bearing whine; watch DC bus ripple. Only after stability at low speed raise limits and enable regeneration if permitted. Log versions of firmware and parameters with dates.", ["infrared thermometer", "notebook"], "Regeneration into a grid segment that cannot absorb it raises DC voltage until something trips destructively"),
        ],
        "rawMaterials": {
            0: "Silicon IGBTs from power-module fabs; silicon carbide for higher frequency and efficiency where heat sinking allows; keep spare modules sealed dry until installation",
            1: "Low-inductance film capacitors for DC link; electrolytics for bulk energy where ripple current ratings match service life targets",
            2: "Laminated buswork or thick copper foil; aluminium bus with plated interfaces where weight dominates launch cost",
        },
    },
    "nuclear-fission-power-plant": {
        "problem": (
            "Burning coal or gas ties megawatt-years to chemistry in the air — carbon leaves the stack whether you like the climate mathematics or not. Fission concentrates energy in heavy nuclei: a modest mass of fuel, handled with discipline, can run a turbine hall for years between refuel outages. The engineering problem is kinetic, not rhetorical: keep exactly one neutron from each fission, on average, causing another fission; remove heat faster than fuel and cladding can melt; confine radioactive products when pipes break or operators fumble.\n\n"
            "Materials age in ways invisible to casual inspection: neutron embrittlement hardens reactor vessels; helium bubbles gather in welds; boron absorbers deplete on schedules easy to miss in a busy outage. Chemistry is equally unforgiving: radiolysis makes aggressive species; crud on fuel surfaces shifts power peaks; iodine spikes after transients demand instruments humans trust under stress.\n\n"
            "Decay heat is the moral fact reactor students learn first: after you SCRAM the chain reaction, fission products still release roughly single-digit percent of full power immediately, falling on hour and day scales but not to zero for years. Cooling must survive blackouts, sabotage scenarios, and human forgetfulness — because it will be tested by at least one of them.\n\n"
            "Socially, the plant is inseparable from safeguards, waste stewardship, and transparent regulation. Physics can be perfect on paper while institutions rot; the opposite is also true — careful people can run modest machines safely for decades if design margins and training culture align."
        ),
        "overview": (
            "Light-water reactors pack low-enriched uranium oxide pellets in zirconium tubes, arranged in assemblies inside a vessel flooded with pressurised water that both moderates neutrons and carries heat. In a pressurised-water plant, steam generators transfer that heat to a secondary loop that looks like a fossil turbine island — turbines, condensers, feedwater chemistry — except every room is zoned for radiation and every valve has a training story.\n\n"
            "Control rods and boron chemistry shim reactivity; operators move in small steps because delayed neutrons buy seconds of human reaction time. Containment buildings resist pressure from pipe breaks and limit hydrogen risks if mitigation fails. Spent fuel pools glow blue with Cherenkov light while decay heat drops toward dry-cask storage politics.\n\n"
            "Advanced concepts swap coolants and fuels — helium, sodium, molten salt — each trading corrosion, activation, and leak reactivity differently. None removes the need for heat removal ethics after shutdown.\n\n"
            "Operation is a licence to practice applied ethics: every alarm ties to a scenario analysis written in ink from prior plants. Preserving that culture across generations is as important as preserving forgings."
        ),
        "buildSteps": [
            STEP(1, "Treat licensing and independent review as part of the reactor, not paperwork around it", "Write safety cases humans can read without a law degree: what fails, how you detect it, what power paths remain, how long until something worse happens if nobody acts. Invite external reviewers early — embarrassment in a conference room beats headlines later.", ["regulatory guides", "probabilistic risk templates"], "Skipping peer review is not speeding up; it is gambling with cities"),
            STEP(2, "Forge, weld, and inspect nuclear-grade components with traceable identity", "Every plate and weld gets certificates; radiography and ultrasonic testing find slag and lack of fusion before water ever touches metal. Qualify welders and procedures on coupons before production joints. Store bolts in tamper-evident bins — counterfeit fasteners have killed projects and people.", ["radiography", "UT equipment", "material certs"], "A single wrong alloy in a steam generator tube sheet can write off years"),
            STEP(3, "Approach first criticality in measured boron steps, never by gut feel", "Count fuel bundles twice; compare keff predictions to instrument trends at each dilution step. Rehearse who holds authority to stop if instruments disagree. Keep redundant independent channels for neutron detection.", ["startup instrumentation", "written checklist"], "Mis-counted bundles have approached criticality wrong in history — do not add your story"),
            STEP(4, "Hot functional test every pump, valve, and snubber before loading fuel", "Run primary loops at temperature without fission power; record vibration baselines; rehearse switching from normal to emergency cooling paths with clocks running. Water hammer cracks steam generator tubes — open and close valves per procedure, not bravado.", ["vibration sensors", "procedure manuals"], "A cracked tube can let primary chemistry meet secondary — a long expensive week"),
            STEP(5, "Ascend power slowly while chemistry and health physics watch xenon and iodine", "Expect xenon transients after power changes; verify radiation monitors track predictions. Train shift crews on symptom-based drills, not only on knob labels. Relicense ageing equipment on evidence, not nostalgia.", ["health physics lab support", "chemistry logbooks"], "Organisational drift causes accidents — training rot is hardware failure"),
        ],
        "rawMaterials": {
            0: "Uranium from sandstone, unconformity, or porphyry deposits on Earth; off-world fission would more plausibly use shipped enriched oxide or thorium-uranium cycles engineered for that environment — not lunar helium-3, which implies an entirely different fuel cycle and reactor physics",
            1: "Monolithic reactor-vessel forgings from a handful of world-capable forges; until local heavy forging returns, store retired vessel sections as templates, cooperate with regions that retain press capacity, or downscale to smaller modular reactors designed for bolted shells with conservative margins",
            2: "Boron carbide or silver-indium-cadmium in clad rods for thermal reactors; metallic hafnium assemblies where chemistry favours them — both require honest metallurgy and inspection, not improvised scrap",
        },
    },
    "solar-photovoltaic-power-systems": {
        "problem": (
            "Every green leaf is a solar collector tuned by billions of years of evolution; human photovoltaic panels are a blunt industrial imitation that nonetheless works well enough to matter. The problem is not whether sunlight exists — it is whether you can turn a diffuse sky into dispatchable electrons without bankrupting yourself in glass, silver, and land.\n\n"
            "A solar cell is a thin sandwich where photons lift electrons across a junction built by painstaking crystal and dopant control. Dust, heat, and partial shading each punish output differently: dust steals photons; heat narrows the voltage window; shading can reverse-bias weak cells until bypass diodes save them — at the cost of complexity and fire risk if connectors are cheap.\n\n"
            "Grid-tied inverters must respect the same frequency and voltage contracts as steam turbines, while lacking inertia. Rapid shutdown rules exist so firefighters are not surprised by live roof conductors after a house fire. Off-grid systems add batteries whose chemistry introduces another discipline — state-of-charge estimation, thermal runaway prevention, and end-of-life recycling.\n\n"
            "Scale shifts politics: utility fields compete with agriculture and habitat; rooftop arrays compete with roof structure and installer skill. The technology is honest about land and labour — ignore either and the levelised cost lies."
        ),
        "overview": (
            "Modern silicon modules laminate cells between glass and polymer backsheets, edge-sealed against moisture. Cells are sliced from boules or grown as ribbons, doped to form PN junctions, contacted with fine grid fingers, and anti-reflection coated. Silver paste dominates fine-line printing today though copper-plating recipes seek to reduce noble metal.\n\n"
            "Strings of modules feed inverters that track the maximum power point as irradiance changes — an algorithmic hill climb on a curve that shifts with temperature. Central inverters serve whole fields; string inverters isolate failures; microinverters per module simplify shading at cost of electronics count.\n\n"
            "Trackers aim modules toward the sun on steel posts driven by motors, controllers, and lightning grounding that must survive decades outdoors. Transformers step up collector voltage for interconnection rules; protective devices isolate ground faults on wet mornings when insulation is worst.\n\n"
            "Life-cycle thinking includes inverter replacement cadence, module delamination, and recycling routes for silicon, glass, and frames — the industry matures as waste piles appear."
        ),
        "buildSteps": [
            STEP(1, "Measure your site’s sun and shade before buying pallets of glass", "Log hourly shade from trees, chimneys, and future construction. Use a simple tilted sensor for a week if you lack professional data — winter sun angles surprise optimists. Decide whether trackers earn their maintenance cost or fixed tilt is wiser.", ["notebook", "camera", "cheap irradiance logger if possible"], "Partial shading without bypass planning can destroy cells slowly"),
            STEP(2, "Mechanically design the rack like a small building, not like a garden trellis", "Calculate wind and snow loads for your code region; anchor footings to spec; torque stainless fasteners with anti-seize where metallurgy demands. Run equipotential bonding so lightning has a polite path.", ["structural tables", "torque wrench"], "Under-designed racks sail in storms and cut neighbouring roofs"),
            STEP(3, "Wire strings to voltage limits your inverter expects", "Read the inverter’s maximum input voltage at coldest morning — open-circuit voltage rises when silicon is cold. Use appropriate cable gauges and UV-rated jackets outdoors. Label every combiner box leg.", ["multimeter", "temperature chart for Voc"], "Overvoltage on a cold dawn destroys inverter front ends"),
            STEP(4, "Commission the inverter with grid rules or battery BMS limits", "If grid-tied, enable anti-islanding protection required locally. If off-grid, set battery voltage and current limits conservatively; verify temperature sensors on packs. Update firmware deliberately — log versions.", ["laptop", "vendor manual"], "DIY battery banks without fuses have burned houses"),
            STEP(5, "Plan cleaning, inverter replacement, and module inspection on a calendar", "Dust losses vary by climate; schedule a spring wash where ROI justifies water use. Infrared-scan modules annually if you can — hot spots reveal cracked cells and bad diodes before they become fires.", ["soft brush", "hose", "optional thermal camera"], "Walking on modules cracks cells even when glass looks fine"),
        ],
        "rawMaterials": {
            0: "Electronic-grade polysilicon from Siemens-style chlorosilane reduction on Earth; early off-world PV may rely on shipped cells/modules until metallurgical silicon can be upgraded with portable chlorination and distillation skids",
            1: "Silver screen-print pastes today; migrating to plated copper fingers reduces Ag but needs clean plating lines — budget for either chemistry until copper recipes mature",
            2: "Low-iron tempered glass for transmission; thin-film cadmium telluride or CIGS on flexible substrates where mass or shatter risk dominates spacecraft surfaces",
        },
    },
    "high-capacity-electrochemical-batteries": {
        "problem": (
            "A spinning reserve turbine answers the grid in seconds but wants fuel and maintenance; a reservoir answers in minutes but needs geography. Batteries answer in milliseconds — they are the fastest negotiators between variable sun and impatient motors — but they store energy in reactive chemistry that ages with every cycle and every hot afternoon.\n\n"
            "Lithium-ion families intercalate ions between graphite-like anodes and oxide cathodes through an electrolyte and a separator thinner than a hair. That thinness is performance and peril: dendrites, contamination, and overcharge can puncture separation; thermal runaway can cascade through packs if spacing and cooling lie.\n\n"
            "A battery management system is therefore not an accessory; it is the organ that measures each cell’s voltage and temperature, balances state of charge, limits current, and opens contactors when sanity fails. Without it, a pretty stack of pouches is a sculpture awaiting ignition.\n\n"
            "Recycling and mining ethics follow batteries into headlines — cobalt geography, brine water use, and firefighter training for warehouse fires are part of the technology now, not footnotes."
        ),
        "overview": (
            "Industrial packs series-parallel cells to reach hundreds of volts; contactors and fuses protect both directions. Thermal management may be air, liquid cold plates, or refrigerant loops depending on C-rate and calendar life targets. Inverters bidirectionally convert DC to grid AC with harmonic controls similar to solar.\n\n"
            "Cathode chemistries trade energy density, cobalt content, cycle life, and thermal stability — lithium iron phosphate is kinder on many axes at cost of volumetric density. Silicon-blended anodes promise more capacity if swelling can be engineered around.\n\n"
            "Grid services include frequency regulation, peak shaving, transmission deferral, and black-start support when paired with inverters that can form voltage. Behind-the-meter systems shave demand charges if tariffs reward them honestly.\n\n"
            "Second-life reuse of vehicle packs into stationary storage extends value but demands recharacterisation — aged cells are not fresh cells with a discount sticker."
        ),
        "buildSteps": [
            STEP(1, "Choose chemistry to match duty cycle, safety culture, and temperature", "Read datasheets for allowed voltage and temperature windows. If your site cannot guarantee aircon, favour chemistries with wider thermal tolerance. Write the maximum continuous charge and discharge power you truly need — oversizing C-rate wastes money and shortens life.", ["notebook", "utility tariff if grid-tied"], "Mismatched chemistry voids warranties and insurance"),
            STEP(2, "Mechanically cage modules with non-combustible spacing and venting thought through", "Follow manufacturer spacing for air channels; do not pack foamed plastic around cells for aesthetics. Route DC cables in separate conduits from AC; label polarities at both ends.", ["metal racking", "fire-rated barriers"], "Gas from one cell can ignite neighbours if vents aim wrong"),
            STEP(3, "Install fuses and contactors so a single cell fault cannot feed unlimited current", "Size fuses per string; use contactors rated for DC interruption — AC ratings lie. Precharge resistors limit inrush when closing onto capacitive inverters.", ["DC-rated fuses", "precharge schematic"], "Arcs on DC do not self-extinguish like AC arcs"),
            STEP(4, "Commission the BMS before trusting any automation", "Verify cell balance at top and bottom of charge; calibrate current sensors; test emergency stop and manual disconnect paths. Set conservative limits first; widen only after soak testing.", ["BMS laptop tool", "insulation tester"], "Never parallel strings without understanding circulating currents"),
            STEP(5, "Log state of health and plan replacement economics", "Export cycle counts and temperature histograms quarterly. Train firefighters where disconnects live and what hazards remain after disconnect — some faults smoulder inside pouches.", ["logbook", "site diagram for fire service"], "Thermal runaway can release toxic HF — respirators matter"),
        ],
        "rawMaterials": {
            0: "Lithium salts from South American brines, Australian spodumene, or clay-hosted resources on Earth; off-world batteries initially ship as packaged cells until local brines or pegmatite zones justify in-situ chemical plants with closed water loops",
            1: "NMC cathodes for energy density; LFP where cobalt supply and thermal kindness dominate trade-offs",
            2: "Natural or synthetic graphite anodes; silicon oxide blends where energy density justifies swelling management",
        },
    },
    "spoken-language": {
        "problem": (
            "Speech is the oldest wide-area network humans run without installing firmware. It crosses a workshop faster than a chalk line, carries tone that signals intent or irony, and lets a child ask ‘why’ until the adult admits the limit of their own knowledge. Without it, complex coordination collapses into gesture chains that do not survive interruption — you cannot revise a pointing sequence mid-sentence the way you can repair a spoken plan.\n\n"
            "The obstacle is not only anatomy — lungs, larynx, ears — but agreement. A sound becomes a word only when a community treats it as one, corrects misuse, and punishes lies often enough that truthfulness stays cheaper than chaos. Oral cultures store technique in metre and story because rhythm and redundancy survive noisy transmission better than bare lists.\n\n"
            "Every later medium is a compression of speech: writing freezes word order; telegraph prices by character; codecs predict phonemes. Lose fluent dialogue and you lose the fastest path to transfer tacit motor skill — the way a master potter’s hands explain what a book cannot.\n\n"
            "Recovery is therefore partly sociological: protect elders, apprenticeships, and councils where correction is kind. A language dies when children stop playing in it, not when dictionaries stop printing."
        ),
        "overview": (
            "Spoken languages combine a small inventory of meaningless sounds with rules that build unlimited meaningful sentences — compositionality with pragmatic glue. Prosody — rise and fall, pause, stress — layers intent on top of grammar; the same sentence read flat can insult or apologise depending on tune.\n\n"
            "Children acquire speech by statistical listening plus caregiver feedback; adults learn second languages with more effort but the same combinatorial core. Bilingualism is normal globally; diglossia — different languages for home and market — shapes who can access which institution.\n\n"
            "Oral law, medicine, and navigation rely on memorable forms: parallelism, rhyme, and narrative embedding. Writing later partially replaces those affordances with external error correction, but courtrooms and hangars still run on live question-and-answer.\n\n"
            "For rebuilders, record fluent experts on durable media, but never mistake recordings for communities — playback cannot negotiate new words for new tools the way a living room can."
        ),
        "buildSteps": [
            {"order": 1, "title": "Anchor words to shared attention", "description": "Point at a visible object, say a short label, do the action, repeat. Wait for the learner’s eyes to follow before naming — joint attention is the handshake of meaning. Use the same word for the same object until it sticks; avoid cute synonyms early.", "prerequisiteTools": ["patient speakers", "stable daily routines"], "warningNote": "Forced repetition without joy produces mimicry, not language"},
            {"order": 2, "title": "Teach a survival core before poetry", "description": "Prioritise fire, water, tools, kin names, directions, numbers to ten, and honest refusal words. Drill short sentences in real contexts: ‘Stop — hot — back up.’ Role-play injuries and arguments so learners hear tone under stress.", "prerequisiteTools": ["real tasks", "clear props"], "warningNote": "Homonyms across dialects confuse rebuild teams — keep a sense dictionary"},
            {"order": 3, "title": "Practice stories that carry procedural truth", "description": "Embed sequences inside narratives humans remember: how to find fresh water, how to temper steel, how to navigate by stars. Invite listeners to interrupt with questions; correct mistakes immediately in speech, not hours later on paper.", "prerequisiteTools": ["evening fire or shared meal"], "warningNote": "Gossip destroys trust faster than fire — teach norms for verification"},
            {"order": 4, "title": "Train noisy-channel resilience", "description": "Hold drills at distance, through wind, across water — any channel that strips consonants. Teach repetition protocols (‘say again’, ‘confirm word three’) borrowed from aviation and boats. Practice turn-taking with timers so shy speakers get airtime.", "prerequisiteTools": ["whistle or drum optional"], "warningNote": "Shouting permanently damages young voices — use instruments for far signals when possible"},
            {"order": 5, "title": "Institutionalise teaching without killing play", "description": "Pair every novice craft with a named mentor and weekly review. Rotate mentors so dialect features mix deliberately. Archive new coinages for tools with definitions spoken aloud into recordings plus example sentences.", "prerequisiteTools": ["mentor roster", "recording device if available"], "warningNote": "Recording elders without consent breaks trust — negotiate purpose and copies"},
        ],
        "rawMaterials": {
            0: "Living communities on Earth; isolated crews rely on scheduled high-bandwidth calls, in-person rotations, and written backups because interplanetary latency removes real-time prosody for months",
        },
    },
    "writing-early-systems": {
        "problem": (
            "Speech is a river — beautiful, immediate, and gone when the breath stops. Administrating a granary across seasons, collecting tithes, or promising repayment across harvests needs marks that survive the speaker. Early writing answers external memory: visible signs that rehydrate meaning when a trained reader returns with fresh eyes.\n\n"
            "The obstacle shifts from air to stuff: clay that cracks if dried wrong, ink that fades, stone that weathers. It also shifts to labour: mastering thousands of signs was a profession; literacy rates stayed tiny for millennia while still reshaping who could command armies.\n\n"
            "Writing encodes power — law codes, propaganda, contracts — and creates new failure modes: forged seals, ambiguous clauses, copied errors that become tradition. Decipherment centuries later needs bilinguals and luck; archive dictionaries, not only heroic texts.\n\n"
            "For recovery, treat writing as infrastructure: standardise signs, train scribes, and protect fired tablets from rain as carefully as you protect grain."
        ),
        "overview": (
            "Proto-writing begins with tokens and impressions counting discrete goods; full systems map language more directly. Cuneiform presses wedges into wet clay; Egyptian hieroglyphs mix logograms with phonetic complements; alphabets shrink the sign inventory by letting letters stand mostly for sounds.\n\n"
            "The rebus principle — using the sound of a pictured word for an unrelated homophone — bridges pictographs toward syllabaries. Determinatives act like silent classifiers disambiguating homographs.\n\n"
            "Material shapes script: clay invites wedge strokes; papyrus invites flowing ink; bamboo slips encourage vertical columns. Copyists introduce errors that become manuscript families; commentaries freeze readings.\n\n"
            "Literacy’s spread is uneven, but even small literate cadres let empires administer distance — orders can outlive couriers if sealed and authenticated."
        ),
        "buildSteps": [
            {"order": 1, "title": "Decide what you must remember across seasons", "description": "List transactions, inventories, laws, or prayers that fail when oral memory bottlenecks. Pick a substrate you can reliably obtain — clay if you have riverbanks, bark if your forest yields it, parchment if herds exist. Match ambition to material cost.", "prerequisiteTools": ["notebook for planning"], "warningNote": "Over-ambitious sign inventories stall learners — start with numbers and nouns"},
            {"order": 2, "title": "Invent or borrow a small stable sign set", "description": "Begin with pictographs for concrete nouns; add rebuses for abstract words by sound. Write each sign’s name spoken aloud next to early tablets so future readers have a Rosetta edge. Keep stroke order simple — complexity is a tax forever.", "prerequisiteTools": ["stylus", "straight edge"], "warningNote": "Homophones multiply fast — introduce determinatives early"},
            {"order": 3, "title": "Train scribes with correction culture", "description": "Pair novices with masters who mark errors in red ochre or marginal ticks. Drill copying the same tablet until hand cramps yield consistent wedges or strokes. Schedule public readings so mistakes surface quickly.", "prerequisiteTools": ["master scribe", "correction ink"], "warningNote": "Secret scripts invite elite capture — publish learner tablets for community audit"},
            {"order": 4, "title": "Fire or dry clay tablets on a schedule", "description": "If using clay, learn controlled drying to avoid curling; fire tablets you intend to keep centuries. Store unfired drafts separately from archives — water is the enemy twice.", "prerequisiteTools": ["kiln or pit fire", "shelving off ground"], "warningNote": "Rushed firing explodes wet cores"},
            {"order": 5, "title": "Archive dictionaries beside heroic texts", "description": "Maintain synonym lists, pronunciation notes, and measure tables — the boring pages future decipherers need. Duplicate archives geographically if politics allows.", "prerequisiteTools": ["duplicate storage"], "warningNote": "Single-site archives die to one fire"},
        ],
        "rawMaterials": {
            0: "Clay and reeds along alluvial rivers; wax tablets for drafts in Mediterranean climates; slate pencils in schools where wood pulp is scarce",
            1: "Soot-based carbon ink from lampblack; iron-gall ink where tannin and vitriol exist — both need recipes filed with scribes",
            2: "Stylus copper or bone for clay; reed pens for ink; brushes where silk or paper traditions dominate",
        },
    },
    "paper-and-ink-media": {
        "problem": (
            "Writing on stone or clay is durable but heavy; carrying a library on your back demands something thinner. Paper — interlocked plant fibres matted into sheets — trades archival perfection for portability and speed. That bargain creates new anxieties: mould in humid climates, acid that yellows pages, and fires that erase cities in an afternoon.\n\n"
            "Ink is not decoration; it is colloidal chemistry. Pigments must disperse finely enough not to clog quills yet stay suspended; binders must fix to fibres without feathering uncontrollably. Watercolour skies and legal contracts ask different recipes from the same word ‘ink’.\n\n"
            "Paper also democratised bureaucracy: forms, receipts, and textbooks scale when sheets become cheap. With scale came forgery, watermark arms races, and the quiet politics of who owns a mill upstream of a city.\n\n"
            "For recovery, protect rag supply chains and sizing recipes as carefully as you protect forges — a papermaker is a chemist with a vat, not a woodcutter with a whim."
        ),
        "overview": (
            "Traditional rag paper pulps linen and cotton cloth to long fibres, beats them in water, forms sheets on a wire mould, presses, dries, and often sizes with gelatin or starch so ink sits on the surface instead of blotting sideways. Wood pulp later lowered cost but introduced lignin that ages unless removed or buffered.\n\n"
            "Carbon black inks soot in gum arabic are forgiving for scribes; iron-gall inks bite into fibres permanently but need disciplined chemistry — excess acid consumes paper from within. Printing inks add drying oils and modifiers for tack across metal type.\n\n"
            "Watermarks and chain lines become security features and dating clues. Archival storage fights relative humidity swings that stress bindings and encourages alkaline buffering where budgets allow.\n\n"
            "Paper’s fragility pushed redundancy: duplicate scriptoria, dispersed copies, and eventually digitisation — each layer inherits paper’s affordances while trying to escape fire."
        ),
        "buildSteps": [
            STEP(1, "Source long clean fibres", "Collect white linen or cotton rags free of buttons, elastic, and synthetic blends. Cut small and soak until fibres separate easily when rubbed. Note seasonal water hardness — minerals affect colour and sizing.", ["scissors", "soaking vats"], "Metallic fasteners destroy beaters"),
            STEP(2, "Beat to controlled fibrillation", "Move from stamp mill or Hollander beater in timed passes; pull test sheets often. Stop when fibres knit on a wire but do not yet dust apart when dry — over-beating weakens sheets.", ["beater", "test mould"], "Dust masks for fine cellulose"),
            STEP(3, "Sheet formation and couching", "Dip a mould and deckle, shake to interlock fibres evenly, drain, couch onto felts, press gradually. Keep vat temperature steady — cold slows drainage; heat grows bacteria.", ["mould and deckle", "felts", "press"], "Uneven shaking makes thin patches that tear"),
            STEP(4, "Dry under tension", "Air-dry on lines or in loft spaces with gentle airflow; restrain edges if cockling appears. For writing-grade, apply size after partial drying per local recipe.", ["loft space", "clothespins or weights"], "Rushing drying curls sheets unpredictably"),
            STEP(5, "Mill ink and test on scraps", "Disperse pigment with muller or professional disperser; record binder ratios. Test feathering, drying time, and bleed-through on your actual paper — not on modern coated stock.", ["muller", "glass slab"], "Iron-gall needs dated labels — it evolves acidity over decades"),
        ],
        "rawMaterials": {
            0: "Cotton and linen rag historically; softwood kraft pulp today; in closed habitats recycle textile trim and agricultural straw pulps with careful lignin control",
            1: "River or RO-purified process water on Earth; closed-loop filtration and settling tanks where discharge is constrained",
            2: "Carbon black and organic dyes; mineral pigments like ochre where particle size is controlled — always pair pigment choice with intended pen or brush",
        },
    },
    "printing-press-movable-type": {
        "problem": (
            "A scriptorium can duplicate a book beautifully, but each copy ties up a scribe for months. Ideas spread at the speed of handwriting — fine for liturgy, lethal for science and navigation when printers multiply faster than wars. Movable type attacks the bottleneck: cast many identical letters once, arrange them into any page, print, break apart, reuse.\n\n"
            "The obstacle is precision economics: type must be hard enough to survive thousands of impressions yet soft enough to file; height must match within microns or impressions ghost and ink floods. Paper supply and ink tack must agree with metal and press speed.\n\n"
            "Printing also amplifies error: a wrong letter becomes a thousand wrong letters. Editorial workflows — proof sheets, stop-press corrections — become technologies alongside the press itself.\n\n"
            "Politically, cheap text rearranges who may read law, scripture, and sedition. The press is not only gears; it is an argument about who controls reproduction."
        ),
        "overview": (
            "Punchcutters carve master letters in steel, strike them into copper matrices, and cast many type pieces in lead-antimony-tin alloys that solidify sharp and wear slowly. Compositors set lines in composing sticks, justify with spaces, lock the forme into a chase, and ink evenly with composition rollers or balls.\n\n"
            "Screw presses apply firm even pressure across the platen; later cylinder presses raise speed. Paper grain direction aligns with pull to reduce tearing; dampening relaxes fibres for deeper impressions.\n\n"
            "Typography encodes readability: x-height, contrast, and ligatures are ergonomic choices. Colour printing layers separate formes — registration becomes mathematics.\n\n"
            "Digital printers inherited the same questions with different physics — toner fusion and inkjet drops — but the social shape remains: cheap copies change regimes."
        ),
        "buildSteps": [
            STEP(1, "Cut one perfect letter punch before casting anything", "Work a single letter in tool steel under magnification; proof it on smoke-blackened paper until curves are true. Only then strike the matrix — a bad punch multiplies misery.", ["files", "magnifier", "hardening equipment"], "Overhard steel snaps; overtempered steel dents"),
            STEP(2, "Cast a few sorts and test height", "Pour type metal into a hand mould; file feet until the letter matches your gauge block exactly. Print trial lines — if some letters shine while others fade, height is wrong.", ["mould", "gauge block"], "Lead splash burns — leather apron and face shield"),
            STEP(3, "Build a rigid chase and furniture system", "Cut reglet and furniture from seasoned wood or metal; learn locking patterns that resist spread under pressure. Label cases with readable diagrams so novices do not resort letters.", ["saw", "chisel"], "Loose lockup drops spaces mid-run"),
            STEP(4, "Mix ink to the press you actually own", "Start stiff, add varnish drops until the ink threads cleanly from roller to type without filling counters. Record room temperature — tack changes with heat.", ["ink knife", "glass slab"], "Too loose ink fills counters and looks muddy"),
            STEP(5, "Print progressively, correcting once per forme", "Pull a single proof, mark faults with standard proofreader marks, fix type, re-lock, proof again. Only then run edition sheets, stacking with dry interleaving paper.", ["proof paper", "drying racks"], "Wet stacks set off ink offset — rotate boards"),
        ],
        "rawMaterials": {
            0: "Lead-antimony-tin type metal from smelter chains; short-run polymer or wood type where metal casting is unavailable — expect faster wear",
            1: "High-carbon punch steel; later EDM for fine repairs where electrical gear exists",
            2: "Rag or chemical pulp sheets with grain aligned to press pull; avoid glossy coated stock until inks match",
        },
    },
    "electrical-telegraph": {
        "problem": (
            "Horse couriers and semaphore chains carry news faster than walking, but they tire, sleep, and mishear flags in rain. The telegraph promises near-instant coordination along a wire — if you can detect feeble currents at the far end, if insulation survives miles underground or underwater, and if operators share protocols honest enough to prevent garble.\n\n"
            "Early systems experimented with needles, numbered codes, and clicks; Morse class codes won simplicity of hardware at the cost of trained ears and wrists. Geography becomes code tables: which office relays which message, how billing is logged, how priority disputes resolve.\n\n"
            "Business and empire follow: railways schedule trains; newspapers quote distant markets; military commanders acquire appetites for bandwidth they cannot always secure.\n\n"
            "Collapse recovery must remember telegraphy is teamwork: batteries, sounders, repair climbers, and polite procedure are one system."
        ),
        "overview": (
            "A loop of wire with a key in series and a sounder or relay at the office forms the simplest story: closing the key completes the circuit, energising an electromagnet that clicks. Repeaters amplify weak signals on long routes; duplex schemes send both directions with clever balances.\n\n"
            "Insulation mattered historically: glass and ceramic insulators on poles, gutta-percha on submarine cores, later bitumen and polymers. Lightning arrestors sacrifice paths to save humans and instruments — another layer of civic infrastructure.\n\n"
            "Telegraph offices become data centres of their era: brass pegboards, message forms, and night shifts. Cryptography appears quickly — anyone tapping a wire learns secrets unless operators encode.\n\n"
            "Radio and fibre did not erase the telegraph’s lesson: protocols and maintenance culture matter as much as conductors."
        ),
        "buildSteps": [
            STEP(1, "Survey a right-of-way humans can maintain for decades", "Walk the proposed line noting river crossings, rocky ground, and trees that will grow into wires. Negotiate poles with landowners in writing. Plan spare wire drums staged every dozen miles in rough terrain.", ["maps", "measuring rope"], "Assuming ‘we’ll fix access later’ guarantees winter outages"),
            STEP(2, "Set poles, insulators, and earth electrodes before stringing", "Keep consistent height above roads and livestock. Bond earth well at offices — telegraph references are relative to local ground. Label each span for repair crews.", ["post hole digger", "climbing irons"], "Induction from parallel power lines can surprise ‘dead’ wires"),
            STEP(3, "String copper with proper sag and strain relief", "Tension for ice load, not just fair weather. Use dead-ends and suspension clamps appropriate to wire gauge. Avoid sharp bends that work-harden and snap copper.", ["come-along", "wire gauge"], "Snapped wire whips — clear bystanders"),
            STEP(4, "Install keys, sounders, and batteries with office discipline", "Teach a standard spacing for dots and dashes; practise relay retransmission until error rates drop. Log battery voltage — weak cells make marginal circuits lie.", ["practice set", "logbook"], "High-Zap telegraph batteries need respect and ventilation"),
            STEP(5, "Run acceptance tests with corrupted conditions", "Simulate rain leakage, partial grounds, and operator fatigue. Write procedure cards for emergencies: line down, lightning storm, unknown sparking insulator.", ["megger", "spare insulators"], "Never work elevated lines during storms"),
        ],
        "rawMaterials": {
            0: "Soft-drawn copper telegraph wire on Earth; early off-world links may use aluminium with larger gauges or optical links once available — keep mechanical redundancy for dust storms",
            1: "Lead-acid cells for portable office power where dynamos are absent; later nickel-iron or lithium where maintenance culture matches chemistry",
            2: "Gutta-percha or bitumen-impregnated paper for submarine cores historically; XLPE or PE jackets on modern landlines — always test joints underwater before trusting claims",
        },
    },
    "telephone-exchange-system": {
        "problem": (
            "A telegraph excels at one-to-many urgency but feels rude for intimate coordination; everyone on a party line hears your negotiation with the midwife. Telephony wants switched circuits — a temporary electrical path between two voices — then later packetised speech, but the human problem remains: who may connect when, and who pays.\n\n"
            "Manual exchanges trained operators to memorise personalities and faults; automatic exchanges replaced empathy with relays and then digital switches. Common-battery systems centralised power so subscribers did not each maintain a cellar full of wet cells.\n\n"
            "Scaling introduced mathematics: blocking probabilities, trunk groups, and overload days when everyone picks up at once. Rural long loops demanded careful impedance design so speech stayed intelligible.\n\n"
            "Today’s mobile cores hide complexity behind glass, but the exchange problem persists as routing tables, lawful intercept interfaces, and emergency services location — sociology wearing copper headphones."
        ),
        "overview": (
            "Strowger-class stepping switches translated dial pulses into physical positions of wiper arms; crossbar systems separated control from paths; digital switches time-multiplex PCM samples through non-blocking fabrics. Outside plant moved from open wires to twisted pairs that reduced crosstalk; loading coils spaced inductance to extend voice band on long loops.\n\n"
            "Signalling evolved: loop start, ground start, multifrequency tones, and common-channel signalling carried setup messages out-of-band. SS7-linked worlds enabled mobility and fraud simultaneously — every convenience is a new seam.\n\n"
            "Powering remote terminals, cooling huts, and battery backup for blackouts are part of the voice promise. Fibre backhaul eventually swallowed copper trunks, but the last mile lesson remains: impedance, balance, and corrosion control.\n\n"
            "Exchanges are also buildings with human rituals: shift logs, spare cards, and the coffee machine that kept 3 a.m. reroutes civil."
        ),
        "buildSteps": [
            STEP(1, "Model how many simultaneous conversations your town truly needs", "Count phones, peak hour patterns, and emergency surge assumptions. Decide blocking target — not every village needs zero blocking if economics forbids it — but document the trade-off honestly.", ["notebook", "population data"], "Underestimating Mothers’ Day traffic is a classic bruise"),
            STEP(2, "Engineer outside plant: gauge, twist, and length", "Measure loop resistance and capacitance; place loading coils per tables if using long rural pairs. Colour-code pairs obsessively; photograph as-built before trenches refill.", ["TDR", "ohmmeter"], "Pair swaps misroute emergency calls"),
            STEP(3, "Install MDF and protector blocks before subscriber prem", "Bring pairs to a main distribution frame; terminate on protectors that shunt lightning. Label every jumper with origin and date — future you will bless the discipline.", ["punch tool", "labels"], "Shared shells can cross-couple noise if shields are mishandled"),
            STEP(4, "Stage switch or softswitch with recorded test calls", "If using electromechanical heritage, oil pivots per manual; if digital, verify clocking and echo cancellation. Run load tests with artificial traffic before inviting the mayor.", ["test sets", "traffic generators"], "Clock drift causes slips and chirps"),
            STEP(5, "Write runbooks for outage, lawful intercept, and migration", "Document how to reroute trunks, how to patch around card faults, and how to roll back software. Train two people per skill — buses still hit teams.", ["runbooks", "spare cards"], "Single-human knowledge is a single point of failure"),
        ],
        "rawMaterials": {
            0: "PE-insulated twisted copper pairs from cable plants; ship pre-made cable until extruders exist off-world — then oversize conductors slightly for colder nights and UV",
            1: "Galvanised steel frames from rolling mills; aluminium racks where weight matters, with bimetallic awareness at copper joints",
            2: "Silver-cadmium-oxide relay contacts historically; solid-state relays and digital line cards where semiconductor supply is healthy",
        },
    },
    "vacuum-tube-electronics": {
        "problem": (
            "Crystals could detect radio waves, but stable amplification eluded early builders until thermionic valves appeared: heat a cathode until it boils electrons, pull them across vacuum with a positive plate, and modulate the flow with a grid that demands almost no power — gain from geometry and temperature, not from microscopic junctions yet.\n\n"
            "Vacuum is the unsung hero and villain. Residual gas ionises under high fields; getters swallow molecules after seal-off; pumps must reach hard vacuum before the oxide cathode dies from poisoning. Tubes are hot, fragile, and microphonic — mechanical vibration becomes signal.\n\n"
            "Still, tubes taught entire generations how amplifiers think: bias points, load lines, and screen grids are portable metaphors even after silicon arrives. High-power radio and radar kept tubes relevant where semiconductors struggled with voltage and heat.\n\n"
            "For recovery, glassblowing, pump science, and getter flashing are crafts as essential as winding transformers — lose them and you lose long-distance voice until someone relearns them painfully."
        ),
        "overview": (
            "A triode stacks a control grid between cathode and plate; small grid voltage swings large plate current. Add screen and suppressor grids to tame capacitance and secondary emission — tetrodes and pentodes stabilise RF performance. Cathode-ray tubes steer electron beams for oscilloscopes and television with electric and magnetic fields.\n\n"
            "Manufacturing joins glass to kovar pins, winds molybdenum grids on jigs, and flashes barium getters that bind stray gas. Pump trains rough with rotary pumps, finish with diffusion or turbomolecular stacks, bake envelopes to drive water out of glass.\n\n"
            "Power tubes dissipate kilowatts on graphite or metal anodes cooled by air, water, or vapor phases; bias supplies set operating points on plate curves chosen graphically before SPICE.\n\n"
            "Logistics once measured tube counts like ammunition — ENIAC-scale computers were maintenance marathons as much as mathematical marvels."
        ),
        "buildSteps": [
            STEP(1, "Machine electrode stacks with obsessive cleanliness", "Wind grids with even pitch; align coaxially under magnification; spot-weld supports without splatter. Coat cathodes in controlled carbonate slurries; bake schedules matter.", ["microscope", "fine tweezers"], "Skin oils poison emissive surfaces"),
            STEP(2, "Seal glass envelopes with leak-check discipline", "Use graded glass-to-metal seals; anneal to relieve stress. Helium leak-check before pumping investment — a pinhole wastes days.", ["torch or induction sealer", "leak detector"], "Implosion shards are real — shield during tests"),
            STEP(3, "Pump, bake, and flash getters on schedule", "Bake-out drives moisture from mica and glass; ion gauges tell truth about vacuum. Flash getter when pressure is right — too early wastes capacity.", ["vacuum manifold", "ion gauge"], "Mercury diffusion pumps need cold traps or they poison tubes"),
            STEP(4, "Age cathodes and plot curves", "Run at prescribed over-temperature briefly to stabilise emission; trace plate curves on a graph, marking bias and dissipation limits in red.", ["curve tracer or manual meters"], "Red-plate glow means runaway — cut power"),
            STEP(5, "Bin tubes by gm and noise for intended service", "Audio pairs need matched transconductance; RF stages need low microphonics. Print type numbers legibly; store upright to avoid cathode sag in large bottles.", ["test jig", "labels"], "Dropping a power tube can bend grids internally — invisible until power applied"),
        ],
        "rawMaterials": {
            0: "Borosilicate glass tubing from lampworking supply; metal-ceramic packages for rugged military tubes",
            1: "Nickel sleeves and molybdenum grid wire from refined sulphide ores; hydrogen-fired cleanliness before assembly",
            2: "Dry roughing pumps plus high-vacuum pumps; avoid mercury where environmental rules forbid it — use turbomolecular stacks when power allows",
        },
    },
    "radio-broadcast-and-receiver": {
        "problem": (
            "Copper follows ships until it cannot; armies and orchestras want audiences beyond earshot. Radio encodes information on high-frequency carriers — amplitude or frequency modulation early, digital modes later — so one transmitter can serve many receivers without stringing private wires to each listener.\n\n"
            "Physics intrudes: antennas want sizes comparable to wavelength; the ether is crowded; harmonics from sloppy transmitters jam distress frequencies. Receivers must select one story among megahertz of noise without deafening the operator.\n\n"
            "Regulation becomes technology: licences, exams, band plans, and enforcement against spark-gap villains are as important as oscillator stability. Broadcasting reshaped politics and music — simultaneous audiences are a new social geometry.\n\n"
            "Emergency services and marine distress remind us radio remains collapse-relevant even when phones feel universal — towers fall; skywave sometimes still answers."
        ),
        "overview": (
            "Transmitters generate a stable carrier, modulate it with audio or symbols, amplify through linearised stages, and match impedance to an antenna so power leaves as radiation instead of reflected heat. Receivers heterodyne signals to a fixed intermediate frequency for easier filtering, apply automatic gain control for fading, and demodulate to baseband.\n\n"
            "FM trades bandwidth for noise immunity; single-sideband squeezes spectrum for voice on crowded HF. Digital voice and data add error correction — intelligible speech where analogue would dissolve into hiss.\n\n"
            "Antenna farms pattern energy toward cities; ionospheric HF reaches continents at night with moods set by solar weather. Studio-to-transmitter links moved from phone pairs to microwave STL; RDS embeds metadata on FM subcarriers.\n\n"
            "Every link budget is a story of watts, antenna gain, path loss, and acceptable noise — engineering as accounting."
        ),
        "buildSteps": [
            STEP(1, "Learn your national band plan before soldering", "Print the allowed frequencies, power limits, and emission types for your licence class. Mark harmonics of your oscillator that must be suppressed — neighbours will not forgive interference to aeronautical bands.", ["regulatory booklet", "highlighter"], "Transmitting illegally can cost lives as well as fines"),
            STEP(2, "Build or buy an antenna matched to your chosen wavelength", "Measure SWR with a meter or bridge; trim elements patiently. Install lightning arrestors and proper earth bonds before first TX tests.", ["SWR meter", "cutting tools"], "RF burns are insidious — assume feedline is live"),
            STEP(3, "Assemble a superhet receiver with stable local oscillator", "Shield oscillator stages; verify image rejection with a signal generator if available. Set AGC time constants so fading does not pump audio obnoxiously.", ["signal generator optional", "oscilloscope"], "Microphonics in coils sound like percussion"),
            STEP(4, "Align IF filters and demodulator for intended mode", "For AM, check diode detector bias; for FM, verify discriminator symmetry; for SSB, set carrier insertion carefully. Log alignment screws touched — future alignment starts from known state.", ["alignment tools", "notebook"], "Wide IF sounds exciting until adjacent channels arrive"),
            STEP(5, "On-air tests with a mentor", "Make short legal test transmissions; request signal reports; iterate antenna height and grounding. Keep a station log — it disciplines troubleshooting and proves good citizenship.", ["logbook", "mentor on frequency"], "Never test alone inside shielded rooms without external verification"),
        ],
        "rawMaterials": {
            0: "Copper and aluminium for antennas and radials; PTFE coax where low loss matters — keep connectors weatherproofed",
            1: "High-permeability cores for IF transformers; air-core where Q must be high and stable",
            2: "Quartz crystals or ceramic resonators for stable oscillators; rubidium references where budgets allow",
        },
    },
    "communication-satellites": {
        "problem": (
            "Submarine cables are expensive; HF skywave is moody; microwave towers need line-of-sight chains across politics. Satellites offer a microwave repeater hundreds or thousands of kilometres up, seeing enormous ground footprints — one hop where Earth would need dozens of towers.\n\n"
            "Orbits trade gifts: geostationary dishes stay pointed but inject quarter-second echo on voice; low Earth constellations cut latency but demand handoffs and thousands of spacecraft. Launch is still violence wrapped in paperwork — mass and reliability dominate.\n\n"
            "Space is not empty for electronics: radiation ionises gates; single-event upsets flip bits; atomic oxygen gnaws surfaces in LEO. Thermal design must survive sunside and shadowside every hour without cracking solder.\n\n"
            "Regulation treats spectrum and slots as property-like — ITU filings are diplomacy with Kepler attached."
        ),
        "overview": (
            "A satellite bus supplies power from solar arrays and batteries, controls temperature with heat pipes and radiators, maintains attitude with reaction wheels and thrusters, and talks to Earth via telemetry links. Payloads amplify and translate microwave bands — LNAs at the antenna, channel filters, TWTA or solid-state power amplifiers, output multiplexers.\n\n"
            "Ground stations track with parabolic dishes, cryogenic LNAs for weak signals, and modems that close link budgets against rain fade. Beam shaping and polarisation reuse squeeze capacity; digital carriers pack many signals per transponder with error correction.\n\n"
            "End-of-life graveyard burns and deorbit plans address debris ethics; collision avoidance manoeuvres are now routine operations, not science fiction.\n\n"
            "Navigation constellations are cousins — same buses, different maths — proving communication and timing are braided."
        ),
        "buildSteps": [
            STEP(1, "Close a link budget on paper before CAD", "List transmitter EIRP, path loss, atmospheric fade margin, receive G/T, and required Eb/N0. If margin is negative, no heroics in assembly fix orbit physics.", ["calculator", "ITU rain models"], "Forgetting pointing loss leaves you one beamwidth from silence"),
            STEP(2, "Qualify parts for radiation and thermal cycling", "Test electronics under dose and temperature swings; add shielding mass only where failure rates demand it. Redundant lanes with cross-straps beat heroic single strings.", ["thermal vacuum chamber access", "rad test sources"], "Latch-up in CMOS can brick a bus — design inhibits"),
            STEP(3, "Integrate payload and bus with clean grounding", "Separate noisy digital returns from analogue RF references; verify antenna pattern on a range before launch. Label every coax phase and polarization.", ["vector network analyser"], "PIM from corroded joints raises noise floor mysteriously"),
            STEP(4, "Rehearse operations on simulators with injected faults", "Train operators for loss of attitude, battery collapse, and safe mode entry. Write command dictionaries two humans must agree on before uplinking.", ["ops simulator"], "Fat-fingered commands cannot be ‘oops’ in orbit"),
            STEP(5, "Commission on orbit with patience", "Unfold arrays slowly; bake out moisture; map momentum wheel saturation. Verify transponder linearity before loading many carriers — intermodulation is rude to neighbours.", ["spectrum analyser on ground"], "Thruster leaks re-point antennas — monitor pressure"),
        ],
        "rawMaterials": {
            0: "Triple-junction gallium arsenide solar cells from multi-junction fabs; silicon panels for cheaper missions with lower areal power",
            1: "Aluminium honeycomb panels and carbon-fibre composites for bus structures where mass dominates launch cost",
            2: "Monopropellant hydrazine or electric propulsion xenon — propellant choice sets station-keeping life and logistics",
        },
    },
    "optical-fiber-communications": {
        "problem": (
            "Copper bandwidth fatigues with distance: high frequencies attenuate, crosstalk whispers between pairs, and repeaters multiply noise. Optical fibre guides infrared light in a glass core so pure that transoceanic links need fewer regenerations than coax ever could — if splices are clean, bends gentle, and lasers stable.\n\n"
            "Nonlinear optics punishes hubris: high launch powers create four-wave mixing and self-phase modulation that smear pulses across dense wavelength-division multiplexing systems. Chromatic dispersion spreads short pulses unless fibres, lasers, and compensators conspire.\n\n"
            "Last-mile economics fought trenches and rights-of-way until demand for bits exceeded dislike of construction dust. Inside data centres, fibre is the quiet workhorse tying top-of-rack switches to spine fabrics.\n\n"
            "Collapse recovery still values fibre craft: cleave angles, fusion splicer calibration, and cleaning sticks are small tools that gate gigabits."
        ),
        "overview": (
            "Single-mode fibre confines light to one propagating mode with a tiny core; lasers launch narrow linewidths that survive long haul. Multimode fibre serves short reaches with cheaper optics inside buildings. Preforms are built by MCVD or outside vapour deposition, drawn to kilometres of hair-fine glass, coated in acrylate, and cabled with strength members.\n\n"
            "Erbium-doped fibre amplifiers boost C-band signals without optical-electrical-optical conversion; Raman amplification uses the fibre itself as gain medium. Coherent detection treats light like RF — DSP recovers phase and polarisation.\n\n"
            "Connectors (SC, LC, MPO) trade loss against convenience; angled polish reduces reflections that destabilise lasers. OTDR sends pulses to map faults versus distance — indispensable storytelling for crews.\n\n"
            "Submarine cables add armour, power feed to repeaters, and branching units — geography with amplifiers every few dozen kilometres."
        ),
        "buildSteps": [
            STEP(1, "Design span loss and dispersion budgets before ordering reels", "Sum connector losses, splice losses, fibre attenuation per km, splitter penalties, and system margin. Pick laser wavelength and fibre type together — they are not independent.", ["OTDR calculator", "datasheets"], "Optimistic budgets die in the first rain"),
            STEP(2, "Prepare workspace cleaner than you think necessary", "Close HVAC vents that blow dust; lint-free wipes only; inspect cleavers under magnification. Label every patch cord directionally — chaos grows exponentially in dense racks.", ["microscope", "cleaver"], "One fingerprint on a ferrule can cost a day"),
            STEP(3, "Cleave and fusion-splice on a stable table", "Strip gently; clean with approved fluid; cleave once confidently. Archive OTDR traces after each splice event with GPS or rack coordinates.", ["fusion splicer", "OTDR"], "Re-cleaving too many times shortens fibre to unusable stubs"),
            STEP(4, "Test bidirectionally at planned wavelength", "Swap OTDR ends to catch reflective faults hidden one-way. Verify polarisation extinction if using coherent gear.", ["OTDR", "light source", "power meter"], "Mismatched test wavelength lies about loss"),
            STEP(5, "Document as-built and train handlers", "Print diagrams with cable IDs; teach bend-radius discipline and trunk strain relief. Schedule re-OTDR after building moves — forklifts murder trays.", ["labels", "zip ties rated for temperature"], "Macro-bends raise loss slowly — temperature shifts unmask them"),
        ],
        "rawMaterials": {
            0: "Ultra-pure silicon tetrachloride and germanium dopants for preforms on Earth; ship spooled single-mode fibre off-world until local draw towers and dry gas chemistry justify on-site manufacture",
            1: "Germanium tetrachloride or alternative index dopants tuned to your process — document refractive index profiles, not only supplier names",
            2: "Indium phosphide wafers for long-haul lasers; silicon photonics where integration beats raw laser wall-plug efficiency",
        },
    },
    "semiconductor-crystal-growing-doping": {
        "problem": (
            "Polycrystalline silicon is fine for soup pots and alloys; transistors demand monocrystals where atoms line up for micrometres without grain boundaries stealing carriers. The manufacturing problem couples heat, chemistry, and paranoia: melts attack crucibles; oxygen sneaks in at parts per billion and becomes precipitates; a single dislocation line can nucleate breakdown.\n\n"
            "Doping is dosage medicine for crystals — a few parts per million phosphorus shifts resistivity dramatically. Ion implantation shoots ions to controllable depths; annealing repairs lattice damage while activating dopants — thermal budgets fight each other.\n\n"
            "Wafers must be flatter than intuition allows so lithography later pretends the world is Euclidean. Without crystal discipline, solid-state devices remain germanium whisker curiosities; with it, fabs etch billions of identical features.\n\n"
            "Recovery means protecting not only pullers but the trace labs that prove purity — ignorance is measured in yield loss."
        ),
        "overview": (
            "Electronic-grade polysilicon comes from distilled chlorosilanes reduced on slim rods in bell jars. Czochralski pullers melt charge in quartz crucibles under inert gas, dip a seed crystal, neck to dislocate-out, shoulder to diameter, then pull slowly while rotating — freezing a single crystal behind the meniscus. Float-zone refining can further purify without crucible contact.\n\n"
            "Slicing with diamond wire saws, lapping, and chemical-mechanical polishing yields mirror wafers; RCA cleans strip organics and metals. Ion implanters accelerate dopant beams through photoresist masks; rapid thermal anneals activate without excessive diffusion spread.\n\n"
            "Epitaxial reactors grow thin doped films atop wafers for controlled junction stacks. Characterisation maps resistivity, lifetime, and defects — swirls in CZ crystals show as yield patterns later.\n\n"
            "Gettering strategies move metals to harmless regions so active devices never see them — crystal growth is also impurity traffic management."
        ),
        "buildSteps": [
            STEP(1, "Establish trace chemistry before touching expensive charge", "Measure metals in polysilicon feedstock at ppb sensitivity if possible; track chlorosilane mass balance in closed systems. Pyrophoric silane and chlorosilanes demand inerted plumbing and trained standby.", ["ICP-MS lab access if possible"], "Ventilation mistakes become explosions, not warnings"),
            STEP(2, "Charge melt, dip seed, and practise necking on scrap", "Watch diameter cameras; respond to power disturbances quickly — a freeze event loses the boule. Log crucible hours — dissolved oxygen rises with time.", ["CZ puller controls", "training operator"], "Power glitches during shoulder growth snap crystals"),
            STEP(3, "Slice, edge-round, and clean without recontaminating", "Round wafer edges to reduce chipping; clean with sequenced baths; dry without water spots. Particle counts belong in notebooks, not memories.", ["wire saw", "particle counter"], "PVC gloves shed chloride — use nitrile in clean steps"),
            STEP(4, "Plan implant and anneal as one recipe", "Simulate if you can; otherwise bracket energies in small coupons before full wafers. Measure sheet resistance after each anneal tweak.", ["four-point probe"], "Channeling during implant skews depth — tilt and twist wafers deliberately"),
            STEP(5, "Map lifetime and resistivity before shipping wafers", "Reject wafers with slip lines or swirl patterns beyond spec; file maps with boule IDs so fabs can correlate yield later.", ["lifetime mapper"], "Local Fe spots show donut patterns — trace handling"),
        ],
        "rawMaterials": {
            0: "Terrestrial chlorosilane distillation chains feeding Siemens reactors; off-world fabs likely import polysilicon nuggets until local chlor-alkali and hydrogen plants close the loop safely",
            1: "Diluted phosphine, diborane, and arsine in cylinders with scrubbed exhaust — treat cylinders like living creatures with valves pointed safe directions",
            2: "Synthetic fused quartz crucibles baked before first charge; monitor dissolved oxygen trends versus crucible age",
        },
    },
    "transistor": {
        "problem": (
            "Vacuum tubes gave the world amplification, but they also gave it heat, fragility, and maintenance marathons — a computer should not consume more power than its city block. The transistor promises the same controlled current modulation with a cold junction inside a crystal: no heated cathode, no glass envelope, paths toward micrometre scale if surfaces can be passivated and junction depths controlled.\n\n"
            "Bipolar devices inject carriers across a thin base; field-effect devices steer charge with an electric field through an oxide — each family trades speed, voltage tolerance, and fabrication complexity. The obstacle is cleanliness at atomic levels: a stray sodium ion in oxide shifts threshold voltage; a pinhole in passivation lets humidity drift parameters.\n\n"
            "Lithography scaled junctions from millimetres to nanometres, but the transistor’s cultural lesson predates fabs: small reliable switches compose universality — logic is geology built from sand if you can pattern dopants honestly.\n\n"
            "For recovery, protect not only crystal pullers but also the tacit craft of diffusion furnaces, implanter tuning, and wire-bond ergonomics."
        ),
        "overview": (
            "Planar silicon processing grows thermal oxide, patterns windows in photoresist, introduces dopants by diffusion or implant, metallises contacts, and passivates surfaces so junctions stay stable in humid air. CMOS pairs n-channel and p-channel MOSFETs so static power stays tiny except during switching — enabling chips with billions of gates.\n\n"
            "Packaging bonds aluminium or copper wires from die pads to lead frames, moulds epoxy, and trims legs before burn-in screens infant failures. Power discretes parallel thousands of cells; IGBTs merge MOS gates with bipolar conductivity for traction inverters.\n\n"
            "Characterisation — curve tracers, S-parameters, reliability ovens — translates physics into datasheets designers trust. Electromigration and hot-carrier wear appear as accelerated ageing curves.\n\n"
            "Discrete transistors remain teaching instruments: you can still see a TO-220 tab and imagine heat leaving the junction."
        ),
        "buildSteps": [
            STEP(1, "Start from wafers you can measure, not mystery bags", "Map resistivity and crystal orientation; clean with validated RCA or piranha sequences appropriate to your safety kit. Always know oxide thickness targets before dopant steps — they couple.", ["four-point probe", "ellipsometer if available"], "Skip cleaning once and weeks of work become archaeology"),
            STEP(2, "Pattern a test die of simple structures", "Include Van der Pauw sheets, ring oscillators, and long serpentines to catch shorts. Align photomasks under microscope before exposing whole wafers — misalignment shows as uniform leakage, maddeningly symmetric.", ["mask aligner", "microscope"], "Photoresist underbake causes scumming"),
            STEP(3, "Implant or diffuse, then anneal with documented ramps", "Record peak temperature and soak time on charts tied to wafer IDs. Measure junction depth indirectly via sheet resistance and CV if you lack SIMS.", ["furnace logs", "CV meter"], "Channeling skews profiles — tilt wafers per recipe"),
            STEP(4, "Metallise, bond, and package without smothering heat", "Choose wire gauge and loop height for inductance limits; attach heatsinks before power tests. Pull-test bonds on sacrificial units.", ["wire bonder", "pull tester"], "Epoxy outgassing corrodes bonds in hermetic failures"),
            STEP(5, "Screen parts and publish honest limits", "Burn-in at modest overstress catches early deaths; curve-trace safe operating area including temperature derating. A datasheet lie becomes a field fire — mark secondary breakdown regions clearly.", ["burn-in oven", "curve tracer"], "Never ship without thermal resistance numbers"),
        ],
        "rawMaterials": {
            0: "Czochralski silicon wafers from established suppliers; early off-world electronics imports packaged discretes until local crystal pullers and clean chemistry justify wafer fabs",
            1: "Arsine, phosphine, and diborane diluted for implant sources — exhaust abatement is non-negotiable",
            2: "Electronic-grade photoresists, developers, and HF-containing wet benches — neutralise wastes deliberately, not down the drain",
        },
    },
    "internet-protocols-and-web": {
        "problem": (
            "Circuit-switched telephony reserves a wire’s capacity whether you speak or not; data traffic is bursty — silence on a video call should not consume a dedicated copper pair across a continent. Packet networks chop information into self-describing chunks routers forward independently; TCP adds reliability and congestion control at the ends while IP provides best-effort delivery — a deliberately dumb network with smart edges.\n\n"
            "Humans still need names, not only numbers; documents, not only bytes; trust on hostile paths. The web stacks HTTP on TLS on DNS on BGP-routed IP — each layer introduces failure modes: poisoned caches, forged certificates, mixed content, and economies that monetise attention.\n\n"
            "Scaling demanded hierarchical addressing, content delivery networks, and databases that admit eventual consistency — latency engineering disguised as sociology because where you place a cache shapes who loads faster during crises.\n\n"
            "The political problem equals the technical: centralised platforms, censorship, and misinformation ride the same protocols that host scientific collaboration and disaster coordination — neutrality is a design stance, not a default law of nature."
        ),
        "overview": (
            "Hosts wrap segments in IP packets; routers longest-prefix-match destinations updated by interior and exterior routing protocols. Ethernet carries frames on LANs; MPLS labels speed carrier cores; VPNs tunnel across untrusted coffee-shop Wi-Fi. TCP’s congestion control backs off when loss signals overload; QUIC merges encryption with UDP-based transport for the web’s dominant flows.\n\n"
            "Browsers resolve names (often over encrypted DNS), negotiate TLS with certificate chains, then request objects with HTTP verbs and cache semantics. HTML structures documents; CSS styles; JavaScript executes client-side logic in sandboxes. CDNs cache static assets near users; origin servers remain authoritative.\n\n"
            "Parallel stacks run email (SMTP/IMAP), calendars, and voice — the internet is families of protocols, not only the web. Accessibility and internationalisation encode ethics as measurable constraints; archiving fights link rot because the web forgets by default.\n\n"
            "Operations teams live in dashboards of latency, error budgets, and certificate expiry — maintenance never ended when dial-up died."
        ),
        "buildSteps": [
            STEP(1, "Draw your site’s trust boundaries on one whiteboard", "List users, browsers, TLS terminators, application servers, databases, and admin laptops. Mark where secrets live and who may touch them. If the drawing looks hairy, simplify topology before buying hardware.", ["whiteboard", "markers"], "Mixed HTTP/HTTPS pages leak cookies — draw redirects explicitly"),
            STEP(2, "Register names and certificates before you depend on them", "Automate renewal with alerts to humans; document who owns registrar accounts. Publish CAA records to limit which CAs may issue for your domain.", ["DNS hosting", "ACME client"], "Expired certificates become public outages with countdown timers"),
            STEP(3, "Serve a minimal working site over TLS first", "Static HTML proves DNS, TLS, and CDN paths. Add application complexity only after observability exists — logs, metrics, traces — so regressions surface as graphs, not angry emails.", ["web server", "log aggregation"], "Premature microservices multiply failure modes"),
            STEP(4, "Threat-model realistic adversaries", "Ask what a bored teenager, a thief with a stolen laptop, and a nation-state each gain from attacking you — implement TLS, secure headers, dependency updates, and backups proportional to actual assets.", ["security checklist"], "Backups nobody tests are decorative"),
            STEP(5, "Measure performance and accessibility with budgets", "Pick Largest Contentful Paint and interaction targets; run keyboard-only navigation tests; add alt text as part of review, not as an afterthought. Archive outbound links to reputable mirrors where licensing allows.", ["Lighthouse or similar", "axe DevTools"], "Third-party widgets veto your performance budget"),
        ],
        "rawMaterials": {
            0: "Merchant silicon switching ASICs for routers; until fabs exist off-world, ship ruggedised routers and treat them as critical spares with configuration backups",
            1: "ECC DRAM and server CPUs from established supply chains; ARM servers trade software compatibility for power if your stack permits",
            2: "Enterprise SSDs with power-loss protection for databases; cold tape or object storage for archives where latency tolerates hours",
        },
    },
}
