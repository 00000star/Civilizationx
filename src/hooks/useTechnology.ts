import { useEffect, useState } from "react";
import type { Technology } from "../types/technology";
import { loadTechnology } from "../data/loadTechnologies";

export function useTechnology(id: string | undefined) {
  const [technology, setTechnology] = useState<Technology | undefined>();
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    let cancelled = false;
    setTechnology(undefined);
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadTechnology(id)
      .then((tech) => {
        if (!cancelled) setTechnology(tech);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { technology, loading };
}
