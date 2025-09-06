"use client";

import { useCallback } from "react";
import { useStore } from "@/store/useStore";
import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Pos } from "@/store/slices/graphSlice";
import { buildSvgFromGraph, type SvgExportOptions } from "@/svgExport";

async function awaitAllPositions(
  nodes: GraphNode[],
  getPos: () => Map<string, Pos> | undefined,
  maxFrames = 120, // ~2s
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

export function useSvgExport() {
  const nodes = useStore((s) => s.nodes as GraphNode[]);
  const edges = useStore((s) => s.edges as GraphEdge[]);
  const getPos = () => useStore.getState().pos as Map<string, Pos> | undefined;

  const exportSvg = useCallback(
    async (opts?: SvgExportOptions): Promise<boolean> => {
      // Debug: wie viele fehlen noch?
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
