import { Link } from "react-router-dom";

interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  items: Crumb[];
}

export function BreadcrumbNav({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-codex-secondary">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 ? (
              <span className="text-codex-muted" aria-hidden>
                /
              </span>
            ) : null}
            {c.to ? (
              <Link
                to={c.to}
                className="hover:text-codex-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue rounded-sm"
              >
                {c.label}
              </Link>
            ) : (
              <span
                className={i === items.length - 1 ? "text-codex-text" : ""}
                aria-current={i === items.length - 1 ? "page" : undefined}
              >
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
