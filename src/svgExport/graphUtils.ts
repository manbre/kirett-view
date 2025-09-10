// Small graph helpers used by SVG export

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { NodeLabel } from "@/constants/label";

// ---------- basic types ----------

export type Pos = { x: number; y: number };

// Guard to ensure we only use finite coordinates
export function isFinitePos(
  p: { x: number; y: number } | undefined | null,
): p is { x: number; y: number } {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

// ---------- edge helpers ----------

// Get source/target node ids from a GraphEdge
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

// Prefer a precomputed display name (nameForLabel). Otherwise use data fields
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

  // Optional: skip the BPR prefix if the viewer does not show it
  // const prefix = bpr ? `${bpr}: ` : "";
  // return `${prefix}${name ?? label ?? n.id}`;

  return name ?? label ?? n.id;
}

/** Resolve icon key like CustomNode: data.labels[0] first, then node.label */
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

/** Deterministic circle layout for nodes without known positions */
export function circleFallback(nodes: GraphNode[]): Map<string, Pos> {
  const out = new Map<string, Pos>();
  const n = nodes.length;
  if (!n) return out;

  // Radius grows with sqrt(n); reduces overlap a bit
  const R = Math.max(120, Math.ceil(80 * Math.sqrt(n)));
  const step = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const x = Math.cos(i * step) * R;
    const y = Math.sin(i * step) * R;
    out.set(nodes[i].id, { x, y });
  }
  return out;
}
