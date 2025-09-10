"use client";

import { useRef, useState } from "react";
import type { GraphNode, GraphEdge } from "@/types/graph";

/**
 * Leichter lokaler Container für Nodes/Edges OHNE Dedupe.
 * Dedupe passiert zentral in `useGraphApi`.
 */
export const useGraphElements = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const loadedNodeIdsRef = useRef<Set<string>>(new Set());

  const updateGraphElements = (
    newNodes: GraphNode[],
    newEdges: GraphEdge[],
  ) => {
    setNodes(newNodes);
    setEdges(newEdges);
    loadedNodeIdsRef.current = new Set(newNodes.map((n) => n.id));
  };

  const resetGraphElements = () => {
    setNodes([]);
    setEdges([]);
    loadedNodeIdsRef.current = new Set();
  };

  return {
    nodes,
    edges,
    updateGraphElements,
    resetGraphElements,
    loadedNodeIdsRef, // falls extern gebraucht (read-only Nutzung)
  };
};
