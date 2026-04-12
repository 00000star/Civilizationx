import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCodexMode } from "../context/useCodexMode";

type PhaseItem = { id: string; label: string; href?: string };

const EARTH_P1: PhaseItem[] = [
  { id: "p1-shelter", label: "Find or make immediate shelter from weather", href: "/tech/shelter-construction-basic" },
  { id: "p1-water", label: "Locate a water source within 1 km", href: "/tech/sanitation-and-clean-water" },
  { id: "p1-notreat", label: "Do not drink untreated water under any circumstances" },
  { id: "p1-fire", label: "Make fire for warmth and water purification", href: "/tech/fire" },
  { id: "p1-injury", label: "Treat any injuries immediately — infection kills fast", href: "/tech/first-aid-and-wound-care" },
  { id: "p1-night", label: "Do not travel at night in unfamiliar terrain" },
  { id: "p1-signal", label: "Signal your location if rescue is possible" },
  { id: "p1-group", label: "Assess who is with you and their condition" },
  { id: "p1-inventory", label: "Inventory everything you have" },
  { id: "p1-panic", label: "Do not panic — slow methodical decisions save lives" },
];

const EARTH_P2: PhaseItem[] = [
  { id: "p2-purify", label: "Establish a reliable water purification method", href: "/tech/sanitation-and-clean-water" },
  { id: "p2-food", label: "Create food stores for 30 days minimum", href: "/tech/food-preservation" },
  { id: "p2-shelter", label: "Build a weatherproof semi-permanent shelter", href: "/tech/shelter-construction-basic" },
  { id: "p2-san", label: "Establish sanitation — human waste away from water", href: "/tech/sanitation-and-clean-water" },
  { id: "p2-plants", label: "Identify edible plants in your immediate area" },
  { id: "p2-traps", label: "Set traps for small animals", href: "/tech/fishing-net-and-line" },
  { id: "p2-others", label: "Find others — groups survive, individuals often do not" },
  { id: "p2-watch", label: "Establish watches and basic security" },
  { id: "p2-write", label: "Document your knowledge — write things down", href: "/tech/writing-early-systems" },
  { id: "p2-map", label: "Begin mapping your immediate area (2 km radius)" },
];

const EARTH_P3: PhaseItem[] = [
  { id: "p3-farm", label: "Begin agriculture — even a small plot matters", href: "/tech/soil-science-and-composting" },
  { id: "p3-tools", label: "Establish a tool-making capability", href: "/tech/stone-knapping" },
  { id: "p3-mat", label: "Build knowledge of your local materials" },
  { id: "p3-trade", label: "Establish trade or cooperation with other groups" },
  { id: "p3-teach", label: "Begin teaching what you know to others" },
  { id: "p3-tier", label: "Start working toward the next Codex technology tier", href: "/" },
  { id: "p3-winter", label: "Plan for winter if applicable to your climate" },
];

const SPACE_P1: PhaseItem[] = [
  { id: "s1-seals", label: "Verify habitat integrity — check all seals" },
  { id: "s1-eclss", label: "Confirm life support: O₂, CO₂ scrubbing, pressure" },
  { id: "s1-crew", label: "Account for all crew members" },
  { id: "s1-power", label: "Check power systems and battery reserves", href: "/tech/solar-photovoltaic-power-systems" },
  { id: "s1-comms", label: "Establish communication window with Earth or base", href: "/tech/radio-broadcast-and-receiver" },
  { id: "s1-suit", label: "Do not exit habitat without full suit check" },
  { id: "s1-inv", label: "Inventory all consumables — food, water, O₂" },
  { id: "s1-med", label: "Check medical status of all crew", href: "/tech/first-aid-and-wound-care" },
];

const SPACE_P2: PhaseItem[] = [
  { id: "s2-water", label: "Begin in-situ water extraction from ice deposits", href: "/tech/sanitation-and-clean-water" },
  { id: "s2-solar", label: "Establish solar power generation", href: "/tech/solar-photovoltaic-power-systems" },
  { id: "s2-reg", label: "Begin regolith analysis for construction materials" },
  { id: "s2-hydro", label: "Establish hydroponic food production", href: "/tech/soil-science-and-composting" },
  { id: "s2-atm", label: "Test local atmosphere processing" },
  { id: "s2-print", label: "Begin 3D printing replacement components" },
  { id: "s2-redcom", label: "Establish redundant communication systems", href: "/tech/communication-satellites" },
];

