"use client";

import { GraphCanvas } from "reagraph";
import { useEffect, useState } from "react";

export default function GraphViewer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
        const result = await fetch("/api/graph");
        const { nodes, edges } = await result.json();
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error("error while loading graph:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  if (loading) return <p>Graph wird geladen...</p>;

  return (
    <div
      style={{
        backgroundColor: "var(--foreground)",
        height: "calc(100vh - 2.5rem)",
        border: "1.5px solid var(--border)",
      }}
      className="relative mt-2 mr-2 ml-2 flex-1 overflow-hidden rounded-lg p-1"
    >
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        labelType="all"
        onNodeClick={(node) => {
          console.log("Geklickter Knoten:", node);
          //lazy loading hier
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
