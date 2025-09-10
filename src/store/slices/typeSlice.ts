"use client";

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";
import { labelIconMap, type NodeLabel } from "@/constants/label";

// All available node labels (default: all active)
export const ALL_TYPES = Object.keys(labelIconMap) as NodeLabel[];

// Visibility/filter for node types (Section 1)
export interface TypeSlice {
  selectedTypes: NodeLabel[];
  toggleType: (label: NodeLabel) => void;
  setTypes: (labels: NodeLabel[]) => void;
  selectAllTypes: () => void;
  clearTypes: () => void;
}

export const createTypeSlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): TypeSlice => ({
  // Default: all labels active
  selectedTypes: ALL_TYPES,

  toggleType: (label) =>
    set((s) => ({
      selectedTypes: s.selectedTypes.includes(label)
        ? s.selectedTypes.filter((l) => l !== label)
        : [...s.selectedTypes, label],
    })),

  setTypes: (labels) => set({ selectedTypes: labels }),

  selectAllTypes: () => set({ selectedTypes: ALL_TYPES }),

  clearTypes: () => set({ selectedTypes: [] }),
});
