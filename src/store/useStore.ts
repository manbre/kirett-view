"use client";

import { create } from "zustand";

// Slices
import { createTermSlice, type TermSlice } from "./slices/termSlice";
import { createTypeSlice, type TypeSlice } from "./slices/typeSlice";
import {
  createTopologySlice,
  type TopologySlice,
} from "./slices/topologySlice";
import { createGraphSlice, type GraphSlice } from "./slices/graphSlice";

// Store: root Zustand type combining all slices
export type Store = TermSlice & TypeSlice & TopologySlice & GraphSlice;

// useStore: composed Zustand store of all slices
export const useStore = create<Store>()((set, get) => ({
  ...createTermSlice(set, get),
  ...createTypeSlice(set, get),
  ...createTopologySlice(set, get),
  ...createGraphSlice(set, get),
}));

// selectors: centralized selectors for components
export const selectors = {
  // terms
  selectedTerms: (s: Store) => s.selectedTerms,
  selectTerm: (s: Store) => s.selectTerm,
  unselectTerm: (s: Store) => s.unselectTerm,
  clearTerms: (s: Store) => s.clearTerms,

  // types
  selectedTypes: (s: Store) => s.selectedTypes,
  toggleType: (s: Store) => s.toggleType,
  setTypes: (s: Store) => s.setTypes,
  selectAllTypes: (s: Store) => s.selectAllTypes,
  clearTypes: (s: Store) => s.clearTypes,

  // topology
  selectedHops: (s: Store) => s.selectedHops,
  setHops: (s: Store) => s.setHops,
  toggleHop: (s: Store) => s.toggleHop,
  showOnlyEdges: (s: Store) => s.showOnlyEdges,
  toggleShowOnlyEdges: (s: Store) => s.toggleShowOnlyEdges,

  // graph
  nodes: (s: Store) => s.nodes,
  edges: (s: Store) => s.edges,
  pos: (s: Store) => s.pos,
  lastNeighborId: (s: Store) => s.lastNeighborId,

  setGraph: (s: Store) => s.setGraph,
  mergeGraph: (s: Store) => s.mergeGraph,
  setNodePos: (s: Store) => s.setNodePos,
  setLastNeighborId: (s: Store) => s.setLastNeighborId,
  clearGraph: (s: Store) => s.clearGraph,

  // kombi
  graphData: (s: Store) => ({ nodes: s.nodes, edges: s.edges }),
};
