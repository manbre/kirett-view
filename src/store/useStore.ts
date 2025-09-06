"use client";

import { create } from "zustand";

// [SLICE IMPORTS]
import { createTermSlice, type TermSlice } from "./slices/termSlice";
import { createTypeSlice, type TypeSlice } from "./slices/typeSlice";
import {
  createTopologySlice,
  type TopologySlice,
} from "./slices/topologySlice";
import { createGraphSlice, type GraphSlice } from "./slices/graphSlice";

// [ROOT TYPE]
export type Store = TermSlice & TypeSlice & TopologySlice & GraphSlice;

// [STORE FACTORY] — keine Persistenz
export const useStore = create<Store>()((set, get) => ({
  ...createTermSlice(set, get),
  ...createTypeSlice(set, get),
  ...createTopologySlice(set, get),
  ...createGraphSlice(set, get),
}));

// [SELECTORS]
export const selectors = {
  // terms
  terms: (s: Store) => s.terms,
  selectedTerms: (s: Store) => s.selectedTerms,
  selectTerm: (s: Store) => s.selectTerm,
  unselectTerm: (s: Store) => s.unselectTerm,
  // types
  selectedTypes: (s: Store) => s.selectedTypes,
  toggleType: (s: Store) => s.toggleType,
  selectAllTypes: (s: Store) => s.selectAllTypes,
  clearTypes: (s: Store) => s.clearTypes,
  // topology
  selectedHops: (s: Store) => s.selectedHops,
  toggleHop: (s: Store) => s.toggleHop,
  showOnlyEdges: (s: Store) => s.showOnlyEdges,
  toggleShowOnlyEdges: (s: Store) => s.toggleShowOnlyEdges,
  // graph
  // EN: current graph data
  // DE: aktueller Graph
  graphNodes: (s: Store) => s.nodes,
  graphEdges: (s: Store) => s.edges,
  graphPos: (s: Store) => s.pos,

  // EN: convenience combined selector (nodes + edges)
  // DE: kombinierter Komfort-Selektor (nodes + edges)
  graphData: (s: Store) => ({ nodes: s.nodes, edges: s.edges }),

  // EN: graph actions
  // DE: Graph-Aktionen
  setGraph: (s: Store) => s.setGraph,
  mergeGraph: (s: Store) => s.mergeGraph,
  setNodePos: (s: Store) => s.setNodePos,
  clearGraph: (s: Store) => s.clear,
};
