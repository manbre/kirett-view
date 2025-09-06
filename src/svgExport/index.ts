"use client";

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

  // -------- options (tiny + explicit) --------
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

  // 1) positions + icons (raw positions, as reported by viewer or fallback)
  //    EN: Erst Roh-Positionen bestimmen (keine Spiegelung).
  //    DE: Zuerst Roh-Positionen bestimmen (noch ohne Flip).
  const posRaw = resolvePositions(nodes, posMap);

  // 2) bbox aus Rohkoordinaten ermitteln (damit width/height stimmen)
  //    EN: Compute bbox from *raw* coords so width/height are correct.
  const { minX, minY, maxY, width, height } = (() => {
    const b = computeBBox(nodes, posRaw, iconSize, fontSize, padding);
    // wir brauchen zusätzlich maxY für den Flip; height = maxY - minY (+padding)
    return { ...b, maxY: b.minY + b.height };
  })();

  // 3) Y-Achse spiegeln (Canvas: y↑ / SVG: y↓)
  //    EN: Flip Y so exported SVG matches what you see in the viewer.
  //    DE: Y so spiegeln, dass der Export so aussieht wie im Viewer.
  //    Formel: y' = minY + (maxY - y)  <=>  y' = (minY + maxY) - y
  const flippedPos = new Map<string, Pos>();
  const yFlip = (y: number) => minY + (maxY - y);
  for (const [id, p] of posRaw) {
    flippedPos.set(id, { x: p.x, y: yFlip(p.y) });
  }

  // 4) Icons laden, die im aktuellen Graph tatsächlich gebraucht werden
  const icons = await loadIconsFor(nodes);

  // 5) optional <defs> (Pfeilspitzen)
  const defs = withArrow
    ? `<defs>
         <marker id="arrow" markerUnits="strokeWidth" markerWidth="8" markerHeight="8" orient="auto" refX="8" refY="4">
           <path d="M0,0 L8,4 L0,8 z" fill="${edgeColor}"/>
         </marker>
       </defs>`
    : "";

  // 6) Edges & Nodes serialisieren — jetzt mit **geflippten** Positionen
  const edgesSvg = edgesToSvg(edges, flippedPos, {
    edgeColor,
    edgeWidth,
    trimAtNode: true,
    iconRadius: nodeRadius,
    arrowMarker: withArrow ? "url(#arrow)" : undefined,
  });

  const nodesSvg = nodesToSvg(nodes, flippedPos, icons, {
    iconSize,
    nodeRadius,
    fontSize,
    fontFamily,
    iconColor,
    labelBg,
    textColor: "#111",
  });

  // 7) Hintergrund + Debug
  const bg =
    background === "white"
      ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />`
      : "";

  const dbg = debug
    ? `<rect x="${minX}" y="${minY}" width="${width}" height="${height}"
              fill="none" stroke="#f36" stroke-dasharray="4 3" stroke-width="1"/>`
    : "";

  // 8) Finale SVG (viewBox deckt exakt den Inhalt → nichts abgeschnitten)
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
