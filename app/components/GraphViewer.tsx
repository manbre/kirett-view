"use client";

import { GraphCanvas } from "reagraph";
import { useStore } from "@/store/useStore";
import { useEffect, useState, useRef } from "react";
import { CustomNode } from "@/components/CustomNode";

export default function GraphViewer() {
  const selectedTerms = useStore((state) => state.selectedTerms);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const loadedTermsRef = useRef<string[]>([]);

  const prevTerms = loadedTermsRef.current;
  const added = selectedTerms.filter((t) => !prevTerms.includes(t));
  const removed = prevTerms.filter((t) => !selectedTerms.includes(t));

  useEffect(() => {
    if (selectedTerms.length === 0) {
      loadedTermsRef.current = [];
      setNodes([]);
      setEdges([]);
      return;
    }

    loadedTermsRef.current = selectedTerms;

    if (removed.length > 0) {
      const termSet = new Set(selectedTerms);
      const connected = new Set<string>();

      for (const node of nodes) {
        const term = node.data?.Name ?? node.data?.BPR;
        if (termSet.has(term)) {
          connected.add(node.id);
          for (const edge of edges) {
            if (edge.source === node.id) connected.add(edge.target);
            if (edge.target === node.id) connected.add(edge.source);
          }
        }
      }

      setNodes((prev) => prev.filter((n) => connected.has(n.id)));
      setEdges((prev) =>
        prev.filter((e) => connected.has(e.source) && connected.has(e.target)),
      );
    }

    fetchNewGraphParts();
  }, [selectedTerms]);

  const fetchNewGraphParts = async () => {
    try {
      const res = await fetch("/api/graph/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTerms: added }),
      });

      if (!res.ok) throw new Error("Fehler beim Laden");

      const data = await res.json();

      setNodes((prev) => [
        ...prev,
        ...data.nodes.filter(
          (n) => !prev.some((p) => p.id.toString() === n.id.toString()),
        ),
      ]);

      setEdges((prev) => [
        ...prev,
        ...data.edges.filter(
          (e) => !prev.some((p) => p.id.toString() === e.id.toString()),
        ),
      ]);
    } catch (err) {
      console.error("Graph-Ladefehler:", err);
    }
  };

  const uniqueNodes = Array.from(
    new Map(nodes.map((n) => [n.id.toString(), n])).values(),
  );
  const uniqueEdges = Array.from(
    new Map(edges.map((e) => [e.id.toString(), e])).values(),
  );

  return (
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border-1 border-[var(--border)] p-1">
      <GraphCanvas
        nodes={uniqueNodes}
        edges={uniqueEdges}
        draggable
        renderNode={({ node }) => <CustomNode node={node} />}
        onNodeClick={(node) => {
          console.log("Geklickter Knoten:", node.data.labels?.[0]);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
