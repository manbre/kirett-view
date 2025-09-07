// EN: Build final SVG (viewer-parity: same wrap width & font size).
// DE: Finales SVG bauen (Viewer-Parität: gleiche Umbruchbreite & Fontgröße).

import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Pos } from "./graphUtils";
import { resolvePositions } from "./layout";
import { computeBBox } from "./bbox";
import { loadIconsFor } from "./icons";
import { edgesToSvg, nodesToSvg } from "./serialize";

export type Bg = "transparent" | "white";

export interface SvgExportOptions {
  background?: Bg; // "transparent" | "white"
  padding?: number; // Außenrand (default 24)
  fontFamily?: string; // Default System-UI
  fontSize?: number; // MUSS dem Viewer entsprechen
  iconSize?: number; // 24..50
  nodeRadius?: number; // default iconSize/2
  iconColor?: string; // "#111"
  edgeColor?: string; // "#7aa7ff"
  edgeWidth?: number; // 1.25
  arrow?: boolean; // Pfeilspitzen
  labelBg?: boolean; // Hintergrund für Label-Box
  debug?: boolean; // Debug-Rahmen
  maxTextWidth?: number; // exakt wie im Viewer (z.B. MAX_W)
  overscan?: number; // kleiner Sicherheits-Puffer (default 2)
  extraBottom?: number; // zusätzlicher Bodenabstand in px (default 8)
}

export async function buildSvgFromGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  posMap?: Map<string, Pos>,
  opts?: SvgExportOptions,
): Promise<string | null> {
  if (!nodes || nodes.length === 0) return null;

  // ---- Options (mit stabilen Defaults) ----
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

  // WICHTIG: identisch zum Viewer übergeben
  const maxTextWidth = opts?.maxTextWidth ?? 200;
  const overscan = opts?.overscan ?? 2;
  const extraBottom = opts?.extraBottom ?? 8;

  // ---- 1) Positionen (roh) ----
  const posRaw = resolvePositions(nodes, posMap);

  // ---- 2) BBox aus Roh-Koordinaten (inkl. Padding/Overscan/Bottom) ----
  const bbox = computeBBox(
    nodes,
    posRaw,
    iconSize,
    fontSize,
    padding,
    maxTextWidth,
    overscan,
    extraBottom,
  );

  // ---- 3) Y-Flip (Canvas ↑ vs. SVG ↓) relativ zur BBox ----
  const maxY = bbox.minY + bbox.height;
  const flipY = (y: number) => bbox.minY + (maxY - y);

  const pos = new Map<string, Pos>();
  for (const [id, p] of posRaw) pos.set(id, { x: p.x, y: flipY(p.y) });

  // ---- 4) Icons laden ----
  const icons = await loadIconsFor(nodes);

  // ---- 5) Optionale Marker ----
  const defs = withArrow
    ? `<defs>
         <marker id="arrow" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto" refX="8" refY="4">
           <path d="M0,0 L8,4 L0,8 z" fill="${edgeColor}"/>
         </marker>
       </defs>`
    : "";

  // ---- 6) Primitives (mit identischem Wrap) ----
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
    maxTextWidth,
  });

  // ---- 7) Background + Debug ----
  const bg =
    background === "white"
      ? `<rect x="${bbox.minX}" y="${bbox.minY}" width="${bbox.width}" height="${bbox.height}" fill="#ffffff"/>`
      : "";

  const dbg = debug
    ? `<rect x="${bbox.minX}" y="${bbox.minY}" width="${bbox.width}" height="${bbox.height}" fill="none" stroke="#f36" stroke-dasharray="4 3" stroke-width="1"/>`
    : "";

  // ---- 8) Sicherer viewBox (1px Rand) ----
  const vbX = bbox.minX - 1;
  const vbY = bbox.minY - 1;
  const vbW = bbox.width + 2;
  const vbH = bbox.height + 2;

  return `<svg xmlns="http://www.w3.org/2000/svg"
               width="${bbox.width}" height="${bbox.height}"
               viewBox="${vbX} ${vbY} ${vbW} ${vbH}"
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
