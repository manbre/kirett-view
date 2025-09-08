// EN: Serialize edges and nodes to SVG markup.
// DE: Serialisiert Kanten und Knoten zu SVG-Markup.

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { endpoints } from "./graphUtils";
import { esc, wrapTextToLines, type ParsedIcon } from "./svgUtils";
import { buildDisplayName } from "@/graphUtils/labelMetrics";

function labelFor(n: GraphNode): string {
  const data =
    typeof n.data === "object" && n.data !== null
      ? (n.data as Record<string, unknown>)
      : undefined;
  return buildDisplayName(data, n.label);
}

// ---------- Edges ----------

export interface EdgeStyle {
  edgeColor: string;
  edgeWidth: number;
  trimAtNode: boolean;
  iconRadius: number;
  arrowMarker?: string;
}

export function edgesToSvg(
  edges: GraphEdge[],
  pos: Map<string, Pos>,
  style: EdgeStyle,
): string {
  const { edgeColor, edgeWidth, trimAtNode, iconRadius, arrowMarker } = style;

  const parts: string[] = [];
  for (const e of edges) {
    const { s, t } = endpoints(e);
    const a = pos.get(s);
    const b = pos.get(t);
    if (!a || !b) continue;

    let x1 = a.x,
      y1 = a.y;
    let x2 = b.x,
      y2 = b.y;

    if (trimAtNode) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      x1 += ux * iconRadius;
      y1 += uy * iconRadius;
      x2 -= ux * iconRadius;
      y2 -= uy * iconRadius;
    }

    parts.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${edgeColor}" stroke-width="${edgeWidth}"${
        style.arrowMarker ? ` marker-end="${arrowMarker}"` : ""
      }/>`,
    );
  }
  return parts.join("");
}

// ---------- Nodes ----------

export interface NodeStyle {
  iconSize: number;
  nodeRadius: number;
  fontSize: number;
  fontFamily: string;
  iconColor: string;
  labelBg: boolean;
  textColor: string;
  maxTextWidth: number;
}

export function nodesToSvg(
  nodes: GraphNode[],
  pos: Map<string, Pos>,
  icons: Map<string, ParsedIcon>,
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
    maxTextWidth,
  } = style;

  const lineHeight = fontSize * 1.2;
  const parts: string[] = [];

  for (const n of nodes) {
    const p = pos.get(n.id);
    if (!p) continue;

    const title = labelFor(n);
    const { lines, widest } = wrapTextToLines(title, fontSize, maxTextWidth);

    // Label background directly under icon
    const rectW = Math.max(iconSize * 1.6, widest + 16);
    const rectH = Math.max(iconSize * 1.6, lines.length * lineHeight + 16);
    const rectX = p.x - rectW / 2;
    const rectY = p.y + nodeRadius;

    if (labelBg) {
      parts.push(
        `<rect x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" rx="2" ry="2" fill="#fff" opacity="0.9"/>`,
      );
    }

    // Icon
    const icon = icons.get(n.id);
    if (icon) {
      parts.push(
        `<g style="color:${iconColor}" transform="translate(${p.x - iconSize / 2}, ${
          p.y - iconSize / 2
        })">
           <svg width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox}">${icon.inner}</svg>
         </g>`,
      );
    } else {
      parts.push(
        `<circle cx="${p.x}" cy="${p.y}" r="${nodeRadius}" fill="#fff" stroke="#111"/>`,
      );
    }

    // Text (centered, stacked)
    const startY = rectY + fontSize + 2;
    for (let i = 0; i < lines.length; i++) {
      const ty = startY + i * lineHeight;
      parts.push(
        `<text x="${p.x}" y="${ty}" text-anchor="middle" font-family="${esc(
          fontFamily,
        )}" font-size="${fontSize}" fill="${textColor}">
           <tspan x="${p.x}" dy="0">${esc(lines[i])}</tspan>
         </text>`,
      );
    }
  }

  return parts.join("");
}
