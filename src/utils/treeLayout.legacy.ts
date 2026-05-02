import dagre from "dagre";
import type { TechnologySummary } from "../types/technology";

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  layer: number;
}

/**
 * Advanced DAG layout engine using Dagre.
 * Replaces the rigid lane-based system with an organic but directed flow
 * that minimizes edge crossings and optimizes readability for large graphs.
 */
export function layoutTechTree(technologies: TechnologySummary[]): PositionedNode[] {
  const g = new dagre.graphlib.Graph();
  
  // Set global graph properties
  g.setGraph({
    rankdir: "LR", // Left to right
    nodesep: 80,   // Vertical distance between nodes
    ranksep: 280,  // Horizontal distance between layers
    marginx: 100,
    marginy: 100,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  for (const tech of technologies) {
    g.setNode(tech.id, { width: 136, height: 80 });
  }

  // Add edges to the graph
  const inSet = new Set(technologies.map((t) => t.id));
  for (const tech of technologies) {
    for (const pid of tech.prerequisites) {
      if (inSet.has(pid)) {
        g.setEdge(pid, tech.id);
      }
    }
  }

  // Execute layout
  dagre.layout(g);

  // Map back to our interface
  return technologies.map((tech) => {
    const node = g.node(tech.id);
    return {
      id: tech.id,
      x: node.x,
      y: node.y,
      layer: 0, // Layering is handled by dagre x-position, but we'll set it to 0 for now as it's not strictly used for positioning anymore
    };
  });
}
