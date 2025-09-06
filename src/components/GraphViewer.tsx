"use client";

import {
  GraphCanvas,
  GraphCanvasRef,
  lightTheme,
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

  // -------- graph slice (FLAT on root) --------
  const nodes = useStore((s) => s.nodes); // GraphNode[]
  const edges = useStore((s) => s.edges); // GraphEdge[]
  const setGraph = useStore((s) => s.setGraph); // (nodes,edges) -> void
  const mergeGraph = useStore((s) => s.mergeGraph); // (nodes,edges) -> void
  const setNodePos = useStore((s) => s.setNodePos); // (id,x,y) -> void

  const { fetchGraphData, fetchNeighbors } = useGraphApi();

  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);
  const graphRef = useRef<GraphCanvasRef | null>(null);

  // -------- load graph data on filter changes --------
  useEffect(() => {
    const load = async () => {
      const hasTerms = Object.values(selectedTerms).flat().length > 0;
      if (!hasTerms) {
        setGraph([], []); // DE: zentral leeren; EN: clear graph
        return;
      }
      try {
        const { nodes: newNodes, edges: newEdges } = await fetchGraphData(
          selectedTerms,
          selectedTypes,
          selectedHops,
          showOnlyEdges,
        );
        setGraph(newNodes, newEdges); // DE: zentral speichern; EN: write to store
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

  // -------- double click: expand neighbors --------
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        const neighborIds = (edges as readonly EdgeIn[])
          .filter(
            (e) =>
              (typeof e.source === "string" ? e.source : e.source.id) ===
                nodeId ||
              (typeof e.target === "string" ? e.target : e.target.id) ===
                nodeId,
          )
          .map((e) => {
            const s = typeof e.source === "string" ? e.source : e.source.id;
            const t = typeof e.target === "string" ? e.target : e.target.id;
            return s === nodeId ? t : s;
          });

        setLastNeighborId(neighborIds[0] ?? null);

        const { nodes: neighborNodes, edges: neighborEdges } =
          await fetchNeighbors(
            nodeId,
            selectedHops,
            selectedTypes,
            showOnlyEdges,
          );
        // EN: merge result into central graph (union by id)
        // DE: Ergebnis in zentralen Graph mergen (Vereinigung per ID)
        mergeGraph(neighborNodes, neighborEdges);

        // Optional: auf den Knoten zoomen/fokussieren
        // graphRef.current?.centerGraph([nodeId]);
        // graphRef.current?.fitNodesInView([nodeId]);
      } catch (err) {
        console.error("error while loading neighbors:", err);
      }
    },
    [
      edges,
      fetchNeighbors,
      mergeGraph,
      selectedHops,
      selectedTypes,
      showOnlyEdges,
    ],
  );

  const handleNodeClick = useCallback(
    (node: NodeWithCollision<BaseNode>) => {
      onChangeNode?.(node);
    },
    [onChangeNode],
  );

  // -------- compute prepared nodes for rendering (collision radius / display name etc.) --------
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

  return (
    <div className="relative flex h-[65dvh] w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1 md:h-full">
      <button
        className="absolute top-2 left-2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] hover:cursor-pointer hover:bg-[var(--color-mark)]/10 focus-visible:outline-2 focus-visible:outline-[var(--color-mark)]"
        aria-hidden
        onClick={() => {
          // EN: simple reload with same filters into store
          // DE: einfacher Reload mit denselben Filtern in den Store
          void fetchGraphData(
            selectedTerms,
            selectedTypes,
            selectedHops,
            showOnlyEdges,
          )
            .then(({ nodes: n, edges: e }) => setGraph(n, e))
            .catch((err) => console.error("reload error:", err));
        }}
      >
        <span className="relative block h-6 w-6">
          <Image
            src={uiIconMap.Rewind}
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
        layoutType="forceDirected2d" // EN: supported by reagraph; DE: wird unterstützt
        labelType="hidden"
        draggable
        onNodeDragged={(node) =>
          setNodePos(node.id, node.position.x, node.position.y)
        }
        renderNode={({ node }) => (
          <CustomNode
            node={node as unknown as GraphNode} // EN: pass raw data for label/icon mapping
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
