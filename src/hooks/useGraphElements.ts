import { useState, useRef } from "react";
import { GraphNode, GraphEdge } from "@/types/graph";

export const useGraphElements = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const loadedTermsRef = useRef<string[]>([]);

  const removeUnlistedIds = (nodeIds: string[], edgeIds: string[]) => {
    setNodes((prev) => prev.filter((n) => nodeIds.includes(n.id)));
    setEdges((prev) => prev.filter((e) => edgeIds.includes(e.id)));
  };

  return {
    nodes,
    edges,
    removeUnlistedIds,
    loadedTermsRef,
  };
};
