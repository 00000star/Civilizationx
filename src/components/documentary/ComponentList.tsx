import type { Component } from "../../types/technology";
import { ComponentCard } from "./ComponentCard";

interface Props {
  components: Component[];
}

export function ComponentList({ components }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {components.map((c) => (
        <ComponentCard key={c.id} component={c} />
      ))}
    </div>
  );
}
