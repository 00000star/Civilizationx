import { useCallback, useEffect, useId, useMemo, useState } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import type { Technology } from "../../types/technology";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";
import { ComponentList } from "./ComponentList";
import { BuildSteps } from "./BuildSteps";
import { DependencyGraph } from "./DependencyGraph";
import { LocationMap } from "./LocationMap";
import { MediaGallery } from "./MediaGallery";
import { hazardDefinition, hazardRiskLevel, inferHazards } from "../../utils/hazards";

const TABS = [
  "overview",
  "components",
  "build",
  "connections",
  "media",
  "history",
] as const;

type Tab = (typeof TABS)[number];

interface Props {
  tech: Technology;
}

export function TechDetail({ tech }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [printQrDataUrl, setPrintQrDataUrl] = useState<string | null>(null);
  const printId = useId().replace(/:/g, "");

  const entryUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/tech/${encodeURIComponent(tech.id)}`;
  }, [tech.id]);

  const printedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date()),
    []
  );

  const handlePrint = useCallback(async () => {
    try {
      const dataUrl = await QRCode.toDataURL(entryUrl, {
        margin: 1,
        width: 120,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setPrintQrDataUrl(dataUrl);
      requestAnimationFrame(() => {
        window.print();
      });
    } catch {
      window.print();
    }
  }, [entryUrl]);

  useEffect(() => {
    const onAfterPrint = () => setPrintQrDataUrl(null);
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  return (
    <div className="codex-tech-detail mx-auto max-w-6xl px-3 py-8 md:px-6">
      <div className="print-header-running font-mono text-[10px] uppercase tracking-widest text-codex-muted" aria-hidden>
        DOCUMENTARY ENTRY // ID: {tech.id} // LEVEL: {tech.difficulty}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <header className="border-b border-white/5 pb-8 print:border-black">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-codex-gold print:text-black">
              <span className="rounded border border-codex-gold/30 px-1.5 py-0.5">{CATEGORY_LABEL[tech.category]}</span>
              <span className="text-white/20">//</span>
              <span>{tech.era.replaceAll("-", " ")}</span>
              <span className="text-white/20">//</span>
              <span>RANK {tech.difficulty}</span>
            </div>
            
            <h1 className="codex-print-title mt-6 font-display text-5xl font-black tracking-tighter text-codex-text md:text-7xl print:text-black">
              {tech.name.toUpperCase()}
            </h1>
            
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-codex-secondary print:text-black italic border-l-4 border-codex-gold/40 pl-6">
              {tech.tagline}
            </p>
          </header>

          <VerificationBanner tech={tech} />
          <HazardBanner tech={tech} />

          {/* Desktop Tablist - Sticky */}
          <div
            className="sticky top-16 z-20 -mx-3 mt-8 border-b border-white/5 bg-codex-bg/95 px-3 py-2 backdrop-blur-xl print:hidden md:top-20"
            role="tablist"
          >
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TABS.map((t) => {
                const label = t === "build" ? "EXECUTION" : t.toUpperCase();
                const selected = tab === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    id={`tab-${t}-${printId}`}
                    onClick={() => setTab(t)}
                    className={`shrink-0 rounded px-4 py-2 font-mono text-[11px] font-bold tracking-widest transition-all focus-visible:outline-none ${
                      selected
                        ? "bg-codex-gold text-codex-bg"
                        : "text-codex-muted hover:bg-white/5 hover:text-codex-text"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div 
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="print:hidden pt-12" 
            role="tabpanel" 
            aria-labelledby={`tab-${tab}-${printId}`}
          >
            {tab === "overview" ? <Overview tech={tech} /> : null}
            {tab === "components" ? (
              <ComponentList components={tech.components} />
            ) : null}
            {tab === "build" ? <BuildTab tech={tech} /> : null}
            {tab === "connections" ? <DependencyGraph tech={tech} /> : null}
            {tab === "media" ? (
              <MediaGallery
                techId={tech.id}
                images={tech.images}
                videos={tech.videos}
                links={tech.externalLinks}
              />
            ) : null}
            {tab === "history" ? <HistorySection tech={tech} /> : null}
          </motion.div>
        </div>

        {/* Sidebar Info - "The Blueprint Block" */}
        <aside className="shrink-0 space-y-6 print:hidden lg:w-72">
           <div className="rounded-xl border border-white/10 bg-codex-card/50 p-6 backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-widest text-codex-muted">Metadata</p>
              <div className="mt-4 space-y-4">
                 <div>
                    <p className="text-[10px] font-bold text-codex-gold uppercase">ID Code</p>
                    <p className="mt-1 font-mono text-xs text-codex-text">{tech.id.toUpperCase()}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-codex-gold uppercase">Documentation Maturity</p>
                    <p className="mt-1 font-mono text-xs text-codex-text capitalize">{tech.maturity.replaceAll("-", " ")}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-codex-gold uppercase">Last Sync</p>
                    <p className="mt-1 font-mono text-xs text-codex-text">{tech.lastUpdated}</p>
                 </div>
              </div>
              
              <button
                type="button"
                onClick={handlePrint}
                className="mt-8 w-full rounded border border-white/10 bg-white/5 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-codex-text transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                Generate Field PDF
              </button>
           </div>
           
           <div className="rounded-xl border border-white/5 bg-white/5 p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-codex-muted">ISRU Status</p>
              <div className="mt-4 flex items-center justify-between">
                 <span className="text-[10px] text-codex-secondary uppercase">Space Readiness</span>
                 <span className={`text-[10px] font-bold uppercase ${tech.spaceReadiness.fullAlternatives ? "text-green-400" : "text-orange-400"}`}>
                   {tech.spaceReadiness.fullAlternatives ? "Serviceable" : "Earth Constrained"}
                 </span>
              </div>
           </div>
        </aside>
      </div>

      {/* Print View remains mostly the same but with better typography */}
      <div className="hidden print:block print:pt-6" aria-hidden>
         <div className="flex flex-col gap-1 text-xs leading-snug text-black mb-8 border-b-2 border-black pb-4">
            <p className="font-bold uppercase tracking-widest">CIVILIZATIONX // FIELD DOCUMENTARY</p>
            <p>ID: {tech.id.toUpperCase()} // STATUS: {tech.verification.status.toUpperCase()}</p>
            <p>PRINTED: {printedAt}</p>
            <p>URL: {entryUrl}</p>
         </div>

         <section className="print-section">
          <h2 className="font-display text-2xl font-bold text-black border-b-2 border-black pb-2 mb-6 uppercase">I. Overview</h2>
          <Overview tech={tech} />
        </section>
        <section className="print-section mt-12">
          <h2 className="font-display text-2xl font-bold text-black border-b-2 border-black pb-2 mb-6 uppercase">II. Components</h2>
          <ComponentList components={tech.components} />
        </section>
        <section className="print-section mt-12">
          <h2 className="font-display text-2xl font-bold text-black border-b-2 border-black pb-2 mb-6 uppercase">III. Execution</h2>
          <BuildTab tech={tech} />
        </section>

        <div className="mt-12 flex justify-end">
           {printQrDataUrl && (
             <img src={printQrDataUrl} alt="" className="h-24 w-24 border-2 border-black" />
           )}
        </div>
      </div>
    </div>
  );
}

