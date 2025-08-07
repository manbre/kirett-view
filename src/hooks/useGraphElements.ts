import { useRef, useState } from "react";
import { GraphNode, GraphEdge } from "@/types/graph";

export const useGraphElements = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const loadedNodeIdsRef = useRef<Set<string>>(new Set());

  const updateGraphElements = (
    newNodes: GraphNode[],
    newEdges: GraphEdge[],
  ) => {
    const nextIds = new Set(newNodes.map((n) => n.id));

    const uniqueNodesMap = new Map<string, GraphNode>();
    for (const node of newNodes) {
      if (!uniqueNodesMap.has(node.id)) {
        uniqueNodesMap.set(node.id, node);
      }
    }

    const uniqueEdgesMap = new Map<string, GraphEdge>();
    for (const edge of newEdges) {
      if (!uniqueEdgesMap.has(edge.id)) {
        uniqueEdgesMap.set(edge.id, edge);
      }
    }

    setNodes(Array.from(uniqueNodesMap.values()));
    setEdges(Array.from(uniqueEdgesMap.values()));
    loadedNodeIdsRef.current = nextIds;
  };

  return {
    nodes,
    edges,
    updateGraphElements,
  };
};
