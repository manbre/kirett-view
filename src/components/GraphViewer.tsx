"use client";
// GraphViewer
// Renders the interactive graph (nodes/edges) and reacts to filter changes.
// Loads subgraphs and neighbor-expansions via API hooks and preserves
// node positions on drag to support high-quality SVG export.

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
import type { GraphEdge } from "@/types/graph";

// Normalize edges that may carry { id } objects
type EdgeIn = GraphEdge & {
  source: string | { id: string };
  target: string | { id: string };
};

type Props = {
  onChangeNode?: (nodeId: string) => void;
};

export const GraphViewer = ({ onChangeNode }: Props) => {
  // Read filters and graph data from the store
  // -------- Filter/Topologie aus Slices --------
  const selectedTerms = useStore((s) => s.selectedTerms);
  const selectedTypes = useStore((s) => s.selectedTypes);
  const selectedHops = useStore((s) => s.selectedHops);
  const showOnlyEdges = useStore((s) => s.showOnlyEdges);

  // -------- Graph Slice (root) --------
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setGraph = useStore((s) => s.setGraph);
  const setNodePos = useStore((s) => s.setNodePos);

  const { fetchGraphData, fetchNeighbors } = useGraphApi();

  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // Load subgraph whenever filters change
  useEffect(() => {
    const load = async () => {
      const hasTerms = Object.values(selectedTerms).flat().length > 0;
      if (!hasTerms) {
        setGraph([], []);
        return;
      }
      try {
        const { nodes: newNodes, edges: newEdges } = await fetchGraphData(
          selectedTerms,
          selectedTypes,
          selectedHops,
          showOnlyEdges,
        );
        setGraph(newNodes, newEdges);
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
  ]);

  // Double-click: expand neighbors and replace the current view
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        // (Optional) light UI feedback: remember the first neighbor id
        const neighborIds = edges
          .filter((e: GraphEdge) => e.source === nodeId || e.target === nodeId)
          .map((e: GraphEdge) => (e.source === nodeId ? e.target : e.source));
        setLastNeighborId(neighborIds[0] ?? null);

        const { nodes: neighborNodes, edges: neighborEdges } =
          await fetchNeighbors(
            nodeId,
            selectedHops,
            selectedTypes,
            showOnlyEdges,
          );

        // Replace the view with expanded neighborhood (no merge)
        setGraph(neighborNodes, neighborEdges);
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
      setGraph,
    ],
  );

  // Single-click: notify external listener (e.g. details panel)
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
      (edges as readonly EdgeIn[]).map((e) => ({
        ...e,
        source: typeof e.source === "string" ? e.source : e.source.id,
        target: typeof e.target === "string" ? e.target : e.target.id,
        size: 2,
      })),
    [edges],
  );

  const theme = {
    ...lightTheme,
    edge: { ...lightTheme.edge, fill: tokens.edge, activeFill: tokens.edge },
  };

  // Persist node positions on drag for correct SVG export placement
  const handleNodeDragged = (n: InternalGraphNode) => {
    setNodePos(n.id, n.position.x, n.position.y);
  };

  return (
    <div className="relative flex h-[65dvh] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1 md:h-full">
      <GraphCanvas
        ref={graphRef}
        nodes={preppedNodes}
        edges={canvasEdges}
        theme={theme}
        edgeArrowPosition="none"
        layoutType="forceDirected2d"
        labelType="hidden"
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
