"use client";

import { GraphCanvas } from "reagraph";
import { useStore } from "@/store/useStore";
import { useEffect, useState, useRef } from "react";

type NodeData = { Name?: string; BPR?: string; [key: string]: unknown };
type NodeType = { id: string; label: string; data?: NodeData };
type EdgeType = { id: string; source: string; target: string; label?: string };

export default function GraphViewer() {
  const selectedTerms = useStore((state) => state.selectedTerms);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const loadedTermsRef = useRef<string[]>([]);

  useEffect(() => {
    if (selectedTerms.length === 0) {
      loadedTermsRef.current = [];
      setNodes([]);
      setEdges([]);
      return;
    }

    const prevTerms = loadedTermsRef.current;
    const added = selectedTerms.filter((t) => !prevTerms.includes(t));
    const removed = prevTerms.filter((t) => !selectedTerms.includes(t));
    loadedTermsRef.current = selectedTerms;

    // Entferne Knoten & Kanten, die zu entfernten Begriffen gehören
    if (removed.length > 0) {
      const termSet = new Set(selectedTerms);
      const validNodeIds = new Set<string>();

      // Behalte:
      // - Knoten mit aktuellem Begriff (Name/BPR)
      // - und alle direkt verbundenen Knoten
      nodes.forEach((node) => {
        const term = node.data?.Name ?? node.data?.BPR;
        const isSelected = termSet.has(term as string);
        if (isSelected) {
          validNodeIds.add(node.id);
          edges.forEach((edge) => {
            if (edge.source === node.id) validNodeIds.add(edge.target);
            if (edge.target === node.id) validNodeIds.add(edge.source);
          });
        }
      });

      setNodes((prev) => prev.filter((n) => validNodeIds.has(n.id)));
      setEdges((prev) =>
        prev.filter(
          (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target),
        ),
      );
    }

    // 🔹 Neue Begriffe nachladen
    if (added.length === 0) return;

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
            (n: any) => !prev.some((p) => p.id.toString() === n.id.toString()),
          ),
        ]);

        setEdges((prev) => [
          ...prev,
          ...data.edges.filter(
            (e: any) => !prev.some((p) => p.id.toString() === e.id.toString()),
          ),
        ]);
      } catch (err) {
        console.error("Graph-Ladefehler:", err);
      }
    };

    fetchNewGraphParts();
  }, [selectedTerms]);

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
        labelType="all"
        draggable
        onNodeClick={(node) => {
          console.log("Geklickter Knoten:", node);
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
