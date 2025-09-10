"use client";
// useGraphElements
// Lightweight local container for nodes/edges WITHOUT deduplication.
// Central dedupe happens in useGraphApi. This hook is useful when a
// component wants to control its own transient graph view.

import { useRef, useState } from "react";
import type { GraphNode, GraphEdge } from "@/types/graph";

/**
 * Lightweight local container for nodes/edges WITHOUT deduplication.
 * Central dedupe happens in `useGraphApi`.
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
    loadedNodeIdsRef, // for external read-only usage if needed
  };
};
