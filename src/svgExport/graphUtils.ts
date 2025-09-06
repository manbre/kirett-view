// EN: Graph helpers used by the SVG exporter.
// DE: Graph-Helfer, die vom SVG-Exporter genutzt werden.

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { NodeLabel } from "@/constants/label";

// ---------- basic types ----------

export type Pos = { x: number; y: number };

// EN: Guard to ensure we only use finite coordinates.
// DE: Wächter, damit nur endliche Koordinaten verwendet werden.
export function isFinitePos(
  p: { x: number; y: number } | undefined | null,
): p is { x: number; y: number } {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

// ---------- edge helpers ----------

// EN: Get source/target node ids from a GraphEdge.
// DE: Quell-/Ziel-IDs aus einer Kante ermitteln.
export function endpoints(e: GraphEdge): { s: string; t: string } {
  return { s: e.source, t: e.target };
}

// ---------- node label & icon helpers ----------

// EN: Prefer human-friendly labels from node.data, else node.label/id.
// DE: Bevorzuge menschenlesbare Bezeichner aus node.data, sonst node.label/id.
export function labelOf(n: GraphNode): string {
  const d = n.data as Record<string, unknown>;
  return (
    (d["displayName"] as string | undefined) ??
    (d["Name"] as string | undefined) ??
    (d["Label"] as string | undefined) ??
    n.label ??
    n.id
  );
}

/** EN: Resolve icon key like your CustomNode: data.labels[0] first, then node.label.
 *  DE: Icon-Key wie im CustomNode: zuerst data.labels[0], danach node.label.
 */
export function resolveIconKey(n: GraphNode): NodeLabel | undefined {
  const d = n.data as Record<string, unknown>;
  const fromData =
    Array.isArray(d?.labels) && typeof d.labels[0] === "string"
      ? (d.labels[0] as string)
      : undefined;
  return (
    (fromData as NodeLabel | undefined) ?? (n.label as NodeLabel | undefined)
  );
}

// ---------- layout fallback ----------

/** EN: Deterministic circle layout for nodes without known positions.
 *  DE: Deterministisches Kreis-Layout für Knoten ohne bekannte Position.
 */
export function circleFallback(nodes: GraphNode[]): Map<string, Pos> {
  const out = new Map<string, Pos>();
  const n = nodes.length;
  if (!n) return out;

  // EN: Radius grows with sqrt(n); reduces overlap a bit.
  // DE: Radius wächst mit sqrt(n); reduziert Überlappungen etwas.
  const R = Math.max(120, Math.ceil(80 * Math.sqrt(n)));
  const step = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const x = Math.cos(i * step) * R;
    const y = Math.sin(i * step) * R;
    out.set(nodes[i].id, { x, y });
  }
  return out;
}
