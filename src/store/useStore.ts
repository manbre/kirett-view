"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// [SLICE IMPORTS]
import { createTermSlice, type TermSlice } from "./slices/termSlice";
import { createTypeSlice, type TypeSlice } from "./slices/typeSlice";
import {
  createTopologySlice,
  type TopologySlice,
} from "./slices/topologySlice";

// [ROOT TYPE]
export type Store = TermSlice & TypeSlice & TopologySlice;

// [STORE] Kombiniert alle Slices, inkl. persist
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createTermSlice(set, get), // [ATTACH] termSlice
      ...createTypeSlice(set, get), // [ATTACH] typeSlice
      ...createTopologySlice(set, get), // [ATTACH] topologySlice
    }),
    {
      name: "kirett-store",
      // [PERSIST] Nur serialisierbare Teile herauspicken
      partialize: (s) => ({
        selectedTerms: s.selectedTerms,
        selectedTypes: s.selectedTypes,
        hops: s.hops,
        showOnlyEdges: s.showOnlyEdges,
      }),
    },
  ),
);

// [OPTIONAL] Leichte Wiederverwendung / Autocomplete
export const selectors = {
  // terms
  selectedTerms: (s: Store) => s.selectedTerms,
  selectTerm: (s: Store) => s.selectTerm,
  unselectTerm: (s: Store) => s.unselectTerm,
  // types
  selectedTypes: (s: Store) => s.selectedTypes,
  toggleType: (s: Store) => s.toggleType,
  selectAllTypes: (s: Store) => s.selectAllTypes,
  clearTypes: (s: Store) => s.clearTypes,
  // topology
  hops: (s: Store) => s.hops,
  toggleHop: (s: Store) => s.toggleHop,
  showOnlyEdges: (s: Store) => s.showOnlyEdges,
  toggleShowOnlyEdges: (s: Store) => s.toggleShowOnlyEdges,
};
