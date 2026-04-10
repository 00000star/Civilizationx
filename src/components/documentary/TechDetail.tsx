import { useState } from "react";
import type { Technology } from "../../types/technology";
import { CATEGORY_LABEL } from "../../utils/categoryMeta";
import { ComponentList } from "./ComponentList";
import { BuildSteps } from "./BuildSteps";
import { DependencyGraph } from "./DependencyGraph";
import { LocationMap } from "./LocationMap";
import { MediaGallery } from "./MediaGallery";

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

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 md:px-6">
      <header className="border-b border-codex-border pb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wide text-codex-muted">
          <span>{CATEGORY_LABEL[tech.category]}</span>
          <span aria-hidden>·</span>
          <span>{tech.era.replaceAll("-", " ")}</span>
          <span aria-hidden>·</span>
          <span>
            Difficulty {tech.difficulty}/5
            {!tech.verified ? " · unverified" : ""}
          </span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-codex-text md:text-5xl">
          {tech.name}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-codex-secondary">
          {tech.tagline}
        </p>
        <p className="mt-2 font-mono text-xs text-codex-muted">
          Updated {tech.lastUpdated}
        </p>
      </header>

      <div
        className="sticky top-16 z-20 -mx-3 border-b border-codex-border bg-codex-bg/95 px-3 py-2 backdrop-blur md:top-20"
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
                id={`tab-${t}`}
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

      <div className="pt-8" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "overview" ? <Overview tech={tech} /> : null}
        {tab === "components" ? (
          <ComponentList components={tech.components} />
        ) : null}
        {tab === "build" ? (
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-2xl font-semibold text-codex-text">
                Raw materials
              </h2>
              <div className="mt-4">
                <LocationMap materials={tech.rawMaterials} />
              </div>
            </section>
            <section>
              <h2 className="font-display text-2xl font-semibold text-codex-text">
                Build steps
              </h2>
              <div className="mt-4">
                <BuildSteps steps={tech.buildSteps} />
              </div>
            </section>
          </div>
        ) : null}
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
    </div>
  );
}

function Overview({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text">
          The problem
        </h2>
        <div className="prose-codex mt-4">{paragraphs(tech.problem)}</div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text">
          How it works
        </h2>
        <div className="prose-codex mt-4">{paragraphs(tech.overview)}</div>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text">
          Core principles
        </h2>
        <ul className="mt-4 space-y-4">
          {tech.principles.map((p) => (
            <li
              key={p.name}
              className="rounded-lg border border-codex-border bg-codex-card p-4"
            >
              <h3 className="font-display text-lg font-semibold text-codex-gold">
                {p.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-codex-secondary">
                {p.explanation}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text">
          Historical impact
        </h2>
        <div className="prose-codex mt-4">{paragraphs(tech.impact)}</div>
      </section>
    </div>
  );
}

function HistorySection({ tech }: { tech: Technology }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl font-semibold text-codex-text">
          Timeline
        </h2>
        <ol className="mt-4 space-y-4 border-l border-codex-border pl-4">
          {tech.history.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-codex-gold" />
              <p className="font-mono text-xs text-codex-gold">{h.year}</p>
              <p className="mt-1 text-sm text-codex-text">{h.event}</p>
              <p className="mt-1 text-xs text-codex-muted">{h.location}</p>
              {h.person ? (
                <p className="text-xs text-codex-secondary">{h.person}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
      {tech.inventors.length ? (
        <section>
          <h2 className="font-display text-2xl font-semibold text-codex-text">
            Key people
          </h2>
          <ul className="mt-4 space-y-3">
            {tech.inventors.map((p) => (
              <li
                key={p.name}
                className="rounded-lg border border-codex-border bg-codex-card p-4"
              >
                <p className="font-display text-lg font-semibold text-codex-text">
                  {p.name}{" "}
                  <span className="text-sm font-normal text-codex-muted">
                    ({p.years}, {p.nationality})
                  </span>
                </p>
                <p className="mt-1 text-sm text-codex-secondary">
                  {p.contribution}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function paragraphs(text: string) {
  return text.split("\n\n").map((para, i) => (
    <p key={i} className="mb-4 text-sm leading-relaxed text-codex-secondary last:mb-0">
      {para}
    </p>
  ));
}
