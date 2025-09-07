"use client";

import { useCallback } from "react";
import { useStore } from "@/store/useStore";
import type { GraphNode, GraphEdge } from "@/types/graph";
// Falls dein Store-Pos-Typ kompatibel ist, kannst du ihn lassen.
// Wichtig ist nur: { x: number; y: number }
import type { Pos } from "@/store/slices/graphSlice";
import { buildSvgFromGraph, type SvgExportOptions } from "@/svgExport";
import { NODE_R, FONT_PX, MAX_W } from "@/graph/label-metrics";

async function awaitAllPositions(
  nodes: GraphNode[],
  getPos: () => Map<string, Pos> | undefined,
  maxFrames = 240, // ↑ mehr Zeit bei großen Graphen
): Promise<Map<string, Pos> | undefined> {
  let frames = 0;
  return new Promise((resolve) => {
    function tick() {
      const pos = getPos();
      if ((pos?.size ?? 0) >= nodes.length || frames >= maxFrames) {
        resolve(pos);
        return;
      }
      frames += 1;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ★ Wichtig: overscan in PX (2–4) + extraBottom hinzufügen
const DEFAULT_EXPORT_OPTS: SvgExportOptions = {
  background: "transparent",
  padding: 24,
  iconSize: NODE_R * 2,
  nodeRadius: NODE_R,
  fontSize: FONT_PX,
  maxTextWidth: MAX_W,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto", // wie Viewer
  edgeColor: "#9bbcff",
  edgeWidth: 1.25,
  labelBg: false,
  overscan: 3, // war 1.08 → praktisch 0; nimm 2–4 px
  extraBottom: 20, // NEU: zusätzlicher Unterrand gegen Cutoff
  debug: false,
};

export function useSvgExport() {
  const nodes = useStore((s) => s.nodes as GraphNode[]);
  const edges = useStore((s) => s.edges as GraphEdge[]);
  const getPos = () => useStore.getState().pos as Map<string, Pos> | undefined;

  const exportSvg = useCallback(
    async (userOpts?: SvgExportOptions): Promise<boolean> => {
      const opts: SvgExportOptions = { ...DEFAULT_EXPORT_OPTS, ...userOpts };

      const firstPos = getPos();
      console.log("export sanity (pre-wait)", {
        nodes: nodes.length,
        edges: edges.length,
        posSize: firstPos?.size ?? 0,
        missing: nodes.filter((n) => !firstPos?.has(n.id)).map((n) => n.id),
      });

      const pos = await awaitAllPositions(nodes ?? [], getPos, 240);

      const afterPos = pos ?? new Map();
      console.log("export sanity (post-wait)", {
        nodes: nodes.length,
        edges: edges.length,
        posSize: afterPos.size,
        missing: nodes.filter((n) => !afterPos.has(n.id)).map((n) => n.id),
      });

      const svg = await buildSvgFromGraph(nodes ?? [], edges ?? [], pos, opts);
      if (!svg) return false;

      const name = (opts?.fileName ?? "subgraph.svg").replace(/\s+/g, "_");
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    },
    [nodes, edges],
  );

  return { exportSvg };
}
