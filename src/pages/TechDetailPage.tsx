import { useParams, Link } from "react-router-dom";
import { useTechnology } from "../hooks/useTechnology";
import { BreadcrumbNav } from "../components/ui/BreadcrumbNav";
import { TechDetail } from "../components/documentary/TechDetail";
import { CATEGORY_LABEL } from "../utils/categoryMeta";

export function TechDetailPage() {
  const { id } = useParams();
  const tech = useTechnology(id);

  if (!id) {
    return (
      <div className="px-6 py-16 text-center text-codex-secondary">
        Missing technology id.
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-codex-text">
          Entry not found
        </h1>
        <p className="mt-2 text-sm text-codex-secondary">
          No technology with id{" "}
          <code className="font-mono text-codex-muted">{id}</code> is registered in
          the index.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
        >
          Return to the tree
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-codex-border bg-codex-surface/80 px-3 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <BreadcrumbNav
            items={[
              { label: "The Codex", to: "/" },
              { label: CATEGORY_LABEL[tech.category], to: "/search" },
              { label: tech.name },
            ]}
          />
          <Link
            to={`/?node=${encodeURIComponent(tech.id)}`}
            className="text-sm text-codex-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
          >
            ← Back to tree
          </Link>
        </div>
      </div>
      <TechDetail tech={tech} />
    </div>
  );
}
