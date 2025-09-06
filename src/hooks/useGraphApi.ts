"use client";

import { useStore } from "@/store/useStore";
import type { GraphNode, GraphEdge, SubgraphResult } from "@/types/graph";
import { Category } from "@/constants/category";

export type SelectedTerms = Record<Category, string[]>;
export type SelectedTypes = string[];
export type SelectedHops = string[]; // "HopOne" | "HopTwo"

// EN: Helper to map UI hops -> server depth ["1" | "2"]
// DE: Hilfsfunktion, um UI-Hops -> Server-Tiefe ["1" | "2"] zu mappen
function toDepth(selectedHops: SelectedHops): ("1" | "2")[] {
  const depth: ("1" | "2")[] = [];
  if (selectedHops.includes("HopOne")) depth.push("1");
  if (selectedHops.includes("HopTwo")) depth.push("2");
  if (depth.length === 0) depth.push("1"); // default: at least 1 hop
  return depth;
}

export const useGraphApi = () => {
  // EN: write to store using root (flat) graph actions
  // DE: in den Store schreiben via Root-(flache) Graph-Actions
  const { setGraph, mergeGraph } = useStore.getState();

  const fetchGraphData = async (
    selectedTerms: SelectedTerms,
    selectedTypes: SelectedTypes,
    selectedHops: SelectedHops,
    showOnlyEdges: boolean,
  ): Promise<SubgraphResult> => {
    // EN: map filters to API payload
    // DE: Filter ins API-Payload mappen
    const include = selectedTypes; // labels/types to include
    const depth = toDepth(selectedHops);

    const res = await fetch("/api/graph/subgraphs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms, depth, include, showOnlyEdges }),
    });

    if (!res.ok) throw new Error(`Failed to load subgraph (${res.status})`);

    const data = (await res.json()) as SubgraphResult;
    // EN: Replace graph in store
    // DE: Graph im Store ersetzen
    setGraph(data.nodes as GraphNode[], data.edges as GraphEdge[]);
    return data;
  };

  const fetchNeighbors = async (
    nodeId: string,
    selectedHops: SelectedHops,
    selectedTypes: SelectedTypes,
    showOnlyEdges: boolean,
  ): Promise<SubgraphResult> => {
    // EN: recompute include/depth here (they aren't in outer scope)
    // DE: include/depth hier neu berechnen (nicht im Scope verfügbar)
    const include = selectedTypes;
    const depth = toDepth(selectedHops);

    const res = await fetch("/api/graph/expand/neighbors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, depth, include, showOnlyEdges }),
    });

    if (!res.ok) throw new Error(`Failed to expand neighbors (${res.status})`);

    const data = (await res.json()) as SubgraphResult;
    // EN: Merge into existing graph (union by id)
    // DE: In bestehenden Graph mergen (Vereinigung per ID)
    mergeGraph(data.nodes as GraphNode[], data.edges as GraphEdge[]);
    return data;
  };

  return { fetchGraphData, fetchNeighbors };
};
