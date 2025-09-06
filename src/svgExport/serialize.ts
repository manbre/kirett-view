// src/svgExport/serialize.ts
// -------------------------------------------------------------
// EN: Serialization helpers that turn nodes/edges into SVG markup.
//     Text is wrapped exactly like in the canvas: same MAX_W and
//     same name-building logic via buildDisplayName.
// DE: Serialisierungs-Helfer, die Knoten/Kanten in SVG-Markup
//     verwandeln. Der Text wird exakt wie im Viewer umbrochen:
//     gleicher MAX_W und gleiche Namenslogik über buildDisplayName.
// -------------------------------------------------------------

import type { GraphEdge, GraphNode } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { endpoints, isFinitePos, resolveIconKey } from "./graphUtils";
import { esc, type ParsedIcon, estimateTextWidth } from "./svgUtils";
import type { NodeLabel } from "@/constants/label";

// WICHTIG: Wir verwenden die gleichen Metriken wie im Viewer.
import {
  MAX_W, // gleiche max. Textbreite wie im Canvas
  buildDisplayName, // gleiche Namenslogik wie im Canvas
} from "@/graph/label-metrics";

// -------------------------------------------------------------
// EDGES
// -------------------------------------------------------------

export type EdgeStyle = {
  edgeColor: string;
  edgeWidth: number;
  trimAtNode: boolean;
  iconRadius: number; // EN: cut line at node radius; DE: Linie am Node-Rand kürzen
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
      const a = pos.get(s);
      const b = pos.get(t);
      if (!isFinitePos(a) || !isFinitePos(b)) return "";

      let x1 = a.x,
        y1 = a.y;
      let x2 = b.x,
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

      const marker = arrowMarker ? ` marker-end="${arrowMarker}"` : "";
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                    stroke="${edgeColor}" stroke-width="${edgeWidth}"${marker} />`;
    })
    .join("");
}

// -------------------------------------------------------------
// TEXT-WRAP wie im Viewer
// -------------------------------------------------------------
// EN: Word-wrapping identical to canvas logic: we accumulate words
//     until the measured width (via estimateTextWidth) would exceed
//     MAX_W, then we break to a new line.
// DE: Wortweiser Umbruch wie im Canvas: Wir sammeln Wörter, bis die
//     gemessene Breite (über estimateTextWidth) MAX_W übersteigen
//     würde; dann Zeilenumbruch.

function wrapToLines(
  text: string,
  fontSize: number,
  maxWidth: number, // == MAX_W aus label-metrics
): string[] {
  const words = (text ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    const w = estimateTextWidth(candidate, fontSize);
    if (w <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

// -------------------------------------------------------------
// NODES
// -------------------------------------------------------------

export type NodeStyle = {
  iconSize: number;
  nodeRadius: number;
  fontSize: number;
  fontFamily: string;
  iconColor: string; // for 'currentColor' tinted icons
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

  // Zeilenhöhe (Viewer-ähnlich): leicht > fontSize
  const lineHeight = fontSize * 1.25;

  return nodes
    .map((n) => {
      const p = pos.get(n.id);
      if (!isFinitePos(p)) return "";

      const cx = p.x;
      const cy = p.y;

      // *** Hier die gleiche Namenslogik wie im Viewer ***
      // EN: same name building as in CustomNode/Viewer
      const title =
        ((n as any).nameForLabel as string) ?? buildDisplayName(n.data);

      // Icon auflösen
      const key = resolveIconKey(n);
      const icon = key ? icons.get(key) : undefined;

      // Icon-Teil: entweder inline-SVG oder Fallback-Kreis
      const iconPart = icon
        ? `<g style="color:${iconColor}" transform="translate(${cx - iconSize / 2}, ${cy - iconSize / 2})">
             <svg width="${iconSize}" height="${iconSize}" viewBox="${icon.viewBox}">${icon.inner}</svg>
           </g>`
        : `<circle cx="${cx}" cy="${cy}" r="${nodeRadius}" fill="#fff" stroke="#111" />`;

      // Text-Zeilen umbrechen (identische Breite wie im Viewer: MAX_W)
      const lines = wrapToLines(title, fontSize, MAX_W);

      // Text-Startpunkt: unterhalb des Icons
      const tx = cx;
      const ty0 = cy + iconSize / 2 + fontSize; // baseline der ersten Zeile

      // Hintergrund-Breite = min(MAX_W, tatsächliche max. Zeilenbreite)
      const widest = Math.max(
        12,
        ...lines.map((ln) => estimateTextWidth(ln, fontSize)),
      );
      const bgWidth = Math.min(widest + 8, MAX_W); // kleiner Padding wie im Viewer
      const bgHeight = lines.length * lineHeight;

      const labelBgPart = labelBg
        ? `<rect x="${tx - bgWidth / 2}" y="${ty0 - fontSize * 0.95}"
                 width="${bgWidth}" height="${bgHeight}"
                 rx="2" ry="2" fill="#fff" opacity="0.9" />`
        : "";

      // Mehrzeiliger Text via <tspan>, jeweils zentriert
      const tspans = lines
        .map((ln, i) => {
          const dy = i === 0 ? 0 : lineHeight;
          return `<tspan x="${tx}" dy="${dy}">${esc(ln)}</tspan>`;
        })
        .join("");

      const textPart = `<text x="${tx}" y="${ty0}" text-anchor="middle"
                               font-family="${fontFamily}" font-size="${fontSize}"
                               fill="${textColor}">${tspans}</text>`;

      return `${iconPart}${labelBgPart}${textPart}`;
    })
    .join("");
}