function HazardBanner({ tech }: { tech: Technology }) {
  const hazards = inferHazards(tech);
  const risk = hazardRiskLevel(hazards);

  if (!hazards.length) return null;

  const colorClass =
    risk === "critical"
      ? "text-red-400 border-red-500/30 bg-red-950/20"
      : risk === "high"
        ? "text-orange-400 border-orange-500/30 bg-orange-950/20"
        : "text-amber-400 border-amber-500/30 bg-amber-950/10";

  return (
    <section className={`mt-8 rounded-lg border p-6 ${colorClass} print:border-black print:bg-white`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
             <div className={`h-2 w-2 rounded-full animate-pulse ${risk === "critical" ? "bg-red-500" : "bg-orange-500"}`} />
             <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Safety Warning // {risk.toUpperCase()} RISK</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-2xl opacity-90">
            Automated inference detected potential hazards: {hazards.map(h => hazardDefinition(h).label.toUpperCase()).join(", ")}. 
            Review documentation with qualified personnel before initialization.
          </p>
        </div>
      </div>
    </section>
  );
}

function VerificationBanner({ tech }: { tech: Technology }) {
  const { status } = tech.verification;

  if (status === "expert-verified") {
    return (
      <div className="mt-8 rounded border border-green-500/30 bg-green-500/5 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-green-400">
        [ ENTRY STATUS: EXPERT VERIFIED // AUTHORIZED FOR FIELD USE ]
      </div>
    );
  }

  return (
    <div className="mt-8 rounded border border-codex-gold/30 bg-codex-gold/5 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-codex-gold">
      [ ENTRY STATUS: UNVERIFIED // USE WITH CAUTION ]
    </div>
  );
}

function BuildTab({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-codex-text">
          Raw Material Provenance
        </h2>
        <div className="mt-8">
          <LocationMap materials={tech.rawMaterials} />
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-codex-text">
          Operational Sequence
        </h2>
        <div className="mt-8">
          <BuildSteps steps={tech.buildSteps} />
        </div>
      </section>
    </div>
  );
}

function Overview({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-16">
      <section>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-codex-muted mb-4">// CORE PROBLEM</p>
        <div className="prose-codex max-w-4xl text-lg leading-relaxed text-codex-secondary">{paragraphs(tech.problem)}</div>
      </section>
      
      <section>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-codex-muted mb-4">// TECHNICAL PRINCIPLES</p>
        <div className="grid gap-4 md:grid-cols-2">
          {tech.principles.map((p) => (
            <div key={p.name} className="rounded-lg border border-white/5 bg-white/5 p-6 transition-colors hover:border-white/10">
              <h3 className="font-mono text-xs font-bold text-codex-gold uppercase tracking-wider">{p.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-codex-secondary">{p.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-codex-muted mb-4">// SYSTEM ARCHITECTURE</p>
        <div className="prose-codex max-w-4xl text-base leading-relaxed text-codex-secondary">{paragraphs(tech.overview)}</div>
      </section>
    </div>
  );
}

function HistorySection({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-codex-text mb-8">Development Chronology</h2>
        <div className="space-y-8 border-l border-white/10 pl-8 ml-2">
          {tech.history.map((h, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-2 border-codex-gold bg-codex-bg" />
              <p className="font-mono text-xs font-bold text-codex-gold">{h.year}</p>
              <p className="mt-1 text-lg font-bold text-codex-text">{h.event}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-codex-muted">{h.location}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function paragraphs(text: string) {
  return text.split("\n\n").map((para, i) => (
    <p key={i} className="mb-6 last:mb-0">
      {para}
    </p>
  ));
}
