"use client";

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

// Kanten ggf. { id }-Objekte normalisieren
type EdgeIn = GraphEdge & {
  source: string | { id: string };
  target: string | { id: string };
};

type Props = {
  onChangeNode?: (nodeId: string) => void;
};

export const GraphViewer = ({ onChangeNode }: Props) => {
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

  // -------- Subgraph laden, wenn Filter wechseln --------
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

  // -------- Doppelklick: Nachbarschaft (ersetzen) --------
  const handleNodeDoubleClick = useCallback(
    async (nodeId: string) => {
      try {
        // (Optional) ein bisschen UI-Feedback: merke dir den ersten Nachbarn
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

        // Ansicht komplett ersetzen
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

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      onChangeNode?.(nodeId);
    },
    [onChangeNode],
  );

  // -------- Nodes vorbereiten (Kollisionsradius, Displayname etc.) --------
  const preppedNodes = useMemo(() => prepareNodes(nodes), [nodes]);

  // -------- Edges normalisieren --------
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

  // -------- Dragging -> Positionen merken (für Export) --------
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
            // CustomNode benötigt id/x/y und den aufbereiteten Node
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
