import { useState, useRef } from "react";
import { GraphNode, GraphEdge } from "@/types/graph";

export const useGraphElements = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const loadedIdsRef = useRef<Set<string>>(new Set());

  const updateGraph = (
    newNodes: GraphNode[],
    newEdges: GraphEdge[],
    ids: string[],
  ) => {
    const nextIds = new Set(ids);
    const currentIds = loadedIdsRef.current;

    // Entfernte IDs identifizieren
    const toRemove = Array.from(currentIds).filter((id) => !nextIds.has(id));
    const toAdd = Array.from(nextIds).filter((id) => !currentIds.has(id));

    if (toRemove.length > 0) {
      setNodes((prev) => prev.filter((n) => nextIds.has(n.id)));
      setEdges((prev) =>
        prev.filter((e) => nextIds.has(e.source) && nextIds.has(e.target)),
      );
    }

    // Neue Knoten/Kanten hinzufügen
    setNodes((prev) => [
      ...prev,
      ...newNodes.filter((n) => !prev.some((p) => p.id === n.id)),
    ]);
    setEdges((prev) => [
      ...prev,
      ...newEdges.filter((e) => !prev.some((p) => p.id === e.id)),
    ]);

    loadedIdsRef.current = nextIds;
  };

  return { nodes, edges, updateGraph };
};
