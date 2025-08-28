import { useCallback, useRef } from "react";
import type { RefObject } from "react";
import type { GraphNode, GraphEdge } from "@/types/graph";
import type { GraphCanvasRef } from "reagraph";

type EdgeIn = GraphEdge & {
  source: string | { id: string };
  target: string | { id: string };
  size?: number; // optional: Kantendicke
};

export type SvgExportOptions = {
  nodeRadius?: number;
  fontSize?: number;
  labelOffsetY?: number;
  edgeColor?: string;
  edgeWidth?: number;
  arrowColor?: string;
  background?: string | null; // null = transparent
  padding?: number;
  fontFamily?: string;
};

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function useGraphExport(
  canvasRef: RefObject<GraphCanvasRef | null>,
  getLabelText?: (n: GraphNode) => string,
) {
  // sammelt aktuelle Node-Positionen
  const posRef = useRef<Map<string, { x: number; y: number; label: string }>>(
    new Map(),
  );

  /** Im renderNode aufrufen, um x/y+Label zu merken */
  const collectNode = useCallback(
    (node: GraphNode & { x?: number; y?: number }) => {
      if (typeof node.x === "number" && typeof node.y === "number") {
        const label = getLabelText ? getLabelText(node) : node.label;
        posRef.current.set(node.id, { x: node.x, y: node.y, label });
      }
    },
    [getLabelText],
  );

  /** optional, z. B. nach neuem Fetch */
  const clearPositions = useCallback(() => posRef.current.clear(), []);

  /** Liefert das SVG als String (kannst du auch selbst speichern) */
  const buildSVG = useCallback(
    (edges: readonly EdgeIn[], opts?: SvgExportOptions): string => {
      const entries = Array.from(posRef.current.entries());
      if (!entries.length) return "";

      const o = {
        nodeRadius: opts?.nodeRadius ?? 12,
        fontSize: opts?.fontSize ?? 8,
        labelOffsetY: opts?.labelOffsetY ?? 10,
        edgeColor: opts?.edgeColor ?? "#6b7280",
        edgeWidth: opts?.edgeWidth ?? 2,
        arrowColor: opts?.arrowColor ?? "#6b7280",
        background: opts?.background ?? null,
        padding: opts?.padding ?? 24,
        fontFamily: opts?.fontFamily ?? "Inter, system-ui, sans-serif",
      };

      // ViewBox berechnen
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const [, { x, y }] of entries) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      const vbX = minX - o.padding;
      const vbY = minY - o.padding;
      const vbW = maxX - minX + 2 * o.padding;
      const vbH = maxY - minY + 2 * o.padding;

      const pos = new Map(posRef.current);
      const parts: string[] = [];

      parts.push(
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}" font-family="${esc(o.fontFamily)}">`,
        `<defs>`,
        `  <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">`,
        `    <path d="M0,0 L0,10 L10,5 z" fill="${o.arrowColor}"/>`,
        `  </marker>`,
        `</defs>`,
      );

      if (o.background) {
        parts.push(
          `<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="${o.background}"/>`,
        );
      }

      // Edges (source/target sicher auf IDs normalisieren)
      for (const e of edges) {
        const a = pos.get(
          typeof e.source === "string" ? e.source : e.source.id,
        );
        const b = pos.get(
          typeof e.target === "string" ? e.target : e.target.id,
        );
        if (!a || !b) continue;
        const w = e.size ?? o.edgeWidth;
        parts.push(
          `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${o.edgeColor}" stroke-width="${w}" marker-end="url(#arrow)"/>`,
        );
      }

      // Nodes + Labels
      for (const [, { x, y, label }] of entries) {
        parts.push(
          `<circle cx="${x}" cy="${y}" r="${o.nodeRadius}" fill="#7CA0AB"/>`,
          `<text x="${x}" y="${y + o.nodeRadius + o.labelOffsetY}" font-size="${o.fontSize}" text-anchor="middle" dominant-baseline="hanging" fill="#333">${esc(label)}</text>`,
        );
      }

      parts.push(`</svg>`);
      return parts.join("\n");
    },
    [],
  );

  /** Direkt herunterladen (SVG) */
  const downloadSVG = useCallback(
    (edges: readonly EdgeIn[], opts?: SvgExportOptions) => {
      const svg = buildSVG(edges, opts);
      if (!svg) return;
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "graph.svg";
      a.click();
      URL.revokeObjectURL(url);
    },
    [buildSVG],
  );

  /** Direkt herunterladen (PNG aus Canvas) */
  const downloadPNG = useCallback(() => {
    const dataUrl = canvasRef.current?.exportCanvas?.();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "graph.png";
    a.click();
  }, [canvasRef]);

  return { collectNode, clearPositions, buildSVG, downloadSVG, downloadPNG };
}
