// EN: Serialize edges/nodes: trimmed lines to node boundary, inline icons,
//     optional label background, raw coordinates (no minX/minY subtraction).
// DE: Kanten/Knoten serialisieren: Linien am Node-Rand abschneiden, Icons inline,
//     optionaler Label-Hintergrund, Rohkoordinaten (kein minX/minY-Abzug).

import type { GraphEdge, GraphNode } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { endpoints, labelOf, isFinitePos, resolveIconKey } from "./graphUtils";
import { esc, type ParsedIcon } from "./svgUtils";
import type { NodeLabel } from "@/constants/label";

// ---------- EDGES ----------

export type EdgeStyle = {
  edgeColor: string;
  edgeWidth: number;
  trimAtNode: boolean;
  iconRadius: number; // radius to trim at node edge
  arrowMarker?: string; // e.g. "url(#arrow)"
};

export function edgesToSvg(
  edges: GraphEdge[],
  pos: Map<string, Pos>,
  style: EdgeStyle,
): string {
  const { edgeColor, edgeWidth, trimAtNode, iconRadius, arrowMarker } = style;

  return edges
    .map((e) => {
      const { s, t } = endpoints(e);
      const a = pos.get(s),
        b = pos.get(t);
      if (!isFinitePos(a) || !isFinitePos(b)) return "";

      let x1 = a.x,
        y1 = a.y,
        x2 = b.x,
        y2 = b.y;

      if (trimAtNode) {
        const dx = x2 - x1,
          dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len,
          uy = dy / len;
        x1 += ux * iconRadius;
        y1 += uy * iconRadius;
        x2 -= ux * iconRadius;
        y2 -= uy * iconRadius;
      }

      const marker = arrowMarker ? `marker-end="${arrowMarker}"` : "";
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                  stroke="${edgeColor}" stroke-width="${edgeWidth}" ${marker}/>`;
    })
    .join("");
}

// ---------- NODES ----------

export type NodeStyle = {
  iconSize: number;
  nodeRadius: number;
  fontSize: number;
  fontFamily: string;
  iconColor: string; // for currentColor icons
  labelBg: boolean;
  textColor: string;
};

export function nodesToSvg(
  nodes: GraphNode[],
  pos: Map<string, Pos>,
  icons: Map<NodeLabel, ParsedIcon>,
  style: NodeStyle,
): string {
  const {
    iconSize,
    nodeRadius,
    fontSize,
    fontFamily,
    iconColor,
    labelBg,
    textColor,
  } = style;

  return nodes
    .map((n) => {
      const p = pos.get(n.id);
      if (!isFinitePos(p)) return "";
      const cx = p.x,
        cy = p.y;

      const title = labelOf(n);
      const key = resolveIconKey(n);
      const icon = key ? icons.get(key) : undefined;

      const iconPart = icon
        ? `<g style="color:${iconColor}" transform="translate(${cx - iconSize / 2}, ${cy - iconSize / 2})">
             <svg width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox}">${icon.inner}</svg>
           </g>`
        : `<circle cx="${cx}" cy="${cy}" r="${nodeRadius}" fill="#fff" stroke="#111"/>`;

      const tx = cx;
      const ty = cy + iconSize / 2 + fontSize;

      const approxW = Math.max(
        12,
        Math.round(title.length * (fontSize * 0.6)) + 8,
      );
      const labelBgPart = labelBg
        ? `<rect x="${tx - approxW / 2}" y="${ty - fontSize * 0.95}"
                 width="${approxW}" height="${fontSize * 1.25}" rx="2" ry="2"
                 fill="#fff" opacity="0.9"/>`
        : "";

      const textPart = `<text x="${tx}" y="${ty}" text-anchor="middle"
                               font-family="${fontFamily}" font-size="${fontSize}"
                               fill="${textColor}">${esc(title)}</text>`;

      return `${iconPart}${labelBgPart}${textPart}`;
    })
    .join("");
}
