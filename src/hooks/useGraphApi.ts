"use client";
// useGraphApi
// Client-side helpers to load filtered subgraphs and neighbor-expansions.
// Translates UI filters (types/hops/edge-only) into API payloads and
// updates the central store with the result.

import { useStore } from "@/store/useStore";
import type { GraphNode, GraphEdge, SubgraphResult } from "@/types/graph";

export type SelectedTerms = Record<string, string[]>;
export type SelectedTypes = string[];
export type SelectedHops = string[]; // "HopOne" | "HopTwo"

// Map UI hops -> server depth strings ["1" | "2"]
function toDepth(selectedHops: SelectedHops): ("1" | "2")[] {
  const depth: ("1" | "2")[] = [];
  if (selectedHops.includes("HopOne")) depth.push("1");
  if (selectedHops.includes("HopTwo")) depth.push("2");
  if (depth.length === 0) depth.push("1"); // Fallback: at least one hop
  return depth;
}

// Frontend-side dedupe (single place) to keep IDs unique
function dedupeGraph(
  nodes: GraphNode[] = [],
  edges: GraphEdge[] = [],
): SubgraphResult {
  const nMap = new Map<string, GraphNode>();
  for (const n of nodes) nMap.set(n.id, n);

  const eMap = new Map<string, GraphEdge>();
  for (const e of edges) eMap.set(e.id, e);

  return {
    nodes: [...nMap.values()],
    edges: [...eMap.values()],
  };
}

export const useGraphApi = () => {
  // Access root graph actions for replacing/merging graph data
  const { setGraph, mergeGraph } = useStore.getState();

  // Load a subgraph for a selection of terms with current filters
  const fetchGraphData = async (
    selectedTerms: SelectedTerms,
    selectedTypes: SelectedTypes,
    selectedHops: SelectedHops,
    showOnlyEdges: boolean,
  ): Promise<SubgraphResult> => {
    const include = selectedTypes;
    const depth = toDepth(selectedHops);

    const res = await fetch("/api/graph/subgraphs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms, include, depth, showOnlyEdges }),
    });

    if (!res.ok) {
      throw new Error(`Failed to load subgraph (${res.status})`);
    }

    const raw = (await res.json()) as SubgraphResult;
    const { nodes, edges } = dedupeGraph(raw.nodes, raw.edges);

    // Replace in store (no additional dedupe needed here)
    setGraph(nodes, edges);
    return { nodes, edges };
  };

  // Expand neighbors for a given node with current filters
  const fetchNeighbors = async (
    nodeId: string,
    selectedHops: SelectedHops,
    selectedTypes: SelectedTypes,
    showOnlyEdges: boolean,
  ): Promise<SubgraphResult> => {
    const include = selectedTypes;
    const depth = toDepth(selectedHops);

    const res = await fetch("/api/graph/expand/neighbors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, include, depth, showOnlyEdges }),
    });

    if (!res.ok) {
      throw new Error(`Failed to expand neighbors (${res.status})`);
    }

    const raw = (await res.json()) as SubgraphResult;
    const { nodes, edges } = dedupeGraph(raw.nodes, raw.edges);

    // In bestehenden Graphen mergen (Store darf optional erneut vereinigen)
    mergeGraph(nodes, edges);
    return { nodes, edges };
  };

  return { fetchGraphData, fetchNeighbors };
};
