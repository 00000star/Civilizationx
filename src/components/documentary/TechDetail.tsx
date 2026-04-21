import { useCallback, useEffect, useId, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { Technology } from "../../types/technology";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";
import { ComponentList } from "./ComponentList";
import { BuildSteps } from "./BuildSteps";
import { DependencyGraph } from "./DependencyGraph";
import { LocationMap } from "./LocationMap";
import { MediaGallery } from "./MediaGallery";
import { formatReviewDate } from "../../utils/verificationUi";
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
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/tech/${encodeURIComponent(tech.id)}`
          : "";
      const dataUrl = await QRCode.toDataURL(url, {
        margin: 1,
        width: 120,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setPrintQrDataUrl(dataUrl);
      requestAnimationFrame(() => {
        window.print();
      });
    } catch {
      requestAnimationFrame(() => {
        window.print();
      });
    }
  }, [tech.id]);

  useEffect(() => {
    const onAfterPrint = () => setPrintQrDataUrl(null);
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  return (
    <div className="codex-tech-detail mx-auto max-w-5xl px-3 py-8 md:px-6">
      <div className="print-header-running" aria-hidden>
        {tech.name}
      </div>

      <header className="border-b border-codex-border pb-8 print:border-black">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wide text-codex-muted print:text-black">
              <span>{CATEGORY_LABEL[tech.category]}</span>
              <span aria-hidden>·</span>
              <span>{tech.era.replaceAll("-", " ")}</span>
              <span aria-hidden>·</span>
              <span>Difficulty {tech.difficulty}/5</span>
              <span aria-hidden>·</span>
              <span className="normal-case">
                Status: {tech.verification.status.replaceAll("-", " ")}
              </span>
            </div>
            <h1 className="codex-print-title mt-3 font-display text-4xl font-bold tracking-tight text-codex-text md:text-5xl print:text-black">
              {tech.name}
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-codex-secondary print:text-black">
              {tech.tagline}
            </p>
            <p className="mt-2 font-mono text-xs text-codex-muted print:text-black">
              Updated {tech.lastUpdated}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="print:hidden shrink-0 rounded-md border border-codex-border bg-codex-surface px-3 py-2 text-sm text-codex-text hover:border-codex-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue"
            aria-label="Print or save as PDF"
          >
            <span aria-hidden className="mr-1.5 inline-block">
              ⎙
            </span>
            Print / Save PDF
          </button>
        </div>
      </header>

      <VerificationBanner tech={tech} />
      <HazardBanner tech={tech} />

      <div
        className="sticky top-16 z-20 -mx-3 border-b border-codex-border bg-codex-bg/95 px-3 py-2 backdrop-blur print:hidden md:top-20"
        role="tablist"
        aria-label="Documentary sections"
      >
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const label =
              t === "build"
                ? "Build it"
                : t.charAt(0).toUpperCase() + t.slice(1);
            const selected = tab === t;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`tab-${t}-${printId}`}
                tabIndex={0}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue ${
                  selected
                    ? "border-codex-gold bg-codex-card text-codex-gold"
                    : "border-transparent text-codex-secondary hover:border-codex-border hover:text-codex-text"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen: single active panel */}
      <div className="print:hidden pt-8" role="tabpanel" aria-labelledby={`tab-${tab}-${printId}`}>
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
      </div>

      {/* Print: all sections in order */}
      <div className="hidden print:block print:pt-6" aria-hidden>
        <div className="print-verification-notice mb-6 rounded border-2 border-black bg-white p-4 text-black">
          <p className="font-bold">Verification notice</p>
          <p className="mt-2 text-sm leading-relaxed">
            This document was generated from The Codex. Entry verification status:{" "}
            <strong>{tech.verification.status.replaceAll("-", " ")}</strong>.
            {tech.verification.status === "unverified"
              ? " This entry has not been reviewed by a domain expert. Do not act on build instructions or material handling information without cross-referencing authoritative sources. In a survival situation, prioritise caution over speed."
              : null}
            {tech.verification.status === "community-reviewed"
              ? " Community-reviewed entries await expert verification."
              : null}
            {tech.verification.status === "expert-verified" && tech.verification.reviewedBy
              ? ` Verified by ${tech.verification.reviewedBy} on ${formatReviewDate(tech.verification.reviewDate)}.`
              : null}
          </p>
        </div>

        <section className="print-section">
          <h2 className="font-display text-xl font-semibold text-black">Overview</h2>
          <Overview tech={tech} />
        </section>
        <section className="print-section mt-8">
          <h2 className="font-display text-xl font-semibold text-black">Components</h2>
          <ComponentList components={tech.components} />
        </section>
        <section className="print-section mt-8">
          <h2 className="font-display text-xl font-semibold text-black">Build it</h2>
          <BuildTab tech={tech} />
        </section>
        <section className="print-section mt-8">
          <h2 className="font-display text-xl font-semibold text-black">Connections</h2>
          <DependencyGraph tech={tech} />
        </section>
        <section className="print-section mt-8">
          <h2 className="font-display text-xl font-semibold text-black">Media</h2>
          <MediaGallery
            techId={tech.id}
            images={tech.images}
            videos={tech.videos}
            links={tech.externalLinks}
          />
        </section>
        <section className="print-section mt-8">
          <h2 className="font-display text-xl font-semibold text-black">History</h2>
          <HistorySection tech={tech} />
        </section>
      </div>

      <div className="print-doc-footer hidden print:flex" aria-hidden>
        <div className="flex flex-1 flex-col gap-1 text-xs leading-snug text-black">
          <p>Printed from The Codex — verify before use</p>
          <p>
            Entry status: {tech.verification.status.replaceAll("-", " ")} · Printed:{" "}
            {printedAt}
          </p>
          <p>Live version: {entryUrl}</p>
        </div>
        {printQrDataUrl ? (
          <img src={printQrDataUrl} alt="" className="h-[72px] w-[72px] shrink-0 border border-black" />
        ) : (
          <div className="h-[72px] w-[72px] shrink-0 border border-dashed border-black" />
        )}
      </div>
    </div>
  );
}

function HazardBanner({ tech }: { tech: Technology }) {
  const hazards = inferHazards(tech);
  const risk = hazardRiskLevel(hazards);

  if (!hazards.length) {
    return null;
  }

  const border =
    risk === "critical"
      ? "border-red-500 bg-red-950/30"
      : risk === "high"
        ? "border-orange-500 bg-orange-950/30"
        : "border-amber-500 bg-amber-950/20";

  return (
    <section
      className={`mt-4 rounded-md border ${border} px-4 py-3 text-sm print:border-black print:bg-white`}
      aria-label="Hazard classification"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-codex-muted print:text-black">
            Hazard classification
          </p>
          <p className="mt-1 font-display text-lg font-semibold capitalize text-codex-text print:text-black">
            {risk} risk
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hazards.map((hazard) => {
            const def = hazardDefinition(hazard);
            return (
              <span
                key={hazard}
                title={def.description}
                className="rounded-full border border-codex-border bg-codex-card px-2.5 py-1 font-mono text-[11px] text-codex-secondary print:border-black print:bg-white print:text-black"
              >
                {def.label}
              </span>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-codex-secondary print:text-black">
        Hazards are inferred from the entry text and category. Treat this as a safety prompt,
        not a certification; cross-check high-risk procedures with authoritative sources and
        qualified experts.
      </p>
    </section>
  );
}

function VerificationBanner({ tech }: { tech: Technology }) {
  const { status, reviewedBy, reviewDate } = tech.verification;

  if (status === "expert-verified") {
    const who = reviewedBy?.trim() || "unspecified reviewer";
    const when = reviewDate ? formatReviewDate(reviewDate) : "unspecified date";
    return (
      <div
        className="mt-6 rounded-md border border-emerald-600/80 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100 print:hidden"
        role="status"
      >
        <p className="font-semibold text-emerald-300">
          ✓ Verified by {who} on {when}
        </p>
      </div>
    );
  }

  if (status === "community-reviewed") {
    return (
      <div
        className="mt-6 rounded-md border border-[#F59E0B] bg-[#F59E0B]/10 px-4 py-3 text-sm text-codex-secondary print:hidden"
        role="status"
      >
        <p className="font-semibold text-[#F59E0B]">
          ◎ Community reviewed — awaiting expert verification
        </p>
      </div>
    );
  }

  return (
    <div
      className="mt-6 rounded-md border-2 border-[#F59E0B] bg-[#F59E0B]/10 px-4 py-3 text-sm leading-relaxed text-codex-secondary print:hidden"
      role="alert"
    >
      <p className="font-semibold text-[#F59E0B]">⚠️ Unverified Entry</p>
      <p className="mt-2">
        This entry has not been reviewed by a domain expert. Do not act on build instructions or
        material handling information without cross-referencing authoritative sources. In a
        survival situation, prioritise caution over speed.
      </p>
    </div>
  );
}

function BuildTab({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          Raw materials
        </h2>
        <div className="mt-4">
          <LocationMap materials={tech.rawMaterials} />
        </div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          Build steps
        </h2>
        <div className="mt-4">
          <BuildSteps steps={tech.buildSteps} />
        </div>
      </section>
    </div>
  );
}

function Overview({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          The problem
        </h2>
        <div className="prose-codex mt-4 print:text-black">{paragraphs(tech.problem)}</div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          How it works
        </h2>
        <div className="prose-codex mt-4 print:text-black">{paragraphs(tech.overview)}</div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          Core principles
        </h2>
        <ul className="mt-4 space-y-4">
          {tech.principles.map((p) => (
            <li
              key={p.name}
              className="rounded-lg border border-codex-border bg-codex-card p-4 print:border-black print:bg-white"
            >
              <h3 className="font-display text-lg font-semibold text-codex-gold print:text-black">
                {p.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-codex-secondary print:text-black">
                {p.explanation}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          Historical impact
        </h2>
        <div className="prose-codex mt-4 print:text-black">{paragraphs(tech.impact)}</div>
      </section>
    </div>
  );
}

function HistorySection({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
          Timeline
        </h2>
        <ol className="mt-4 space-y-4 border-l border-codex-border pl-4 print:border-black">
          {tech.history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-codex-gold print:bg-black" />
              <p className="font-mono text-xs text-codex-gold print:text-black">{h.year}</p>
              <p className="mt-1 text-sm text-codex-text print:text-black">{h.event}</p>
              <p className="mt-1 text-xs text-codex-muted print:text-black">{h.location}</p>
              {h.person ? (
                <p className="text-xs text-codex-secondary print:text-black">{h.person}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
      {tech.inventors.length ? (
        <section>
          <h2 className="font-display text-2xl font-semibold text-codex-text print:text-black">
            Key people
          </h2>
          <ul className="mt-4 space-y-3">
            {tech.inventors.map((p) => (
              <li
                key={p.name}
                className="rounded-lg border border-codex-border bg-codex-card p-4 print:border-black print:bg-white"
              >
                <p className="font-display text-lg font-semibold text-codex-text print:text-black">
                  {p.name}{" "}
                  <span className="text-sm font-normal text-codex-muted print:text-black">
                    ({p.years}, {p.nationality})
                  </span>
                </p>
                <p className="mt-1 text-sm text-codex-secondary print:text-black">
                  {p.contribution}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="border-t border-codex-border pt-8 print:border-black">
        <h2 className="font-display text-xl font-semibold text-codex-text print:text-black">
          Sources used to write this entry
        </h2>
        {tech.verification.sources.length === 0 ? (
          <p className="mt-3 text-sm text-codex-muted print:text-black">
            No bibliographic sources are recorded for this entry yet. Treat all narrative and
            procedural content as unverified.
          </p>
        ) : (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-codex-secondary print:text-black">
            {tech.verification.sources.map((s) => (
              <li key={s.id}>
                <span className="font-medium text-codex-text print:text-black">{s.title}</span>
                <span className="ml-1 font-mono text-xs text-codex-muted print:text-black">
                  ({s.type})
                </span>
                {s.url ? (
                  <a
                    href={s.url}
                    className="ml-1 text-codex-blue underline print:text-black"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.url}
                  </a>
                ) : null}
                {s.note ? <p className="mt-1 text-xs text-codex-muted print:text-black">{s.note}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function paragraphs(text: string) {
  return text.split("\n\n").map((para, i) => (
    <p
      key={i}
      className="mb-4 text-sm leading-relaxed text-codex-secondary last:mb-0 print:text-black"
    >
      {para}
    </p>
  ));
}
