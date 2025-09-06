// EN: Compute bbox from positions + icon/text sizes; never NaN.
// DE: BBox aus Positionen + Icon-/Textgrößen berechnen; niemals NaN.

import type { GraphNode } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { estimateTextWidth } from "./svgUtils";
import { labelOf, isFinitePos } from "./graphUtils";

export type BBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

export function computeBBox(
  nodes: GraphNode[],
  pos: Map<string, Pos>,
  iconSize: number,
  fontSize: number,
  padding: number,
): BBox {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let used = 0;

  for (const n of nodes) {
    const p = pos.get(n.id);
    if (!isFinitePos(p)) continue;
    used++;

    const title = labelOf(n);
    const halfW = Math.max(iconSize, estimateTextWidth(title, fontSize)) / 2;

    const ix0 = p.x - iconSize / 2,
      ix1 = p.x + iconSize / 2;
    const iy0 = p.y - iconSize / 2,
      iy1 = p.y + iconSize / 2;

    const tx0 = p.x - halfW,
      tx1 = p.x + halfW;
    const ty0 = p.y + iconSize / 2,
      ty1 = ty0 + fontSize * 1.2;

    minX = Math.min(minX, ix0, tx0);
    maxX = Math.max(maxX, ix1, tx1);
    minY = Math.min(minY, iy0);
    maxY = Math.max(maxY, iy1, ty1);
  }

  // EN: no valid points -> safe 1x1 at origin
  // DE: keine validen Punkte -> sichere 1x1-BBox am Ursprung
  if (
    used === 0 ||
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return { minX: 0, minY: 0, maxX: 1, maxY: 1, width: 1, height: 1 };
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(1, Math.ceil(maxX - minX));
  const height = Math.max(1, Math.ceil(maxY - minY));
  return { minX, minY, maxX, maxY, width, height };
}
