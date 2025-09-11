"use client";
// Interactive graph canvas that reacts to filters and expansions.

import {
  GraphCanvas,
  GraphCanvasRef,
  lightTheme,
  type InternalGraphNode,
} from "reagraph";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useGraphApi } from "@/hooks/useGraphApi";
import { CustomNode } from "@/components/CustomNode";
import { prepareNodes } from "@/graphUtils/prepareNodes";
import { tokens } from "@/theme/tokens";
import { FONT_PX } from "@/graphUtils/labelMetrics";
import type { GraphEdge } from "@/types/graph";

// Normalize edges that may carry { id } objects
type EdgeIn = GraphEdge & {
  source: string | { id: string };
  target: string | { id: string };
};

type Props = {
  onChangeNode?: (nodeId: string) => void;
};

// GraphViewer: renders the graph and handles term/neighbors view logic
export const GraphViewer = ({ onChangeNode }: Props) => {
  // Read filters and graph data from the store
  // -------- Filter/Topologie aus Slices --------
  const selectedTerms = useStore((s) => s.selectedTerms);
  const selectedTypes = useStore((s) => s.selectedTypes);
  const selectedHops = useStore((s) => s.selectedHops);
  const showOnlyEdges = useStore((s) => s.showOnlyEdges);
  const clearTerms = useStore((s) => s.clearTerms);

  // -------- Graph Slice (root) --------
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setGraph = useStore((s) => s.setGraph);
  const setNodePos = useStore((s) => s.setNodePos);

  const { fetchGraphData, fetchNeighbors } = useGraphApi();

  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);
  const [view, setView] = useState<
    | { mode: "terms"; anchorId?: undefined }
    | { mode: "neighbors"; anchorId: string }
  >({ mode: "terms" });
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // Load either term subgraph or neighbor expansion based on local mode
  useEffect(() => {
    const load = async () => {
      try {
        if (view.mode === "neighbors") {
          // In neighbors mode: reload anchor (replace) then optionally merge terms
          await fetchNeighbors(
            view.anchorId,
            selectedHops,
            selectedTypes,
            showOnlyEdges,
            { apply: "set" },
          );
          const hasTerms = Object.values(selectedTerms).flat().length > 0;
          if (hasTerms) {
            await fetchGraphData(
              selectedTerms,
              selectedTypes,
              selectedHops,
              showOnlyEdges,
              { apply: "merge" },
            );
          }
        } else {
          // In terms mode: load only if terms exist; otherwise clear
          const hasTerms = Object.values(selectedTerms).flat().length > 0;
          if (!hasTerms) {
            setGraph([], []);
            return;
          }
          await fetchGraphData(
            selectedTerms,
            selectedTypes,
            selectedHops,
            showOnlyEdges,
            { apply: "set" },
          );
        }
      } catch (err) {
        console.error("graph loading error:", err);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedTerms),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedTypes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedHops),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(showOnlyEdges),
    // Wechsel im lokalen View-State (Mode/Anchor) soll nachladen
    view,
  ]);

  // Double-click: expand neighbors and switch to neighbors mode
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        // (Optional) light UI feedback: remember the first neighbor id
        const neighborIds = edges
          .filter((e: GraphEdge) => e.source === nodeId || e.target === nodeId)
          .map((e: GraphEdge) => (e.source === nodeId ? e.target : e.source));
        setLastNeighborId(neighborIds[0] ?? null);

        await fetchNeighbors(
          nodeId,
          selectedHops,
          selectedTypes,
          showOnlyEdges,
        );
        // Switch to neighbors mode and remember anchor
        setView({ mode: "neighbors", anchorId: nodeId });
        // Clear terms to avoid parallel term loads
        clearTerms();
      } catch (err) {
        console.error("error while loading neighbors:", err);
      }
    },
    [
      edges,
      fetchNeighbors,
      selectedHops,
      selectedTypes,
      showOnlyEdges,
      clearTerms,
    ],
  );

  // Single-click: notify external listener (e.g., details panel)
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      onChangeNode?.(nodeId);
    },
    [onChangeNode],
  );

  // Prepare nodes (collision radius, display label, size lift)
  const preppedNodes = useMemo(() => prepareNodes(nodes), [nodes]);

  // Normalize edges to string ids for the canvas
  const canvasEdges = useMemo(
    () =>
      (edges as readonly EdgeIn[]).map((e) => {
        const src = typeof e.source === "string" ? e.source : e.source.id;
        const tgt = typeof e.target === "string" ? e.target : e.target.id;

        // Edge label rule: only keep labels that contain "yes" or "no" (case-insensitive)
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
          // blank label hides it in reagraph (labelVisible && label && ...)
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
      // Keep edge opacity constant to avoid hover/selection flicker on labels
      opacity: lightTheme.edge.opacity,
      selectedOpacity: lightTheme.edge.opacity,
      inactiveOpacity: lightTheme.edge.opacity,
      label: {
        ...lightTheme.edge.label,
        fontSize: FONT_PX,
        // Match design color for edge labels and disable hover color change
        color: tokens.mark,
        activeColor: tokens.mark,
      },
    },
  } as const;

  // Persist node positions on drag (for correct SVG export)
  const handleNodeDragged = (n: InternalGraphNode) => {
    setNodePos(n.id, n.position.x, n.position.y);
  };

  return (
    <div className="relative flex h-[65dvh] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1 md:h-full">
      {/* Floating Reset button to switch back to terms mode */}
      {view.mode === "neighbors" && (
        <div className="pointer-events-none absolute top-2 left-2 z-10">
          <button
            type="button"
            className="pointer-events-auto rounded-md border border-[var(--color-border)] bg-white/90 px-3 py-1 text-sm shadow-sm hover:cursor-pointer hover:bg-white"
            onClick={() => {
              setView({ mode: "terms" });
              setLastNeighborId(null);
            }}
            title="Back to term view"
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
        // Always show edge labels (nodes handled by CustomNode)
        labelType="edges"
        edgeLabelPosition="inline"
        edgeArrowPosition="none"
        layoutType="forceDirected2d"
        draggable
        onNodeDragged={handleNodeDragged}
        renderNode={({ node }) => (
          <CustomNode
            // CustomNode expects id/x/y and the prepared node
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