const SPACE_P3: PhaseItem[] = [
  { id: "s3-expand", label: "Begin habitat expansion using local materials" },
  { id: "s3-fuel", label: "Establish fuel production (Sabatier reaction)", href: "/tech/high-capacity-electrochemical-batteries" },
  { id: "s3-survey", label: "Begin scientific survey of immediate area" },
  { id: "s3-mfg", label: "Establish manufacturing capability", href: "/tech/basic-hand-tools" },
  { id: "s3-doc", label: "Document all local resource discoveries", href: "/tech/writing-early-systems" },
  { id: "s3-train", label: "Begin training all crew on all critical systems" },
];

const CRITICAL = [
  { emoji: "🔥", title: "Fire", text: "Master this first. Everything else depends on it.", href: "/tech/fire" },
  { emoji: "💧", title: "Water", text: "Untreated water kills within days. Purify everything.", href: "/tech/sanitation-and-clean-water" },
  { emoji: "🌱", title: "Food", text: "You have weeks without food. Use that time wisely.", href: "/tech/cooking" },
  { emoji: "🏠", title: "Shelter", text: "Exposure kills faster than starvation.", href: "/tech/shelter-construction-basic" },
  { emoji: "🔧", title: "Tools", text: "Stone tools can be made anywhere. Start here.", href: "/tech/stone-knapping" },
  { emoji: "⚕️", title: "Wounds", text: "Clean wounds immediately. Infection is the silent killer.", href: "/tech/first-aid-and-wound-care" },
];

function storageKey(mode: "earth" | "space", phase: string): string {
  return `codex-survive-checks:${mode}:${phase}`;
}

