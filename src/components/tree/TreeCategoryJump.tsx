import { useSearchParams } from "react-router-dom";
import type { TechCategory, TechnologySummary } from "../../types/technology";
import { CategoryIcon } from "../ui/CategoryIcon";
import { TECH_CATEGORIES } from "../../utils/categoryMeta";
import { useMemo } from "react";

interface Props {
  technologies: TechnologySummary[];
}

export function TreeCategoryJump({ technologies }: Props) {
  const [params, setParams] = useSearchParams();

  const categoryStartNodes = useMemo(() => {
    const m = new Map<TechCategory, string>();
    for (const cat of TECH_CATEGORIES) {
      // Find the node with the least number of prerequisites in this category
      const catNodes = technologies.filter(t => t.category === cat);
      if (catNodes.length === 0) continue;
      
      const sorted = [...catNodes].sort((a, b) => a.prerequisites.length - b.prerequisites.length);
      m.set(cat, sorted[0].id);
    }
    return m;
  }, [technologies]);

  const jump = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("node", id);
    setParams(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 p-1.5 md:gap-3 md:p-2">
      {TECH_CATEGORIES.map((cat) => {
        const id = categoryStartNodes.get(cat);
        if (!id) return null;
        
        return (
          <button
            key={cat}
            onClick={() => jump(id)}
            title={`Jump to ${cat}`}
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-codex-card/50 px-2 py-1.5 md:px-3 transition-all hover:border-codex-gold/50 hover:bg-codex-card active:scale-95"
          >
            <CategoryIcon category={cat} className="h-3 w-3 md:h-3.5 md:w-3.5 text-codex-muted group-hover:text-codex-gold transition-colors" label="" />
            <span className="hidden sm:inline font-mono text-[9px] md:text-[10px] uppercase tracking-wider text-codex-muted group-hover:text-codex-text">
              {cat.replaceAll("-", " ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
