import { useEffect, useState } from "react";
import { loadAllTechnologies } from "../data/loadTechnologies";
import type { Technology } from "../types/technology";

export function useTechnologies() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAllTechnologies()
      .then((items) => {
        if (!cancelled) setTechnologies(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { technologies, loading };
}
