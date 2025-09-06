"use client";

import type { StoreApi } from "zustand";
import type { GraphNode, GraphEdge } from "@/types/graph";
import type { Store } from "../useStore";

export interface GraphSlice {
  nodes: GraphNode[];
  edges: GraphEdge[];
  pos: Map<string, { x: number; y: number }>;
  setGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  mergeGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  setNodePos: (id: string, x: number, y: number) => void;
}

export const createGraphSlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): GraphSlice => ({
  nodes: [],
  edges: [],
  pos: new Map(),

  // DE: Graph komplett ersetzen
  // EN: Replace entire graph
  setGraph: (nodes, edges) => {
    set({ nodes, edges, pos: new Map() }); // Positionen neu füllen lassen
  },

  // DE: Knoten/Kanten per ID vereinigen
  // EN: Union by id
  mergeGraph: (nodes, edges) => {
    const curN = get().nodes;
    const curE = get().edges;
    const nById = new Map<string, GraphNode>(curN.map((n) => [n.id, n]));
    const eById = new Map<string, GraphEdge>(curE.map((e) => [e.id, e]));
    for (const n of nodes) nById.set(n.id, n);
    for (const e of edges) eById.set(e.id, e);
    set({ nodes: [...nById.values()], edges: [...eById.values()] });
  },

  // DE: Laufend aus Viewer melden
  // EN: Fed live from viewer
  setNodePos: (id, x, y) => {
    const pos = new Map(get().pos);
    pos.set(id, { x, y });
    set({ pos });
  },
});
