"use client";

import {
  GraphCanvas,
  GraphCanvasRef,
  lightTheme,
  type InternalGraphNode,
} from "reagraph";
import { useState, useCallback, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useGraphController } from "@/hooks/useGraphController";
import { CustomNode } from "@/components/CustomNode";
import { prepareNodes } from "@/graphUtils/prepareNodes";
import { tokens } from "@/theme/tokens";
import { FONT_PX } from "@/graphUtils/labelMetrics";
import type { GraphEdge } from "@/types/graph";

// normalize edges that may carry { id } objects
type EdgeIn = GraphEdge & {
  source: string | { id: string };
  target: string | { id: string };
};

//
// renders the graph and handles term/neighbors view logic
export const GraphViewer = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setNodePos = useStore((s) => s.setNodePos);
  const { view, resetToTerms, openNeighbors } = useGraphController();

  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // prepare nodes (collision radius, display label, space)
  const preppedNodes = useMemo(() => prepareNodes(nodes), [nodes]);

  // double click: expand neighbors and switch to neighbors mode
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        // remember the first neighbor id
        const neighborIds = edges
          .filter((e: GraphEdge) => e.source === nodeId || e.target === nodeId)
          .map((e: GraphEdge) => (e.source === nodeId ? e.target : e.source));
        setLastNeighborId(neighborIds[0] ?? null);

        await openNeighbors(nodeId);
      } catch (err) {
        console.error("error while loading neighbors:", err);
      }
    },
    [edges, openNeighbors],
  );

  // single-click
  const handleNodeClick = () => {};

  // node positions on drag (for correct SVG export)
  const handleNodeDragged = (n: InternalGraphNode) => {
    setNodePos(n.id, n.position.x, n.position.y);
  };

  // normalize edges to string ids for canvas
  const canvasEdges = useMemo(
    () =>
      (edges as readonly EdgeIn[]).map((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;

        // only keep labels that contain "yes" or "no"
        const label = typeof e.label === "string" ? e.label : "";
        const lower = label.toLowerCase();
        const allowed = lower.includes("yes") || lower.includes("no");
        const hideLabel = !allowed;

        return {
          ...e,
          source: src,
          target: tgt,
          // keep a consistent visual weight
          size: 2,
          // blank label for hiding
          label: hideLabel ? "" : label,
        };
      }),
    [edges],
  );

  const theme = {
    ...lightTheme,
    edge: {
      ...lightTheme.edge,
      fill: tokens.edge,
      activeFill: tokens.edge,
      opacity: lightTheme.edge.opacity, // keep it constant to avoid hover/selection flicker
      selectedOpacity: lightTheme.edge.opacity,
      inactiveOpacity: lightTheme.edge.opacity,
      label: {
        ...lightTheme.edge.label,
        fontSize: FONT_PX,
        color: tokens.mark,
        activeColor: tokens.mark,
      },
    },
  } as const;

  return (
    <div className="relative flex h-[65dvh] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1 md:h-full">
      {/* floating reset button to switch back to terms mode */}
      {view.mode === "neighbors" && (
        <div className="pointer-events-none absolute top-2 left-2 z-10">
          <button
            type="button"
            className="pointer-events-auto rounded-md border border-[var(--color-border)] bg-white/90 px-3 py-1 text-sm shadow-sm hover:cursor-pointer hover:bg-white"
            onClick={() => {
              resetToTerms();
              setLastNeighborId(null);
            }}
            title="Navigation zurücksetzen"
          >
            Reset
          </button>
        </div>
      )}
      <GraphCanvas
        ref={graphRef}
        nodes={preppedNodes}
        edges={canvasEdges}
        theme={theme}
        labelType="edges"
        edgeLabelPosition="inline"
        edgeArrowPosition="none"
        layoutType="forceDirected2d"
        draggable
        onNodeDragged={handleNodeDragged}
        renderNode={({ node }) => (
          <CustomNode
            // customNode expects id/x/y and the prepared node
            node={node as unknown as Parameters<typeof CustomNode>[0]["node"]}
            isHighlighted={node.id === lastNeighborId}
            id={node.id}
            x={node.position.x}
            y={node.position.y}
          />
        )}
        onNodeDoubleClick={(node) => handleNodeDoubleClick(node.id)}
        onNodeClick={(node) => handleNodeClick(node.id)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
