// src/svgExport/index.ts
"use client";

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Pos } from "./layout";
import { resolvePositions } from "./layout";
import { computeBBox } from "./bbox";
import { edgesToSvg, nodesToSvg } from "./serialize";
import { loadIconsFor } from "./icons";
import { MAX_W as VIEWER_MAX_W } from "@/graph/label-metrics";

export type Bg = "transparent" | "white";

export interface SvgExportOptions {
  background?: Bg;
  padding?: number;
  fontFamily?: string;
  fontSize?: number;
  iconSize?: number;
  nodeRadius?: number;
  iconColor?: string;
  edgeColor?: string;
  edgeWidth?: number;
  arrow?: boolean;
  labelBg?: boolean;
  fileName?: string;
  debug?: boolean;
  /** exakt wie im Viewer; wenn nicht gesetzt, wird Viewer-Standard genutzt */
  maxTextWidth?: number;
}

export async function buildSvgFromGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  posMap?: Map<string, Pos>,
  opts?: SvgExportOptions,
): Promise<string | null> {
  if (!nodes || nodes.length === 0) return null;

  const padding = opts?.padding ?? 24;
  const fontSize = opts?.fontSize ?? 12;
  const iconSize = opts?.iconSize ?? 24;
  const nodeRadius = opts?.nodeRadius ?? iconSize / 2;
  const iconColor = opts?.iconColor ?? "#111";
  const fontFamily =
    opts?.fontFamily ??
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
  const background = opts?.background ?? "transparent";
  const edgeColor = opts?.edgeColor ?? "#7aa7ff";
  const edgeWidth = opts?.edgeWidth ?? 1.25;
  const withArrow = opts?.arrow ?? false;
  const labelBg = opts?.labelBg ?? true;
  const debug = opts?.debug ?? false;
  const maxTextWidth = opts?.maxTextWidth ?? VIEWER_MAX_W;

  // 1) Positionen gemäß Priorität
  const posRaw = resolvePositions(nodes, posMap);

  // 2) BBox aus Rohkoordinaten – liefert minY/maxY für flip
  const bbox = computeBBox(
    nodes,
    posRaw,
    iconSize,
    fontSize,
    padding,
    maxTextWidth,
  );
  const { minX, minY, width, height } = bbox;
  const maxY = minY + height;

  // 3) Y an SVG anpassen (immer flippen, keine Flag)
  const flipped = new Map<string, Pos>();
  const flipY = (y: number) => minY + (maxY - y);
  for (const [id, p] of posRaw) flipped.set(id, { x: p.x, y: flipY(p.y) });

  // 4) Icons laden
  const icons = await loadIconsFor(nodes);

  // 5) defs (Pfeile optional)
  const defs = withArrow
    ? `<defs>
         <marker id="arrow" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto" refX="8" refY="4">
           <path d="M0,0 L8,4 L0,8 z" fill="${edgeColor}"/>
         </marker>
       </defs>`
    : "";

  // 6) serialize
  const edgesSvg = edgesToSvg(edges, flipped, {
    edgeColor,
    edgeWidth,
    trimAtNode: true,
    iconRadius: nodeRadius,
    arrowMarker: withArrow ? "url(#arrow)" : undefined,
  });

  const nodesSvg = nodesToSvg(nodes, flipped, icons, {
    iconSize,
    nodeRadius,
    fontSize,
    fontFamily,
    iconColor,
    labelBg,
    textColor: "#111",
    maxTextWidth, // wichtig für identischen Wrap
  });

  // 7) optionaler Hintergrund / Debugrahmen
  const bg =
    background === "white"
      ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />`
      : "";

  const dbg = debug
    ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}"
              fill="none" stroke="#f36" stroke-dasharray="4 3" stroke-width="1" />`
    : "";

  // 8) Finale SVG
  return `<svg xmlns="http://www.w3.org/2000/svg"
               width="${width}" height="${height}"
               viewBox="${minX} ${minY} ${width} ${height}"
               role="img" aria-label="Exported subgraph">
            ${defs}${bg}${dbg}
            <g id="edges">${edgesSvg}</g>
            <g id="nodes">${nodesSvg}</g>
          </svg>`
    .replace(/\s+/g, " ")
    .trim();
}
