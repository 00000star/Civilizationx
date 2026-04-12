# Narrative rewrites for batch-2 technologies (problem, overview, buildSteps, optional rawMaterials spaceAlternatives by index).
# Applied by apply_batch2_narrative_rewrites.py

STEP = lambda order, title, description, tools, warn: {
    "order": order,
    "title": title,
    "description": description,
    "prerequisiteTools": tools if isinstance(tools, list) else [tools],
    "warningNote": warn,
}

NARRATIVE = {
    "electric-lighting-systems": {
        "problem": (
            "Gaslight and open flame solved night, but they blackened ceilings, demanded constant tending, and turned crowded cities into tinderboxes. "
            "Electric lighting promised something stranger: brightness without a flame in the room, instant on-and-off, and the possibility of scaling light "
            "the way factories scale thread — by standard parts and measured voltages.\n\n"
            "The catch is that a lamp is not only a bulb. It is a branch circuit, a breaker, a transformer tap, and a human habit of never thinking about "
            "what happens when insulation ages in a wall cavity. Early systems fought efficiency and lifetime: incandescent filaments trade most watts as heat; "
            "arc lamps roared; discharge tubes needed something to limit current so they did not run away.\n\n"
            "Spectral quality is not vanity. A weaver distinguishing thread colours, a surgeon tracing vessels, and a reader avoiding eyestrain are solving "
            "different physics problems with the same wall switch. Metrics moved from candlepower to lumens, then to colour temperature and rendering indices — "
            "each step an admission that human eyes are part of the circuit.\n\n"
            "For recovery, lighting is often the first friendly face of electrification: people forgive a wobbly frequency if the room feels safe. It is also "
            "where amateur wiring kills — respect the difference between a demonstration and an installation."
        ),
        "overview": (
            "An incandescent lamp pushes current through a thin refractory filament in vacuum or inert gas until the wire glows. Tungsten won over carbon "
            "because it survives higher temperature before evaporating; halogen chemistry catches some evaporated metal and returns it to the filament, "
            "stretching life in compact envelopes.\n\n"
            "Fluorescent and high-intensity discharge lamps drive current through a gas; phosphors convert ultraviolet to white we recognise indoors. Those "
            "plasmas want a controlled current, not a fixed voltage — historically an iron-core ballast, today often a small switched-mode supply that runs the "
            "tube at high frequency so we stop hearing the old buzz.\n\n"
            "Light-emitting diodes are chips that emit narrow bands of colour; phosphor coatings or mixed dies build white. Their brightness tracks current "
            "closely while voltage stays awkwardly sharp — drivers therefore regulate current and protect against thermal runaway. Good fixtures treat the LED "
            "module as a heat source first and a light source second.\n\n"
            "At building scale, lighting design is secretly distribution engineering: voltage drop, inrush on banks of HID lamps, harmonic currents from cheap "
            "dimmers, and surge protection on outdoor strings. Controls — clocks, photocells, occupancy sensors — now join cybersecurity as lights become "
            "networked nodes."
        ),
        "buildSteps": [
            STEP(1, "Decide how much light you need where", "Walk the space at night with a temporary lamp and a notebook. For each task area, write what someone must see clearly (reading, cooking, machine inspection). Use simple rules of thumb if you lack photometric software: start with modest power, add more only where shadows block work. Mark switches so a stranger knows what each controls.", "notebook", "Over-bright glare wastes power and hides contrast — especially on polished metal"),
            STEP(2, "Size wires for current and length, not for hope", "From each circuit’s lamp count and type, estimate steady current and any starting surge. Look up ampacity for your cable type and installation (open air versus insulation in a wall). If a run is long, calculate voltage drop; undervoltage kills some electronic drivers slowly while they still ‘work’.", ["ampacity table", "calculator", "tape measure"], "Undersized neutrals in three-phase setups can overheat while phase currents look normal"),
            STEP(3, "Install protection and earthing like a civic duty", "Place breakers or fuses so a fault in one branch cannot silence an entire hospital wing. In wet rooms, use residual-current protection where codes require it. Bond metal parts that could become energised so a fault trips protection instead of waiting for a human to complete the path to earth.", ["earth tester", "insulation tester"], "Never assume paint or rust counts as a reliable earth bond"),
            STEP(4, "Commission drivers and dimmers together", "If you dim LEDs, verify the dimmer model matches the driver’s method (trailing-edge, 0–10 V, DALI). Listen for buzz; watch a phone camera for rolling-band flicker that eyes miss. Log driver temperatures at full output for an hour — a hot driver in a sealed ceiling is a delayed fire.", ["infrared thermometer", "oscilloscope if available"], "Mixed-content upgrades can leave old incandescent dimmers on incompatible loads"),
            STEP(5, "Keep maintenance records like a ship’s log", "Note relamp dates, cleaning of optics, and any colour shift. For streets and factories, dirt depreciation dominates — a cleaned reflector can double useful light without new watts. Store spare modules where humidity and rodents cannot ruin them.", "notebook", "LED batches fail in clusters — keep modest spares of the same lot if possible"),
        ],
        "rawMaterials": {
            0: "Tungsten remains ideal for incandescent filaments where simple supplies beat complexity; in spacecraft and stations, LED lighting dominates because waste heat must be routed to radiators — keep tungsten as precision instrument filaments and specialty halogen work lights",
            1: "Borosilicate envelopes from terrestrial float lines; sapphire windows for harsh LED packages; sealed metal-ceramic heads where glass vibration risk matters",
            2: "Terrestrial rare-earth separation for narrow-band phosphors; early recovery may blend broader-spectrum phosphors with slightly lower efficacy, or use indium gallium nitride blue pumps with mature phosphor recipes traded as packaged powders",
        },
    },
    "copper-wire-and-cable": {
        "problem": (
            "Electricity without conductors is a lecture-demonstration, not a civilisation. You can see sparks jump across a gap, but you cannot power a mill "
            "or carry a telegram miles through rain unless metal behaves predictably: low resistance, enough ductility to bend around corners, and joints that "
            "stay tight after a thousand heat cycles.\n\n"
            "Copper won for most power and signal roles because it solders and welds forgivingly, work-hardens in ways wire drawers understand, and can be "
            "refined electrolytically until grain boundaries stop stealing electrons. The obstacle is geometry: a solid bar is too stiff to wind into a motor; "
            "wire must be drawn through dies in stages, annealed between passes, then stranded so cords survive flexing without snapping single crystals.\n\n"
            "Insulation is half the product. Bare copper touching steel creates faults; cloth and rubber age; modern polymers survive temperature classes inside "
            "machines. Each jacket is a compatibility puzzle with semiconducting layers in high-voltage cables to keep electric fields smooth — voids invite "
            "partial discharge that eats insulation from within.\n\n"
            "Without agreed gauges and termination discipline, lugs loosen thermally, fires start at connections, and maintenance becomes guesswork. Wire is "
            "therefore standards and craft together — not merely metal shopping."
        ),
        "overview": (
            "Cathode copper is melted and cast into rod, then reduced through tungsten-carbide or diamond dies. Each pass shrinks diameter while lengthening "
            "the wire; intermediate annealing in a controlled atmosphere restores softness so the next pass does not tear. Multiple strands are twisted into "
            "rope-lay bundles so flexing shares fatigue among many small wires.\n\n"
            "Insulation systems stack functions: dielectric strength, moisture barrier, flame retardance, sunlight resistance on poles. Oil-impregnated paper "
            "still appears in some high-voltage land cables; cross-linked polyethylene dominates modern distribution because it tolerates thermal class and "
            "wet environments if manufacturing avoids voids.\n\n"
            "Jointing matters as much as drawing. Compression lugs, exothermic welds for earth grids, and torque schedules for aluminium teach the same "
            "lesson: contact resistance is a device you did not intend to build. Oxidation at aluminium terminals pushed industry toward antioxidant compounds "
            "and disciplined tightening — a reminder that chemistry lives at every screw.\n\n"
            "Magnet wire for motors adds enamel films in multiple bakes, cured to survive varnish ovens without pinholes — invisible insulation is the "
            "difference between a quiet machine and a turn-to-turn short."
        ),
        "buildSteps": [
            STEP(1, "Start from the cleanest copper you can obtain", "If you are not yet running a refinery, begin with known-grade cathode or reclaimed busbar, stripped of solder and insulation in a ventilated space. Sort alloys — brass and bronze are not substitutes for electrical copper. Weigh and label batches so you can correlate breaks with sources.", ["furnace or local melter access", "labels"], "Burning PVC insulation releases hydrochloric acid gas — strip mechanically when possible"),
            STEP(2, "Reduce diameter in patient steps", "Each draw through a die should remove modest cross-section so the wire lengthens without tearing or overheating. If the wire sings or smells hot, stop — add lubricant, check die wear, or anneal sooner. Measure diameter with micrometers after passes until you trust your machine’s indexing.", ["series of dies", "micrometers", "drawing lubricant"], "Hot short tears from greedy reduction waste long lengths"),
            STEP(3, "Anneal when the metal gets stubborn", "Hold at a temperature-time recipe that recrystallises the copper without growing grains so large the next draw orange-peels. Protect bright wire from oxidation if appearance matters; for magnet wire, oxidation before enamel is failure.", ["temperature control", "pyrometer or experience"], "Over-annealing softens excessively — the next die snaps the strand"),
            STEP(4, "Strand, lay, and jacket with the end use in mind", "Choose lay length for flexibility versus outer diameter. When extruding insulation, centre the conductor in the cross-head, control melt temperature to avoid scorch, and run spark testing on the line to catch pinholes before drums ship.", ["extrusion line or hand jacketing", "spark tester if HV"], "Wet polymer pellets cause steam voids — predry feedstock"),
            STEP(5, "Test and tag so the next person trusts your drum", "Measure DC resistance per length at known temperature; hi-pot jackets where standards demand. Print gauge, temperature class, and date. File a sample under the batch number — when a fault appears years later, you will want evidence whether it was manufacturing or abuse.", ["Kelvin bridge or good ohmmeter", "labels"], "Mis-labelled ampacity causes fires long after the seller is gone"),
        ],
        "rawMaterials": {
            0: "Electrolytic cathode from porphyry or sediment-hosted mines; in early off-world camps recycle busbar and cable ends before expecting new sulphide flotation — meteoritic iron is a poor conductor for power distribution",
            1: "XLPE or PVC from petrochemical chains; until extruders exist, use ceramic standoffs and air as dielectric for short bus runs inside equipment",
            2: "Synthetic ester or soap-based drawing soaps; historically tallow mixtures — filter aggressively so grit never scores dies or embeds in copper",
        },
    },
    "electrical-transformer": {
        "problem": (
            "Imagine trying to push a city’s worth of power through wires sized for a neighbourhood: the copper would melt long before the lights came on, or you would need cables too thick to hang from poles. The opposite problem waits inside a house — nobody wants a toaster wired for lightning-strike voltages. Alternating current has one magical property: a changing magnetic field can push energy from one coil to another through an iron bridge, without the coils touching. A transformer is that bridge: it trades voltage for current (almost) freely, so power can travel far at high voltage and arrive safe at low voltage.\n\n"
            "Building one is not merely wrapping wire around a nail. The iron core must change its magnetisation sixty times a second without heating itself to uselessness; laminations interrupt eddy currents the way a dam interrupts a river. The windings must survive enormous magnetic forces during faults — short circuits try to crush coils together like hands clapping. Oil or resin must keep conductors cool and free of bubbles, because a bubble is a void where voltage concentrates until something arcs.\n\n"
            "Large grid transformers are also slow political objects: they weigh as much as a house, take months to wind and impregnate, and cannot be improvised from scrap in a weekend. After a disaster, spare transformers are as precious as generators. The design discipline — drying paper, pulling vacuum, testing insulation — is what separates a quiet substation from a fireball.\n\n"
            "Direct current cannot use this trick without rotating machinery or semiconductors. That historical fact shaped entire cities: where you can transform AC cheaply, you build one kind of grid; where you cannot, you build another."
        ),
        "overview": (
            "At its heart, a transformer is two coils wrapped so they share magnetic flux inside a core of silicon steel. When AC flows in the primary, flux rises and falls; that changing flux induces a voltage in the secondary proportional to the ratio of turns. More turns on the secondary than the primary raises voltage and lowers current for the same power (minus small losses from resistance and core heating).\n\n"
            "Utility units are often filled with mineral or ester oil that both insulates and carries heat to radiators. Bushings — thick, graded insulators — bring conductors out through the grounded steel tank without letting flashover creep along surfaces. Tap changers nudge the turns ratio while the unit is live, correcting for voltage sag on long feeders the way a violinist tunes between movements.\n\n"
            "Testing a finished transformer is part craft, part mathematics: an open-circuit test maps core loss; a short-circuit test maps copper loss and impedance. Protection engineers care about those numbers because they set how much fault current will flow and how fast relays must decide. Inrush currents when first energising can look like faults — operators learn to read harmonic signatures so breakers do not trip uselessly.\n\n"
            "Dry-type transformers trade oil for cast resin in buildings and tunnels; they are noisier in thermal terms but safer around people who fear spills. At every scale, the same lesson repeats: keep the insulation dry, keep the core tight, and never treat a hum as merely ambience — it is the sound of magnetostriction reporting that the grid still breathes."
        ),
        "buildSteps": [
            STEP(1, "Decide your voltages, power, and whether you need taps", "Write on paper what AC frequency you have, the RMS voltage coming in, the voltage you want going out, and the maximum power in kilovolt-amperes (not necessarily kilowatts — power factor matters). Sketch which winding will sit nearer the core (usually the lower voltage for insulation reasons). If your load varies — long rural lines, for example — plan a simple tap scheme so you can reconnect a few turns later without rewinding everything.", ["notebook", "calculator", "AC voltmeter"], "Never work on windings while anything upstream can energise them — lock out breakers and verify dead with a meter"),
            STEP(2, "Build or buy a laminated core and clean every surface", "Stack silicon-steel laminations in the prescribed overlap pattern so joints do not line up into a low-resistance magnetic short. Deburr edges; burrs pierce inter-lamination insulation and create hot spots. Clamp the core gently but evenly — a twisted core makes noise and losses. If you are reusing an old core, sand rust only where needed; do not remove the factory’s oxide coating blindly.", ["deburring tool", "micrometer", "clean lint-free rags"], "Silicon steel is sharp — cut gloves easily"),
            STEP(3, "Wind the coils with even tension and generous radii at corners", "Whether you hand-wind magnet wire or lay rectangular conductors, keep tension steady so turns do not loosen when oil flows later. Add layer insulation where the design calls for it; slide cooling ducts in larger conductors so heat can escape the middle of a bundle. Label starts and finishes with tags you cannot smudge — polarity mistakes explode semiconductors downstream.", ["wire tensioner or gloved hands", "insulation paper", "tags"], "A single sharp edge under paper can puncture it under short-circuit forces"),
            STEP(4, "Assemble core and coils, then dry and impregnate if using oil", "Slide windings onto the core legs without nicking insulation. Tie windings to spacers so they cannot shift. Heat the assembly gently while pulling vacuum to drive moisture from paper; then let oil (or resin) fill the voids under vacuum if your design requires impregnation. Hold a breakdown test on a sample of oil before fill.", ["oven or heated space", "vacuum pump", "oil test kit if available"], "Hot oil vapour is flammable — ventilate and forbid sparks"),
            STEP(5, "Close the tank, fill conservatively, and measure before connecting load", "Pressure-test the tank for leaks with dry air if specifications demand it. Install bushings using the torque pattern the manufacturer specifies. Energise first at no load: listen, smell, and measure magnetising current. Only then connect load through appropriate protection. Log temperatures and sounds for the first days — a rising oil temperature curve that never flattens means blocked cooling or circulating currents.", ["wrench set", "torque wrench", "clamp meter", "infrared thermometer"], "Energised bushings can look harmless — stay beyond strike distance until a qualified person confirms clearance"),
        ],
        "rawMaterials": {
            0: "Ship grain-oriented lamination kits from surviving terrestrial mills, or run motors at lower flux density with thicker cores of ordinary silicon steel until cold-rolling can be rebuilt; small lunar or Martian bases may prioritise dry-type cast-resin transformers to avoid flammable oil",
            1: "Aramid paper (Nomex) classes in dry-type transformers where cellulose is scarce; hybrid insulation using ceramic-fibre wraps for prototype units at reduced voltage stress",
            2: "Synthetic ester fluids from bio-derived alcohols for lower flammability than mineral oil; in sealed habitats, SF6-free designs favour solid/epoxy insulation over pressurised gas",
        },
    },
    "electrical-power-grid": {
        "problem": (
            "A single dynamo behind a wool mill is a self-contained story: the owner lights his shed and perhaps a neighbour’s lane. A city is not self-contained — factories, trams, hospitals, and pumps want power at the same instant, often far from where coal is burned or water falls. Moving that energy as electricity beats hauling fuel to every doorstep, but only if you can move it without melting conductors and only if every generator agrees on the rhythm of the alternating current.\n\n"
            "That rhythm — the system frequency — is a shared clock. If one generator races slightly ahead and another lags, enormous currents try to flow between them through the network itself. Small imbalances are corrected every second by governors and dispatchers; large ones can split regions apart or black out millions. Weather ignores schedules: wind throws branches across lines, ice loads snap conductors, lightning ionises air into a momentary short.\n\n"
            "Protection is therefore as much a social agreement as a technical device: breakers must isolate a faulted line fast enough to save equipment, but not so greedily that a squirrel in one suburb darkens a province. Relay settings, fuse sizes, and earthing practices are negotiated standards — not natural laws — and they differ by country while obeying the same physics.\n\n"
            "The grid is also market infrastructure: someone must be paid to spin spare capacity; someone must decide whether a rural valley gets a line at all. Rebuilding after collapse means rebuilding those agreements, not only stringing copper."
        ),
        "overview": (
            "At the largest scale, power plants spin alternators that output three-phase voltages — three sine waves staggered in time so motors turn smoothly and transmission can use less metal than single-phase for the same power. Step-up transformers raise voltage for the long haul across steel towers; step-down transformers in substations peel voltage layers like an onion until neighbourhood lines are safe with reasonable insulation.\n\n"
            "Conductors are often aluminium with a steel core for strength, hung from glass or polymer insulators that keep lightning and switching surges from jumping to the tower. Reactive devices — capacitors and inductors — manage the imaginary part of power flow so voltage does not sag at the end of long lines. Underground cables trade lightning immunity for cost and heat.\n\n"
            "Control rooms watch schematic diagrams light up with colours: breakers open and close; transformers tap; capacitor banks switch. Automatic schemes re-route around damage when possible. Wind and solar inverters sometimes lack the spinning mass that once buffered frequency; engineers add batteries, synthetic inertia controls, or faster markets to keep stability.\n\n"
            "To a beginner, the grid looks like spaghetti; to an operator, it is a set of zones with boundaries you may not cross without synchronising angle and voltage. Closing a tie only when both sides match is as important as any cable gauge."
        ),
        "buildSteps": [
            STEP(1, "Draw your network on paper before you buy metal", "Mark every planned generator, major load, and junction. For each line, write its length, the power you hope to carry, and the nominal voltage. Identify a single reference frequency (50 or 60 Hz) and stick to it everywhere. This sketch becomes the checklist when someone later proposes a shortcut — if it is not on the map, it is not in the protection study.", ["large paper or chalkboard", "ruler", "coloured pencils"], "Mixing frequencies without converters is not a small mistake — it is a new class of accident"),
            STEP(2, "Size conductors for thermal limit, not for hope", "For each segment, estimate maximum current including motor starting surges. Look up ampacity tables for your conductor type (ACSR, copper, underground bundle) and ambient temperature. Add margin for future load. Record ice and wind assumptions if you use overhead lines — a line that clears a tree in summer can touch in winter.", ["ampacity charts or engineering handbook", "notebook"], "Undersized neutrals in three-phase systems overheat quietly while phases look fine"),
            STEP(3, "Install grounding so faults have somewhere safe to go", "Drive or bury a grounding grid at substations and major poles. Connect neutrals according to your regional practice (TN, TT, IT). Measure earth resistance after installation — wet season and dry season if possible. Teach everyone which conductors are never safe to cut, even when ‘the power is off’, because induction from parallel lines can still bite.", ["earth tester", "heavy copper strap", "exothermic or compression connectors"], "Shared earth and neutral mistakes can energise plumbing — verify with a qualified person"),
            STEP(4, "Commission protection before you invite customers", "For each breaker, write a one-page story: what it protects, what current should trip it, and how fast. Secondary-inject relays with known currents and voltages; verify trip times against curves. Label settings with dates and initials. Stage a controlled fault test only where regulations allow — otherwise use primary injection at reduced risk locations.", ["relay test set or primary injection kit", "stopwatch", "labels"], "Mis-polarised current transformers can disable protection while meters still read"),
            STEP(5, "Energise in stages and rehearse black-start roles", "Start radially: one source, one feeder, a few loads. Measure voltage at the far end under load. Only then close rings or parallel ties after synchronising — match voltage, frequency, and phase sequence with lamps or a synchroscope. Document who is allowed to close which breaker. Rehearse what happens if a line trips: who calls whom, in what order.", ["synchroscope or lamp board", "radios", "written switching order"], "Closing out-of-phase ties can weld breaker contacts and throw shrapnel"),
        ],
        "rawMaterials": {
            0: "Use copper stranding where launch mass dominates losses; aluminium-steel overhead equivalents for surface grids; tethered lunar grids may prefer aluminium buswork in vacuum with ceramic standoffs to avoid oxidation",
            1: "Amorphous-metal or lower-flux-density cores until grain-oriented rolling returns; trade efficiency for mass in early off-world microgrids",
            2: "Dry-type cast-resin switchgear where oil is unacceptable; synthetic ester fluids where oil cooling is still desired",
        },
    },
    "electric-motor": {
        "problem": (
            "Before electricity, motive power in a workshop meant leather belts snaking from a ceiling shaft, or a small steam engine hissing beside each heavy machine. Belts slip, alignments drift, and every new tool demands another hole in the ceiling. An electric motor replaces that tangle with a compact drum of copper and iron that pulls power through a wire — the fire stays at the power station while the work happens where it is needed.\n\n"
            "Motors are not magic rotation boxes; they are heat machines that happen to spin. Current in the windings meets resistance; iron reverses magnetisation sixty times a second; bearings rub. Neglect cooling and the insulation class becomes a countdown. Start a large motor on a weak line and the whole village’s lights dip — inrush currents can be many times running current until the rotor catches up with the magnetic field.\n\n"
            "Variable speed was historically expensive: rheostats turned excess energy into smoke. Modern drives synthesise new frequencies electronically, but introduce harmonics that can pit bearing races through tiny capacitive currents. The motor problem is therefore electrical, mechanical, and thermal at once.\n\n"
            "For civilisation recovery, motors are precious because they couple precision metallurgy (laminations), chemistry (varnish and enamel), and craft (winding) into one dependable worker that never sleeps."
        ),
        "overview": (
            "Most industrial motors you meet are induction machines: the stator’s three-phase windings create a magnetic field that appears to rotate around the rotor. Conductors in the rotor — often aluminium bars cast into a steel stack — see that motion as a changing field and develop currents of their own. Those currents create their own field that tries to catch the stator’s field, producing torque. The rotor must slip slightly behind synchronous speed; at perfect synchronism induction would stop and torque would vanish.\n\n"
            "Laminated silicon steel in the stator guides flux while limiting eddy currents. Slots hold insulated copper or aluminium conductors; the slot shape trades ease of manufacture against stray loss. The frame and fan path move heat from windings to air; larger machines may use water jackets or external blowers.\n\n"
            "Synchronous motors lock to grid frequency once running; they can also behave as generators. DC motors still appear where fine torque control predates cheap electronics — brushes wear but the physics is transparent. Universal motors in power tools accept AC or DC at the cost of sparking brushes and shorter life.\n\n"
            "Nameplate letters and efficiency bands encode starting behaviour: some rotor designs prioritise high starting torque for compressors; others prioritise low inrush for weak grids. Reading the nameplate is as important as reading a steam plate’s pressure rating."
        ),
        "buildSteps": [
            STEP(1, "Choose the motor type to match your supply and job", "If you have stable three-phase AC, a squirrel-cage induction motor is the default workhorse. If you only have single-phase domestic supply, look for split-phase or capacitor-start designs — understand that starting capacitors are not interchangeable decoration. If you need speed control, plan for a variable-frequency drive and shielded cable suitable for fast switching edges.", ["multimeter", "motor nameplate or datasheet"], "A motor rated for delta on 400 V will misbehave if you star-connect it without reading the plate"),
            STEP(2, "Stack laminations and insert slot liners without burrs", "Interleave stator laminations and weld or cleat the back iron per your design. Slide slot liners in so conductors never touch steel directly. Deburr every lamination tooth — a burr is a short waiting to happen. Blow out grit before windings enter; grit abrades enamel during vibration.", ["compressed air or brush", "slot liners", "deburring tool"], "Steel edges after punching are razor sharp"),
            STEP(3, "Wind or insert coils, then varnish or vacuum-pressure impregnate", "Maintain even tension while winding magnet wire, or press pre-formed coils into slots if using form-wound construction. Tie coils at the end turns so magnetic forces cannot move them. After winding, varnish dip or VPI fills voids so moisture cannot creep along strands.", ["winding jig", "varnish or epoxy", "oven"], "Solvent vapours are flammable — ventilate and kill ignition sources"),
            STEP(4, "Assemble rotor, balance, and align to the driven machine", "For fabricated rotors, verify cage integrity and skew. Machine the outside diameter if casting left ovality. Balance dynamically to the ISO grade appropriate for speed — an unbalanced rotor walks bearings out in weeks. Bolt the motor to a flat base; check soft foot with feeler gauges under each foot while tightening in a cross pattern. Align coupling to load within a few hundredths of a millimetre; repeat hot if thermal growth matters.", ["dynamic balancer if available", "dial indicators", "shims", "torque wrench"], "Coupling guard removed for alignment must be replaced before first spin"),
            STEP(5, "Megger, spin no-load, then load-test thermally", "Measure insulation resistance phase-to-phase and phase-to-ground with a megohmmeter at a voltage appropriate to the machine class. Spin at no load listening for rubs; measure current — wildly high no-load current means shorted turns or wrong connections. Apply load gradually; watch bearing temperature rise for an hour; capture vibration if you have a phone app or accelerometer. Document baseline numbers for the next maintainer.", ["megohmmeter", "clamp meter", "infrared thermometer", "notebook"], "Shafts and fan blades remain dangerous above idle speed — guard before energising"),
        ],
        "rawMaterials": {
            0: "Ferrite or powdered-iron cores at high frequency for small actuators; lower-flux-density silicon stacks where grain-oriented sheet is unavailable; import lamination stacks from surviving terrestrial mills until local rolling lines return",
            1: "Silver-plated copper in cryogenic motors; aluminium magnet wire in large machines where slot fill and cost dominate",
            2: "Copper cage bars for higher efficiency when aluminium casting equipment is missing; hand-fabricated copper rings for repair of legacy rotors",
        },
    },
    "boiler-feedwater-treatment": {
        "rawMaterials": {
            0: "Ship sealed ion-exchange cartridges from surviving chemical distributors, or run zeolite or greensand softeners with documented regeneration cycles until local resin synthesis and brine handling return",
            1: "Industrial sulphite, phosphate, and amine programmes where suppliers exist; interim programmes may use more blowdown and simpler oxygen scavengers if advanced amines are unavailable",
            2: "Surface water, wells, or aggressive condensate return — pair with filtration and UV or chlorination only where compatible with downstream chemistry",
        },
    },
}
