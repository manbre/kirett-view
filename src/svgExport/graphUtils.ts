//
// graph helpers used by SVG export

import type { GraphNode } from "@/types/graph";
import type { NodeLabel } from "@/constants/label";

export type Pos = { x: number; y: number };

// guard to ensure we only use finite coordinates
export function isFinitePos(
  p: { x: number; y: number } | undefined | null,
): p is { x: number; y: number } {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

// edge helpers
// get source/target node ids from a GraphEdge
type EdgeLike = {
  source: string | { id?: unknown };
  target: string | { id?: unknown };
};

export function endpoints(e: EdgeLike): { s: string; t: string } {
  let s: string;
  if (typeof e.source === "string") s = e.source;
  else {
    const id = e.source?.id;
    s = typeof id === "string" ? id : String(id ?? "");
  }

  let t: string;
  if (typeof e.target === "string") t = e.target;
  else {
    const id = e.target?.id;
    t = typeof id === "string" ? id : String(id ?? "");
  }
  return { s, t };
}

// node label & icon helpers
// precomputed display name (nameForLabel)
export function labelOf(n: GraphNode): string {
  const extra = n as unknown as Record<string, unknown>;
  const nameForLabel = extra["nameForLabel"];
  if (typeof nameForLabel === "string" && nameForLabel.trim().length > 0) {
    return nameForLabel;
  }

  const d = (n.data ?? {}) as Record<string, unknown>;
  const name =
    typeof d["Name"] === "string" ? (d["Name"] as string) : undefined;
  const label = typeof n.label === "string" ? n.label : undefined;
  return name ?? label ?? n.id;
}

// resolve icon key like CustomNode: data.labels[0] first, then node.label
export function resolveIconKey(n: GraphNode): NodeLabel | undefined {
  const d = (n.data ?? {}) as Record<string, unknown>;
  const labels = d["labels"] as unknown as unknown[] | undefined;
  const fromData =
    Array.isArray(labels) && typeof labels[0] === "string"
      ? (labels[0] as string)
      : undefined;
  return (
    ((fromData as NodeLabel | undefined) ??
      (n.label as NodeLabel | undefined)) ||
    undefined
  );
}

// layout fallback
// circle layout for nodes without known positions
export function circleFallback(nodes: GraphNode[]): Map<string, Pos> {
  const out = new Map<string, Pos>();
  const n = nodes.length;
  if (!n) return out;

  // radius grows with sqrt(n), reduces overlap a bit
  const R = Math.max(120, Math.ceil(80 * Math.sqrt(n)));
  const step = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const x = Math.cos(i * step) * R;
    const y = Math.sin(i * step) * R;
    out.set(nodes[i].id, { x, y });
  }
  return out;
}
