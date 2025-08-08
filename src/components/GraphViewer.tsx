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
  }, [JSON.stringify(selectedTerms)]);

  const handleNodeDoubleClick = async (nodeId: string) => {
    try {
      //get all connected edges
      const connectedEdges = edges.filter(
        (e) => e.source === nodeId || e.target === nodeId,
      );
      //get id of the other node
      const neighborIds = connectedEdges.map((e) =>
        e.source === nodeId ? e.target : e.source,
      );
      const existingNeighborId = neighborIds[0];
      setLastNeighborId(existingNeighborId);
      const { nodes: neighborNodes, edges: neighborEdges } =
        await fetchNeighbors(nodeId);
      updateGraphElements(neighborNodes, neighborEdges);
    } catch (err) {
      console.error("Fehler beim Nachladen der Nachbarn:", err);
    }
  };

  return (
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border border-[var(--border)] p-1">
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
