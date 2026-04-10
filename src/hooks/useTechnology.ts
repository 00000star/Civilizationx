import { useMemo } from "react";
import { loadTechnology } from "../data/loadTechnologies";

export function useTechnology(id: string | undefined) {
  return useMemo(() => {
    if (!id) return undefined;
    return loadTechnology(id);
  }, [id]);
}
