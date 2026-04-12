import { Link } from "react-router-dom";

export function ContributePage() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-10 md:px-6">
      <h1 className="font-display text-4xl font-bold text-codex-text">
        Contribute
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-codex-secondary">
        The Codex improves when people who understand a domain help harden entries: sources,
        hazards, prerequisites, and space alternatives. Inaccurate procedural or medical
        content can cause serious harm; contributions are treated as safety-critical
        documentation.
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold text-codex-text">
        What we need
      </h2>
      <ul className="prose-codex mt-4 list-disc space-y-2 pl-5 text-sm text-codex-secondary">
        <li>New technology entries that match the depth of existing nodes (narrative, build steps, materials).</li>
        <li>Stronger <code className="font-mono text-codex-muted">verification.sources</code> (peer-reviewed papers, standards, institutional references).</li>
        <li>Corrections to factual errors, missing warnings, or unclear steps — with citations.</li>
        <li>Expert review for high-risk categories (medicine, high voltage, pressure vessels, toxic chemistry).</li>
      </ul>

      <h2 className="mt-10 font-display text-2xl font-semibold text-codex-text">
        How to submit
      </h2>
      <p className="prose-codex mt-3 text-sm leading-relaxed text-codex-secondary">
        Use the project repository: open a pull request for JSON and linked media changes, or an issue to flag
        a problem before you have a patch. Run{" "}
        <code className="font-mono text-codex-muted">npm run validate-data</code>,{" "}
        <code className="font-mono text-codex-muted">npm run build</code>, and{" "}
        <code className="font-mono text-codex-muted">npm run lint</code> before requesting review.
      </p>

      <h2 className="mt-10 font-display text-2xl font-semibold text-codex-text">
        Expert verification
      </h2>
      <p className="prose-codex mt-3 text-sm leading-relaxed text-codex-secondary">
        <code className="font-mono text-codex-muted">expert-verified</code> status is reserved for documented
        review by someone with appropriate credentials for the risk class (for example licensed clinicians for
        medicine, licensed engineers for structural or electrical work). Maintainers match reviewers to risk;
        see <code className="font-mono text-codex-muted">CONTRIBUTING.md</code> for the credential table.
      </p>

      <p className="mt-10 text-sm text-codex-secondary">
        <Link
          to="/about"
          className="text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
        >
          About the project →
        </Link>
      </p>
    </div>
  );
}
