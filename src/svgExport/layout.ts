// EN: Resolve positions from posMap or fallback circle layout.
// DE: Positionen aus posMap oder Fallback-Kreis-Layout bestimmen.

import type { GraphNode } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { circleFallback, isFinitePos } from "./graphUtils";

export function resolvePositions(
  nodes: GraphNode[],
  posMap?: Map<string, Pos>,
): Map<string, Pos> {
  const out = new Map<string, Pos>();
  const missing: GraphNode[] = [];

  for (const n of nodes) {
    const p = posMap?.get(n.id);
    if (isFinitePos(p)) out.set(n.id, { x: p.x, y: p.y });
    else missing.push(n);
  }

  if (missing.length) {
    const circ = circleFallback(missing);
    for (const [id, p] of circ) out.set(id, p);
  }
  return out;
}
