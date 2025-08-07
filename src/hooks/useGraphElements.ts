import { useState, useRef } from "react";
import { GraphNode, GraphEdge } from "@/types/graph";

export const useGraphElements = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const loadedTermsRef = useRef<string[]>([]);

  const addGraphElements = (newNodes: GraphNode[], newEdges: GraphEdge[]) => {
    setNodes((prev) => [
      ...prev,
      ...newNodes.filter((n) => !prev.some((p) => p.id === n.id)),
    ]);

    setEdges((prev) => [
      ...prev,
      ...newEdges.filter((e) => !prev.some((p) => p.id === e.id)),
    ]);
  };

  const removeDisconnectedElements = (terms: string[]) => {
    const termSet = new Set(terms);
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
  };

  return {
    nodes,
    edges,
    loadedTermsRef,
    addGraphElements,
    removeDisconnectedElements,
  };
};
