// EN: Build final SVG: raw coordinates + viewBox=minX minY width height.
// DE: Finale SVG-Erzeugung: Rohkoordinaten + viewBox=minX minY width height.

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { loadIconsFor } from "./icons";
import { resolvePositions } from "./layout";
import { computeBBox } from "./bbox";
import { edgesToSvg, nodesToSvg } from "./serialize";

export type Bg = "transparent" | "white";

export interface SvgExportOptions {
  background?: Bg; // "transparent" | "white"
  padding?: number; // default 24
  fontFamily?: string; // default system UI
  fontSize?: number; // default 12
  iconSize?: number; // default 24
  nodeRadius?: number; // default iconSize/2
  iconColor?: string; // default "#111"
  edgeColor?: string; // default "#7aa7ff"
  edgeWidth?: number; // default 1.25
  arrow?: boolean; // default false
  labelBg?: boolean; // default true
  fileName?: string; // used by hook
  debug?: boolean; // default false
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

  // 1) positions + icons
  const pos = resolvePositions(nodes, posMap);
  const icons = await loadIconsFor(nodes);

  // 2) bbox from raw coords
  const { minX, minY, width, height } = computeBBox(
    nodes,
    pos,
    iconSize,
    fontSize,
    padding,
  );

  // 3) defs (optional arrow marker)
  const defs = withArrow
    ? `<defs>
         <marker id="arrow" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto" refX="8" refY="4">
           <path d="M0,0 L8,4 L0,8 z" fill="${edgeColor}"/>
         </marker>
       </defs>`
    : "";

  // 4) primitives (raw)
  const edgesSvg = edgesToSvg(edges, pos, {
    edgeColor,
    edgeWidth,
    trimAtNode: true,
    iconRadius: nodeRadius,
    arrowMarker: withArrow ? "url(#arrow)" : undefined,
  });

  const nodesSvg = nodesToSvg(nodes, pos, icons, {
    iconSize,
    nodeRadius,
    fontSize,
    fontFamily,
    iconColor,
    labelBg,
    textColor: "#111",
  });

  // 5) background + debug frame
  const bg =
    background === "white"
      ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />`
      : "";

  const dbg = debug
    ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="none" stroke="#f36" stroke-dasharray="4 3" stroke-width="1"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg"
               width="${width}" height="${height}"
               viewBox="${minX} ${minY} ${width} ${height}"
               role="img" aria-label="Exported subgraph">
            ${defs}
            ${bg}
            ${dbg}
            <g id="edges">${edgesSvg}</g>
            <g id="nodes">${nodesSvg}</g>
          </svg>`
    .replace(/\s+/g, " ")
    .trim();
}
