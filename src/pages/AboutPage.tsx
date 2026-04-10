import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold text-codex-text">
        About The Codex
      </h1>
      <div className="prose-codex mt-6 space-y-4 text-sm leading-relaxed text-codex-secondary">
        <p>
          The Codex is a visual, interactive encyclopaedia of human technology. It
          maps technologies as an interconnected tree: what had to exist before,
          and what each node unlocks after.
        </p>
        <p>
          It exists for two purposes: if civilisation falls, a survivor should be
          able to rebuild without losing millennia of technique; and as humanity
          expands beyond Earth, colonists can reason from first principles about
          what to build next with local materials.
        </p>
        <p>
          This application is intentionally static: JSON entries ship with the site
          so it can be mirrored, archived, and opened offline once cached.
        </p>
      </div>
      <h2 className="mt-10 font-display text-2xl font-semibold text-codex-text">
        How to contribute
      </h2>
      <p className="mt-3 text-sm text-codex-secondary">
        Add or edit files in{" "}
        <code className="font-mono text-codex-muted">src/data/technologies/</code>{" "}
        and register ids in{" "}
        <code className="font-mono text-codex-muted">src/data/index.json</code>.
        Run{" "}
        <code className="font-mono text-codex-muted">npm run validate-data</code>{" "}
        before opening a pull request. See{" "}
        <code className="font-mono text-codex-muted">CONTRIBUTING.md</code> for the
        full workflow.
      </p>
      <p className="mt-6">
        <Link
          to="/"
          className="text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
        >
          Open the tree →
        </Link>
      </p>
    </div>
  );
}
