"use client";

import type { StoreApi } from "zustand";
import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Store } from "../useStore";

export interface Pos {
  x: number;
  y: number;
}

export interface GraphSlice {
  nodes: GraphNode[];
  edges: GraphEdge[];
  pos: Map<string, Pos>;
  lastNeighborId: string | null;

  setGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  mergeGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  setNodePos: (id: string, x: number, y: number) => void;
  setLastNeighborId: (id: string | null) => void;
  clearGraph: () => void;
}

// createGraphSlice: graph data (nodes/edges), positions, and helpers
export const createGraphSlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): GraphSlice => ({
  // GraphSlice: stores nodes/edges, node positions, and lastNeighborId
  nodes: [],
  edges: [],
  pos: new Map<string, Pos>(),
  lastNeighborId: null,

  // Replace entire graph
  setGraph: (nodes, edges) => {
    // Positions are rebuilt by the viewer after render
    set({ nodes, edges, pos: new Map<string, Pos>() });
  },

  // Merge graph by id (nodes/edges)
  mergeGraph: (nodes, edges) => {
    const curN = get().nodes;
    const curE = get().edges;

    const nById = new Map<string, GraphNode>(curN.map((n) => [n.id, n]));
    const eById = new Map<string, GraphEdge>(curE.map((e) => [e.id, e]));

    for (const n of nodes) nById.set(n.id, n);
    for (const e of edges) eById.set(e.id, e);

    set({ nodes: [...nById.values()], edges: [...eById.values()] });
  },

  // Persist a node's position (reported by the viewer)
  setNodePos: (id, x, y) => {
    const next = new Map(get().pos);
    next.set(id, { x, y });
    set({ pos: next });
  },

  setLastNeighborId: (id) => set({ lastNeighborId: id }),

  clearGraph: () =>
    set({ nodes: [], edges: [], pos: new Map(), lastNeighborId: null }),
});