function loadChecks(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveChecks(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function PhaseCard({
  title,
  subtitle,
  items,
  storagePrefix,
  mode,
  borderClass,
}: {
  title: string;
  subtitle: string;
  items: PhaseItem[];
  storagePrefix: string;
  mode: "earth" | "space";
  borderClass: string;
}) {
  const key = storageKey(mode, storagePrefix);
  const [checked, setChecked] = useState<Set<string>>(() => loadChecks(key));

  useEffect(() => {
    setChecked(loadChecks(key));
  }, [key]);

  const toggle = useCallback(
    (id: string) => {
      setChecked((prev) => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        saveChecks(key, n);
        return n;
      });
    },
    [key]
  );

  return (
    <section
      className={`rounded-lg border-2 ${borderClass} bg-codex-card p-4 shadow-lg md:p-6`}
    >
      <h2 className="font-display text-xl font-bold text-codex-text md:text-2xl">{title}</h2>
      <p className="mt-1 text-sm font-medium text-codex-secondary">{subtitle}</p>
      <ul className="mt-4 space-y-2">
        {items.map((it) => {
          const id = `${storagePrefix}-${it.id}`;
          const isChecked = checked.has(id);
          const inner = (
            <span className="flex min-h-[44px] flex-1 items-center gap-3 py-1">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(id)}
                className="h-5 w-5 shrink-0 accent-amber-500"
                aria-label={it.label}
              />
              <span className={`text-sm leading-snug ${isChecked ? "text-codex-muted line-through" : "text-codex-text"}`}>
                {it.href ? (
                  <Link to={it.href} className="text-codex-blue underline hover:text-codex-gold" onClick={(e) => e.stopPropagation()}>
                    {it.label}
                  </Link>
                ) : (
                  it.label
                )}
              </span>
            </span>
          );
          return (
            <li key={it.id} className="flex items-start rounded border border-codex-border/60 bg-codex-surface/50 px-2">
              <label className="flex flex-1 cursor-pointer items-start py-1">{inner}</label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SurvivePage() {
  const { isSpace } = useCodexMode();

  const hero = useMemo(
    () =>
      isSpace
        ? {
            title: "You have landed. Now what?",
            subtitle:
              "First 90 days on Mars or a space colony. Procedures assume a pressurised habitat and trained crew — adapt to your vehicle and environment.",
          }
        : {
            title: "You survived. Now what?",
            subtitle:
              "A step-by-step guide to the first 90 days after civilisation collapse. Start here before anything else in The Codex.",
          },
    [isSpace]
  );

  return (
    <div className="mx-auto max-w-4xl px-3 py-8 pb-24 text-codex-text md:px-6 md:pb-8">
      <header className="border-b border-codex-border pb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{hero.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-codex-secondary md:text-lg">
          {hero.subtitle}
        </p>
        <div
          className="mt-6 rounded-md border-2 border-amber-500 bg-amber-950/30 px-4 py-3 text-sm leading-relaxed text-amber-100"
          role="alert"
        >
          {isSpace ? (
            <p>
              This guide assumes pressurised habitat integrity, functional life support, and access to stored consumables.
              EVA without qualified procedures is life-threatening.
            </p>
          ) : (
            <p>
              This guide assumes you are healthy, have basic tools, and are in a temperate environment. Adjust for your
              situation.
            </p>
          )}
        </div>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-1">
        {isSpace ? (
          <>
            <PhaseCard
              title="Phase 1 — Hours 1–72"
              subtitle="Priority: Stay alive inside the envelope"
              items={SPACE_P1}
              storagePrefix="p1"
              mode="space"
              borderClass="border-red-600/80"
            />
            <PhaseCard
              title="Phase 2 — Days 4–30"
              subtitle="Priority: Stability"
              items={SPACE_P2}
              storagePrefix="p2"
              mode="space"
              borderClass="border-amber-500/80"
            />
            <PhaseCard
              title="Phase 3 — Days 31–90"
              subtitle="Priority: Foundation"
              items={SPACE_P3}
              storagePrefix="p3"
              mode="space"
              borderClass="border-codex-blue/80"
            />
          </>
        ) : (
          <>
            <PhaseCard
              title="Phase 1 — Hours 1–72"
              subtitle="Priority: Stay alive"
              items={EARTH_P1}
              storagePrefix="p1"
              mode="earth"
              borderClass="border-red-600/80"
            />
            <PhaseCard
              title="Phase 2 — Days 4–30"
              subtitle="Priority: Stability"
              items={EARTH_P2}
              storagePrefix="p2"
              mode="earth"
              borderClass="border-amber-500/80"
            />
            <PhaseCard
              title="Phase 3 — Days 31–90"
              subtitle="Priority: Foundation"
              items={EARTH_P3}
              storagePrefix="p3"
              mode="earth"
              borderClass="border-codex-blue/80"
            />
          </>
        )}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">Critical knowledge</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CRITICAL.map((c) => (
            <Link
              key={c.title}
              to={c.href}
              className="block rounded-lg border border-codex-border bg-codex-surface p-4 transition-colors hover:border-codex-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            >
              <p className="font-display text-lg font-semibold text-codex-text">
                {c.emoji} {c.title}
              </p>
              <p className="mt-2 text-sm text-codex-secondary">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-codex-text">What kills people</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-codex-secondary">
          <li>
            <strong className="text-codex-text">Dehydration and waterborne disease</strong> — Vomiting and diarrhoea
            remove water faster than thirst signals. Prevention: clean water protocol, hand washing, latrine distance.
          </li>
          <li>
            <strong className="text-codex-text">Exposure</strong> — Hypothermia and heat stroke disable judgement before
            they kill. Prevention: shelter priority, shade, wet-bulb awareness, dry clothing.
          </li>
          <li>
            <strong className="text-codex-text">Infection from untreated wounds</strong> — Small cuts become systemic
            infection. Prevention: irrigation, dressings, isolation, rest.
          </li>
          <li>
            <strong className="text-codex-text">Panic decisions</strong> — Night travel, unsafe water gambles, fights over
            rumours. Prevention: written checklists, sleep rotation, agreed signals.
          </li>
          <li>
            <strong className="text-codex-text">Malnutrition over weeks</strong> — Calorie debt compounds. Prevention:
            food preservation, ration discipline, foraging maps.
          </li>
          <li>
            <strong className="text-codex-text">Social breakdown and conflict</strong> — Scarcity without governance
            turns lethal. Prevention: clear rules, trade, mediation before weapons.
          </li>
        </ol>
      </section>
    </div>
  );
}
