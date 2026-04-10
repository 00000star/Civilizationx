import type { Technology } from "../types/technology";

export function searchTechnologies(
  items: Technology[],
  query: string
): Technology[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter((t) => {
    if (t.name.toLowerCase().includes(q)) return true;
    if (t.id.toLowerCase().includes(q)) return true;
    if (t.tagline.toLowerCase().includes(q)) return true;
    if (t.category.toLowerCase().includes(q)) return true;
    if (t.era.toLowerCase().includes(q)) return true;
    if (t.overview.toLowerCase().includes(q)) return true;
    return false;
  });
}
