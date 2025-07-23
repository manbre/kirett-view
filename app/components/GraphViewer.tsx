"use client";

import { GraphCanvas } from "reagraph";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

// Falls du keine Typen hast, kannst du sie hier definieren oder importieren
type NodeData = {
  Name?: string;
  Typ?: string;
  [key: string]: unknown; // erlaubt beliebige weitere Properties, aber typsicher
};

type NodeType = {
  id: string;
  label: string;
  data?: NodeData;
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
      const selectedTerms = useStore.getState().selectedTerms; // SelectedTerm[]

      if (!Array.isArray(selectedTerms) || selectedTerms.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/graph/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedTerms }),
        });

        if (!response.ok) {
          throw new Error("Fehler beim Laden");
        }

        const data = await response.json();
        setNodes(Array.isArray(data.nodes) ? data.nodes : []);
        setEdges(Array.isArray(data.edges) ? data.edges : []);
      } catch (error) {
        console.error("Fehler beim Laden des Graphen:", error);
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
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border-1 border-[var(--border)] p-1">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        labelType="all"
        draggable={true}
        onNodeClick={(node) => {
          console.log("Geklickter Knoten:", node);
          // lazy loading hier möglich
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
