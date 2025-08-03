"use client";

import { GraphCanvas } from "reagraph";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import { CustomNode } from "@/components/CustomNode";
import { useGraphApi } from "@/hooks/useGraphApi";
import { useGraphElements } from "@/hooks/useGraphElements";

export const GraphViewer = () => {
  const selectedTermsObj = useStore((state) => state.selectedTerms);
  const selectedTerms = Object.values(selectedTermsObj).flat();

  const { fetchGraphDelta } = useGraphApi();
  const { nodes, edges, removeUnlistedIds, loadedTermsRef } =
    useGraphElements();

  useEffect(() => {
    const termsChanged =
      JSON.stringify(loadedTermsRef.current) !== JSON.stringify(selectedTerms);

    if (!termsChanged) return;

    if (selectedTerms.length === 0) {
      removeUnlistedIds([], []);
      loadedTermsRef.current = [];
      return;
    }

    fetchGraphDelta(selectedTermsObj)
      .then(({ nodeIds, edgeIds }) => {
        removeUnlistedIds(nodeIds, edgeIds);
        loadedTermsRef.current = selectedTerms;
      })
      .catch((err) => {
        console.error("Graph-Ladefehler:", err);
      });
  }, [selectedTermsObj]);

  return (
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border-1 border-[var(--border)] p-1">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        labelType="none"
        draggable
        renderNode={({ node }) => <CustomNode node={node} />}
        onNodeClick={(node) => {
          console.log("Geklickter Knoten:", node.data?.labels?.[0]);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
