import type { Technology } from "../types/technology";

/** Shortest chain from `from` to `to` following prerequisite edges (each step unlocks the next). */
export function shortestPrerequisitePath(
  technologies: Technology[],
  from: string,
  to: string
): string[] | null {
  if (from === to) return [from];
  const byId = new Map(technologies.map((t) => [t.id, t]));
  if (!byId.has(from) || !byId.has(to)) return null;

  const prereqOf = new Map<string, string[]>();
  for (const t of technologies) {
    for (const p of t.prerequisites) {
      const arr = prereqOf.get(p) ?? [];
      arr.push(t.id);
      prereqOf.set(p, arr);
    }
  }

  const queue: string[] = [from];
  const parent = new Map<string, string | null>();
  parent.set(from, null);

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    const nexts = prereqOf.get(cur) ?? [];
    for (const n of nexts) {
      if (parent.has(n)) continue;
      parent.set(n, cur);
      queue.push(n);
    }
  }

  if (!parent.has(to)) return null;

  const path: string[] = [];
  let x: string | null = to;
  while (x !== null) {
    path.push(x);
    x = parent.get(x) ?? null;
  }
  path.reverse();
  return path;
}

export function directUnlocks(
  technologies: Technology[],
  owned: Set<string>
): Technology[] {
  return technologies.filter((t) => {
    if (owned.has(t.id)) return false;
    return t.prerequisites.length > 0 && t.prerequisites.every((p) => owned.has(p));
  });
}

export function unlocksWithinSteps(
  technologies: Technology[],
  owned: Set<string>,
  maxSteps: number
): { tech: Technology; steps: number }[] {
  const byId = new Map(technologies.map((x) => [x.id, x]));
  const reachable = new Map<string, number>();
  for (const id of owned) reachable.set(id, 0);

  let frontier = new Set(owned);
  for (let step = 1; step <= maxSteps; step++) {
    const nextFrontier = new Set<string>();
    for (const id of frontier) {
      const t = byId.get(id);
      if (!t) continue;
      for (const uid of t.unlocks) {
        if (reachable.has(uid)) continue;
        const child = byId.get(uid);
        if (!child) continue;
        if (child.prerequisites.every((p) => reachable.has(p))) {
          reachable.set(uid, step);
          nextFrontier.add(uid);
        }
      }
    }
    frontier = nextFrontier;
    if (!frontier.size) break;
  }

  const out: { tech: Technology; steps: number }[] = [];
  for (const t of technologies) {
    if (owned.has(t.id)) continue;
    const d = reachable.get(t.id);
    if (d !== undefined && d >= 1 && d <= maxSteps) {
      out.push({ tech: t, steps: d });
    }
  }
  out.sort((a, b) => a.steps - b.steps || a.tech.name.localeCompare(b.tech.name));
  return out;
}
