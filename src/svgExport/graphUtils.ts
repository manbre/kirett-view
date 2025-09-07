// EN: Small graph helpers used by SVG export.
// DE: Kleine Graph-Helfer, die der SVG-Export nutzt.

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
  const s =
    typeof (e as any).source === "string"
      ? (e as any).source
      : (e as any).source?.id;
  const t =
    typeof (e as any).target === "string"
      ? (e as any).target
      : (e as any).target?.id;
  return { s, t };
}

// ---------- node label & icon helpers ----------

// EN: Prefer a precomputed display name (nameForLabel). Otherwise use data fields.
// DE: Bevorzuge vorberechneten Anzeigenamen (nameForLabel). Sonst Datenfelder nutzen.
export function labelOf(n: GraphNode): string {
  const anyN = n as any;
  if (
    typeof anyN.nameForLabel === "string" &&
    anyN.nameForLabel.trim().length > 0
  ) {
    return anyN.nameForLabel;
  }

  const d = (n.data ?? {}) as Record<string, unknown>;
  const bpr =
    typeof d["BPR"] === "string" && d["BPR"] !== "None"
      ? (d["BPR"] as string)
      : undefined;
  const name =
    typeof d["Name"] === "string" ? (d["Name"] as string) : undefined;
  const label = typeof n.label === "string" ? n.label : undefined;

  // Optional prefix (BPR) rauslassen, wenn du es im Viewer auch nicht zeigst:
  // const prefix = bpr ? `${bpr}: ` : "";
  // return `${prefix}${name ?? label ?? n.id}`;

  return name ?? label ?? n.id;
}

/** EN: Resolve icon key like your CustomNode: data.labels[0] first, then node.label.
 *  DE: Icon-Key wie im CustomNode: zuerst data.labels[0], danach node.label.
 */
export function resolveIconKey(n: GraphNode): NodeLabel | undefined {
  const d = (n.data ?? {}) as Record<string, unknown>;
  const fromData =
    Array.isArray((d as any).labels) && typeof (d as any).labels[0] === "string"
      ? ((d as any).labels[0] as string)
      : undefined;
  return (
    ((fromData as NodeLabel | undefined) ??
      (n.label as NodeLabel | undefined)) ||
    undefined
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
