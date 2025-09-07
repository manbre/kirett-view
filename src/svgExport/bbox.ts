// EN: Compute bounding box of icons + wrapped labels.
// DE: Berechnet die Bounding-Box von Icons + umbrochenen Labels.

import type { GraphNode } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { wrapTextToLines } from "./svgUtils";
import { buildDisplayName } from "@/graph/label-metrics";

export interface BBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

/** EN: Safe label (same logic as viewer) without using `any`.
 *  DE: Gleiches Label wie im Viewer – ohne `any`.
 */
function labelFor(node: GraphNode): string {
  const data =
    typeof node.data === "object" && node.data !== null
      ? (node.data as Record<string, unknown>)
      : undefined;
  return buildDisplayName(data, node.label);
}

/** EN: Compute bbox with padding, overscan and extra bottom padding.
 *  DE: BBox mit Padding, Overscan und zusätzlichem Unter-Padding berechnen.
 */
export function computeBBox(
  nodes: GraphNode[],
  pos: Map<string, Pos>,
  iconSize: number,
  fontSize: number,
  padding: number,
  maxTextWidth: number,
  overscan: number,
  extraBottom: number,
): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const r = iconSize / 2;
  const lineHeight = fontSize * 1.2;

  for (const n of nodes) {
    const p = pos.get(n.id);
    if (!p) continue;

    // Icon box
    minX = Math.min(minX, p.x - r);
    maxX = Math.max(maxX, p.x + r);
    minY = Math.min(minY, p.y - r);
    maxY = Math.max(maxY, p.y + r);

    // Text box (wrapped like the viewer)
    const label = labelFor(n);
    const wrapped = wrapTextToLines(label, fontSize, maxTextWidth);
    const textH = wrapped.lines.length * lineHeight;

    const tx = p.x;
    const tyTop = p.y + r + 2; // start a bit under icon
    const tyBottom = tyTop + textH;

    minX = Math.min(minX, tx - wrapped.widest / 2);
    maxX = Math.max(maxX, tx + wrapped.widest / 2);
    minY = Math.min(minY, tyTop);
    maxY = Math.max(maxY, tyBottom);
  }

  if (!Number.isFinite(minX)) {
    // empty/safety
    minX = 0;
    minY = 0;
    maxX = 1;
    maxY = 1;
  }

  // inflate by padding + overscan and add extra bottom padding
  const padX = padding + overscan;
  const padYTop = padding + overscan;
  const padYBottom = padding + overscan + extraBottom;

  return {
    minX: minX - padX,
    minY: minY - padYTop,
    width: maxX - minX + 2 * padX,
    height: maxY - minY + padYTop + padYBottom,
  };
}
