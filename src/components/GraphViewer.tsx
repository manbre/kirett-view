"use client";

import { GraphCanvas } from "reagraph";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useGraphApi } from "@/hooks/useGraphApi";
import { useGraphElements } from "@/hooks/useGraphElements";
import { CustomNode } from "@/components/CustomNode";

export const GraphViewer = () => {
  const selectedTerms = useStore((state) => state.selectedTerms);
  const { fetchGraphData, fetchNeighbors } = useGraphApi();
  const { nodes, edges, updateGraphElements } = useGraphElements();
  const [lastNeighborId, setLastNeighborId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (Object.values(selectedTerms).flat().length === 0) {
        updateGraphElements([], []);
        return;
      }

      try {
        const { nodes: newNodes, edges: newEdges } =
          await fetchGraphData(selectedTerms);
        updateGraphElements(newNodes, newEdges);
      } catch (err) {
        console.error("graph loading error:", err);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedTerms)]);

  const handleNodeDoubleClick = async (nodeId: string) => {
    try {
      //get all connected edges
      const neighborIds = edges
        .filter((edge) => edge.source === nodeId || edge.target === nodeId)
        .map((edge) => (edge.source === nodeId ? edge.target : edge.source));
      const existingNeighborId = neighborIds[0];
      setLastNeighborId(existingNeighborId);

      const { nodes: neighborNodes, edges: neighborEdges } =
        await fetchNeighbors(nodeId);
      updateGraphElements(neighborNodes, neighborEdges);
    } catch (err) {
      console.error("error while loading neighbors:", err);
    }
  };

  return (
    <div className="bg-fore relative h-[60dvh] w-full overflow-hidden rounded-xl border border-[var(--border)] p-1 md:h-full">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        labelType="none"
        draggable
        renderNode={({ node }) => (
          <CustomNode node={node} isHighlighted={node.id === lastNeighborId} />
        )}
        onNodeDoubleClick={(node) => handleNodeDoubleClick(node.id)}
        onNodeClick={(node) => {
          console.log("Knoten geklickt:", node);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
