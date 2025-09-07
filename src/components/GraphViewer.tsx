"use client";

import {
  GraphCanvas,
  GraphCanvasRef,
  lightTheme,
  type InternalGraphNode,
  type NodeWithCollision,
  type BaseNode,
} from "reagraph";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useGraphApi } from "@/hooks/useGraphApi";
import { CustomNode } from "@/components/CustomNode";
import { prepareNodes } from "@/graph/prepareNodes";
import { tokens } from "@/theme/tokens";
import Image from "next/image";
import { uiIconMap } from "@/constants/label";
import type { GraphNode, GraphEdge } from "@/types/graph";

// EN: Optional helper to normalize edges if some carry {id} objects.
// DE: Optionaler Helfer, falls Kanten teilweise {id}-Objekte enthalten.
type EdgeIn = GraphEdge & {
  source: string | { id: string };
  target: string | { id: string };
};

type Props = {
  onChangeNode?: (node: NodeWithCollision<BaseNode>) => void;
};

export const GraphViewer = ({ onChangeNode }: Props) => {
  // -------- filters/topology from other slices --------
  const selectedTerms = useStore((s) => s.selectedTerms);
  const selectedTypes = useStore((s) => s.selectedTypes);
  const selectedHops = useStore((s) => s.selectedHops);
  const showOnlyEdges = useStore((s) => s.showOnlyEdges);

  // -------- graph slice (flat on root) --------
  const nodes = useStore((s) => s.nodes); // GraphNode[]
  const edges = useStore((s) => s.edges); // GraphEdge[]
  const setGraph = useStore((s) => s.setGraph);
  const mergeGraph = useStore((s) => s.mergeGraph);
  const setNodePos = useStore((s) => s.setNodePos);

  const { fetchGraphData, fetchNeighbors } = useGraphApi();

  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // -------- load subgraph on filter changes (only in "subgraph" mode) --------
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
    JSON.stringify(selectedTerms),
    JSON.stringify(selectedTypes),
    JSON.stringify(selectedHops),
    JSON.stringify(showOnlyEdges),
  ]);

  // -------- double click: switch to "expand" and only use neighbors --------
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        setLastNeighborId(nodeId);

        const { nodes: neighborNodes, edges: neighborEdges } =
          await fetchNeighbors(
            nodeId,
            selectedHops,
            selectedTypes,
            showOnlyEdges,
          );

        // EN: Replace the view with the expanded neighborhood (no merge).
        // DE: Ansicht durch den expandierten Teilgraphen ERSETZEN (kein Merge).
        setGraph(neighborNodes, neighborEdges);

        // Optional zoom to the node (falls gewünscht)
        // graphRef.current?.centerGraph([nodeId]);
        // graphRef.current?.fitNodesInView([nodeId]);
      } catch (err) {
        console.error("error while loading neighbors:", err);
      }
    },
    [fetchNeighbors, selectedHops, selectedTypes, showOnlyEdges, setGraph],
  );

  const handleNodeClick = useCallback(
    (node: NodeWithCollision<BaseNode>) => {
      onChangeNode?.(node);
    },
    [onChangeNode],
  );

  // -------- prepared nodes (collision radius / display name etc.) --------
  const preppedNodes = useMemo(() => prepareNodes(nodes), [nodes]);

  // -------- normalize edges for the canvas --------
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

  // -------- dragging → keep positions for SVG export --------
  const handleNodeDragged = (n: InternalGraphNode) => {
    setNodePos(n.id, n.position.x, n.position.y);
  };

  // -------- UI: overlay button to go back to subgraph route --------
  const handleBackToSubgraph = useCallback(async () => {
    try {
      const { nodes: newNodes, edges: newEdges } = await fetchGraphData(
        selectedTerms,
        selectedTypes,
        selectedHops,
        showOnlyEdges,
      );
      setGraph(newNodes, newEdges);
      setLastNeighborId(null);
    } catch (err) {
      console.error("reload subgraph error:", err);
    }
  }, [
    fetchGraphData,
    selectedTerms,
    selectedTypes,
    selectedHops,
    showOnlyEdges,
    setGraph,
  ]);

  return (
    <div className="relative flex h-[65dvh] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1 md:h-full">
      <button
        className="hover: absolute top-2 left-2 z-20 inline-flex h-9 w-9 cursor-pointer items-center rounded-md border border-[var(--color-border)] bg-white px-1 shadow-sm hover:bg-[var(--color-mark)]/10 focus-visible:outline-2 focus-visible:outline-[var(--color-mark)]"
        onClick={handleBackToSubgraph}
        title="Zurück zur Subgraph-Ansicht"
        aria-label="Zurück zur Subgraph-Ansicht"
        type="button"
      >
        <span className="relative block h-7 w-7">
          <Image
            src={uiIconMap.Rewind}
            alt="zurück"
            fill
            className="pointer-events-none object-contain"
            priority
          />
        </span>
      </button>

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
            node={node as unknown as GraphNode}
            isHighlighted={node.id === lastNeighborId}
            id={node.id}
            x={node.position.x}
            y={node.position.y}
          />
        )}
        onNodeDoubleClick={(node) => handleNodeDoubleClick(node.id)}
        onNodeClick={(node) => {
          handleNodeClick(node);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
