"use client";

import { GraphCanvas, GraphCanvasRef, lightTheme } from "reagraph";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useStore } from "@/store/useStore";
import { useGraphApi } from "@/hooks/useGraphApi";
import { useGraphElements } from "@/hooks/useGraphElements";
import { CustomNode } from "@/components/CustomNode";
import { prepareNodes } from "@/graph/prepareNodes";
import { buildDisplayName } from "@/graph/label-metrics";
import { tokens } from "@/theme/tokens";
import Image from "next/image";
import { uiIconMap } from "@/constants/label";
import type { GraphNode, GraphEdge } from "@/types/graph";

type Props = {
  onChangeNode?: (node: NodeWithCollision<BaseNode>) => void;
};

export const GraphViewer = ({ onChangeNode }: Props) => {
  const selectedTerms = useStore((state) => state.selectedTerms);
  const selectedTypes = useStore((state) => state.selectedTypes);
  const selectedHops = useStore((state) => state.selectedHops);
  const showOnlyEdges = useStore((state) => state.showOnlyEdges);
  const { fetchGraphData, fetchNeighbors } = useGraphApi();
  const { nodes, edges, updateGraphElements } = useGraphElements();
  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // Daten laden
  useEffect(() => {
    const load = async () => {
      const hasTerms = Object.values(selectedTerms).flat().length > 0;
      if (!hasTerms) {
        updateGraphElements([], []);
        return;
      }
      try {
        const { nodes: newNodes, edges: newEdges } = await fetchGraphData(
          selectedTerms,
          selectedTypes,
          selectedHops,
          showOnlyEdges,
        );
        updateGraphElements(newNodes, newEdges);
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

  // Double-Click → Nachbarn
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        const neighborIds = edges
          .filter((e: Edge) => e.source === nodeId || e.target === nodeId)
          .map((e: Edge) => (e.source === nodeId ? e.target : e.source));

        setLastNeighborId(neighborIds[0] ?? null);

        const { nodes: neighborNodes, edges: neighborEdges } =
          await fetchNeighbors(
            nodeId,
            selectedHops,
            selectedTypes,
            showOnlyEdges,
          );
        updateGraphElements(neighborNodes, neighborEdges);

        // nachladen -> auf den Knoten zentrieren und fitten
        // graphRef.current?.centerGraph([nodeId]);
        // graphRef.current?.fitNodesInView([nodeId]);
      } catch (err) {
        console.error("error while loading neighbors:", err);
      }
    },
    [edges, fetchNeighbors, updateGraphElements],
  );

  const handleNodeClick = useCallback(
    (node: NodeWithCollision<BaseNode>) => {
      onChangeNode?.(node);
    },
    [onChangeNode],
  );

  // Rohknoten -> vorbereitete Knoten (mit collisionRadius + nameForLabel)
  const preppedNodes = useMemo(() => prepareNodes(nodes), [nodes]);

  const theme = {
    ...lightTheme,
    edge: {
      ...lightTheme.edge,
      fill: tokens.edge,
      activeFill: tokens.edge,
    },
  };

  type EdgeIn = GraphEdge & {
    source: string | { id: string };
    target: string | { id: string };
  };
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

  return (
    <div className="relative flex h-[65dvh] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1 md:h-full">
      <button
        className="absolute top-2 left-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] hover:cursor-pointer hover:bg-[var(--color-mark)]/10 focus-visible:outline-2 focus-visible:outline-[var(--color-mark)]"
        aria-hidden
        onClick={() =>
          fetchGraphData(
            selectedTerms,
            selectedTypes,
            selectedHops,
            showOnlyEdges,
          )
        }
      >
        <span className="relative block h-6 w-6">
          <Image
            src={uiIconMap.Rewind} // "/icons/rewind.svg"
            alt="zurück"
            fill
            color={tokens.node}
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
        // layoutType="force"
        labelType="hidden"
        draggable
        renderNode={({ node }) => {
          return (
            <CustomNode
              node={node as GraphNode}
              isHighlighted={node.id === lastNeighborId}
            />
          );
        }}
        onNodeDoubleClick={(node) => handleNodeDoubleClick(node.id)}
        onNodeClick={(node) => {
          handleNodeClick(node);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
