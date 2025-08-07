"use client";

import { GraphCanvas } from "reagraph";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useGraphApi } from "@/hooks/useGraphApi";
import { useGraphElements } from "@/hooks/useGraphElements";
import { CustomNode } from "@/components/CustomNode";

export const GraphViewer = () => {
  const selectedTerms = useStore((state) => state.selectedTerms);
  const { fetchGraphData } = useGraphApi();
  const { nodes, edges, updateGraphElements } = useGraphElements();

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
        console.error("Graph-Ladefehler:", err);
      }
    };

    load();
  }, [JSON.stringify(selectedTerms)]);

  return (
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border border-[var(--border)] p-1">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        labelType="none"
        draggable
        renderNode={({ node }) => <CustomNode node={node} />}
        onNodeClick={(node) => {
          console.log("Knoten geklickt:", node);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
