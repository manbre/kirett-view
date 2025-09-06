// EN: Resolve final node positions: prefer store posMap; fill gaps via circle fallback.
// DE: Finale Knotenpositionen bestimmen: posMap bevorzugen; Lücken via Kreis-Fallback füllen.

import type { GraphNode } from "@/types/graph";
import { circleFallback, type Pos, isFinitePos } from "./graphUtils";

export function resolvePositions(
  nodes: GraphNode[],
  posMap?: Map<string, Pos>,
): Map<string, Pos> {
  const pos = new Map<string, Pos>();

  // 1) reported positions (only finite)
  for (const n of nodes) {
    const p = posMap?.get(n.id);
    if (isFinitePos(p)) pos.set(n.id, p);
  }

  // 2) missing ones via circle fallback
  if (pos.size !== nodes.length) {
    const missing = nodes.filter((n) => !pos.has(n.id));
    for (const [id, p] of circleFallback(missing)) pos.set(id, p);
  }

  return pos;
}
