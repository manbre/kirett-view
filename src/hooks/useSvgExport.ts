"use client";

import { useCallback } from "react";
import { useStore } from "@/store/useStore";
import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Store } from "@/store/useStore";
import { buildSvgFromGraph, type SvgExportOptions } from "@/svgExport";
import { NODE_R, FONT_PX, MAX_W } from "@/graphUtils/labelMetrics";
import { tokens } from "@/theme/tokens";

type Pos = Store["pos"] extends Map<string, infer P> ? P : never;

// wait until all/most positions are known (or a frame limit is reached)
async function awaitAllPositions(
  nodes: GraphNode[],
  getPos: () => Map<string, Pos> | undefined,
  maxFrames = 240,
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

// defaults: white background, generous overscan, y-flip enabled
const DEFAULT_EXPORT_OPTS: SvgExportOptions = {
  background: "white",
  padding: 24,
  iconSize: NODE_R * 2,
  nodeRadius: NODE_R,
  fontSize: FONT_PX,
  maxTextWidth: MAX_W,
  edgeColor: "tokens.edge",
  edgeWidth: 1.25,
  labelBg: true,
  overscan: 24,
  extraBottom: 24,
  arrow: false,
  debug: false,
  flipY: true, // important: coordinate system alignment
};

//
// builds a SVG snapshot from the current graph state
// waits for node positions to be reported by the viewer, then serializes
// nodes and edges using the same font metrics and label wrapping as the UI
export function useSvgExport() {
  const nodes = useStore((s) => s.nodes as GraphNode[]);
  const edges = useStore((s) => s.edges as GraphEdge[]);
  const getPos = () => useStore.getState().pos as Map<string, Pos> | undefined;

  const exportSvg = useCallback(
    async (userOpts?: Partial<SvgExportOptions>): Promise<boolean> => {
      const opts: SvgExportOptions = {
        ...DEFAULT_EXPORT_OPTS,
        ...(userOpts ?? {}),
      };

      const firstPos = getPos();
      console.log("export sanity (pre-wait)", {
        nodes: nodes.length,
        edges: edges.length,
        posSize: firstPos?.size ?? 0,
        missing: nodes.filter((n) => !firstPos?.has(n.id)).map((n) => n.id),
      });

      const pos = await awaitAllPositions(nodes ?? [], getPos, 120);

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
