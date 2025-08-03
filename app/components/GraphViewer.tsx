"use client";

import { GraphCanvas } from "reagraph";
import { useStore } from "@/store/useStore";
import { useEffect, useRef, useState } from "react";
import { CustomNode } from "@/components/CustomNode";
import type { Category } from "@/constants/category";

type NodeType = {
  id: string;
  label: string;
  data?: { [key: string]: unknown };
};

type EdgeType = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export const GraphViewer = () => {
  const selectedTerms = useStore((state) => state.selectedTerms);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const loadedTermsRef = useRef<Record<Category, string[]>>(
    {} as Record<Category, string[]>,
  );

  useEffect(() => {
    const prevTerms = loadedTermsRef.current;

    const added: Record<Category, string[]> = {};
    const removed: Record<Category, string[]> = {};

    for (const category in selectedTerms) {
      const prev = prevTerms[category as Category] ?? [];
      const curr = selectedTerms[category as Category];

      added[category as Category] = curr.filter((t) => !prev.includes(t));
      removed[category as Category] = prev.filter((t) => !curr.includes(t));
    }

    const hasRemoved = Object.values(removed).some((list) => list.length > 0);
    const hasAdded = Object.values(added).some((list) => list.length > 0);

    // Kein Begriff mehr ausgewählt
    const hasTerms = Object.values(selectedTerms).some((t) => t.length > 0);
    if (!hasTerms) {
      setNodes([]);
      setEdges([]);
      loadedTermsRef.current = {} as Record<Category, string[]>;
      return;
    }

    // Entfernte Knoten verwerfen
    if (hasRemoved) {
      const remainingTerms = Object.values(selectedTerms).flat();
      const termSet = new Set(remainingTerms);
      const connected = new Set<string>();

      for (const node of nodes) {
        const term = node.data?.Name ?? node.data?.BPR;
        if (typeof term === "string" && termSet.has(term)) {
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

    // Neue Begriffe laden
    if (hasAdded) {
      fetchNewGraphParts(added);
    }

    loadedTermsRef.current = JSON.parse(JSON.stringify(selectedTerms)); // tiefe Kopie
  }, [selectedTerms]);

  const fetchNewGraphParts = async (termsToAdd: Record<Category, string[]>) => {
    try {
      const res = await fetch("/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTerms: termsToAdd }),
      });

      if (!res.ok) throw new Error("Fehler beim Laden");

      const data = await res.json();

      if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) return;

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

  const isValidNode = (n: NodeType) => n && typeof n.id === "string";
  const isValidEdge = (e: EdgeType) =>
    e && typeof e.id === "string" && e.source && e.target;

  const uniqueNodes = Array.from(
    new Map(nodes.filter(isValidNode).map((n) => [n.id, n])).values(),
  );
  const uniqueEdges = Array.from(
    new Map(edges.filter(isValidEdge).map((e) => [e.id, e])).values(),
  );

  return (
    <div className="bg-fore relative mt-2 mr-2 ml-2 h-[calc(100%_-_2.5rem)] flex-1 overflow-hidden rounded-lg border-1 border-[var(--border)] p-1">
      <GraphCanvas
        nodes={uniqueNodes}
        edges={uniqueEdges}
        labelType={"none"}
        draggable
        renderNode={({ node }) =>
          node && node.data ? <CustomNode node={node} /> : null
        }
        onNodeClick={(node) => {
          // console.log("Geklickter Knoten:", node.data);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
