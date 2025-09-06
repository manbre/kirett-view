// src/svgExport/layout.ts
// Bestimmt finale Knotenpositionen:
// 1) zuerst gemeldete store-Positionen
// 2) dann node.position.x/y
// 3) Fallback-Kreis

import type { GraphNode } from "@/types/graph";

export type Pos = { x: number; y: number };

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function isFinitePos(p: any): p is Pos {
  return p && isFiniteNum(p.x) && isFiniteNum(p.y);
}

function circleFallback(nodes: GraphNode[]): Map<string, Pos> {
  const out = new Map<string, Pos>();
  const n = nodes.length;
  if (!n) return out;
  const R = Math.max(120, Math.ceil(80 * Math.sqrt(n)));
  const step = (2 * Math.PI) / n;
  for (let i = 0; i < n; i++) {
    out.set(nodes[i].id, {
      x: Math.cos(i * step) * R,
      y: Math.sin(i * step) * R,
    });
  }
  return out;
}

export function resolvePositions(
  nodes: GraphNode[],
  posMap?: Map<string, Pos>,
): Map<string, Pos> {
  const pos = new Map<string, Pos>();

  // 1) reported/store
  for (const n of nodes) {
    const p = posMap?.get(n.id);
    if (isFinitePos(p)) pos.set(n.id, p);
  }

  // 2) node.position.{x,y}
  for (const n of nodes) {
    if (pos.has(n.id)) continue;
    const raw: any = n as any;
    const px = raw?.position?.x;
    const py = raw?.position?.y;
    if (isFiniteNum(px) && isFiniteNum(py)) {
      pos.set(n.id, { x: px, y: py });
    }
  }

  // 3) fallback
  if (pos.size !== nodes.length) {
    const missing = nodes.filter((n) => !pos.has(n.id));
    for (const [id, p] of circleFallback(missing)) pos.set(id, p);
  }

  return pos;
}
