"use client";

import { GraphCanvas } from "reagraph";
import { useEffect } from "react";
import { useTermStore } from "@/store/useTermStore";
import { CustomNode } from "@/components/CustomNode";
import { useGraphApi } from "@/hooks/useGraphApi";
import { useGraphElements } from "@/hooks/useGraphElements";

export const GraphViewer = () => {
  const selectedTermsObj = useTermStore((state) => state.selectedTerms);
  const selectedTerms = Object.values(selectedTermsObj).flat();

  const { fetchGraphData } = useGraphApi();
  const {
    nodes,
    edges,
    loadedTermsRef,
    addGraphElements,
    removeDisconnectedElements,
  } = useGraphElements();

  useEffect(() => {
    if (selectedTerms.length === 0) {
      loadedTermsRef.current = [];
      removeDisconnectedElements([]);
      return;
    }

    const prevTerms = loadedTermsRef.current;
    const added = selectedTerms.filter((t) => !prevTerms.includes(t));
    const removed = prevTerms.filter((t) => !selectedTerms.includes(t));

    if (removed.length > 0) {
      removeDisconnectedElements(selectedTerms);
    }

    if (added.length === 0) {
      loadedTermsRef.current = selectedTerms;
      return;
    }

    // 🧠 Bei Änderungen Begriffe → API aufrufen
    fetchGraphData(selectedTermsObj)
      .then((data) => {
        addGraphElements(data.nodes, data.edges);
        loadedTermsRef.current = selectedTerms;
      })
      .catch((err) => {
        console.error("Graph-Ladefehler:", err);
      });
  }, [selectedTerms.join(",")]); // join zur Vergleichbarkeit

  return (
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border border-[var(--border)] p-1">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        labelType="none"
        draggable
        renderNode={({ node }) => <CustomNode node={node} />}
        onNodeClick={(node) => {
          console.log("Geklickter Knoten:", node);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
