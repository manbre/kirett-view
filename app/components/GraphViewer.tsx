"use client";

import { GraphCanvas } from "reagraph";
import { useEffect, useState } from "react";

// Falls du keine Typen hast, kannst du sie hier definieren oder importieren
type NodeType = {
  id: string;
  label: string;
  data?: any;
};

type EdgeType = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export default function GraphViewer() {
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGraph() {
      setLoading(true);
      try {
        const result = await fetch("/api/graph");
        const data = await result.json();

        // Defensive check, falls API kein Array zurückgibt
        setNodes(Array.isArray(data.nodes) ? data.nodes : []);
        setEdges(Array.isArray(data.edges) ? data.edges : []);
      } catch (error) {
        console.error("error while loading graph:", error);
        setNodes([]);
        setEdges([]);
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
          // lazy loading hier möglich
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
