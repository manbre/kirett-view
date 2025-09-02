"use client";

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";
import { labelIconMap, type NodeLabel } from "@/constants/label";

// [NOTE] Alle vorhandenen Node-Labels (Default: alle aktiv)
const ALL_TYPES = Object.keys(labelIconMap) as NodeLabel[];

// [API] Welche Knotentypen (Labels) sind sichtbar?
export interface TypeSlice {
  selectedTypes: NodeLabel[]; // z. B. ["StartNode","ActionNode",...]
  toggleType: (label: NodeLabel) => void;
  setTypes: (labels: NodeLabel[]) => void;
  selectAllTypes: () => void;
  clearTypes: () => void;
}

// [FACTORY] Slice-Fabrik für Typ-Filter
export const createTypeSlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): TypeSlice => ({
  selectedTypes: ALL_TYPES, // [NOTE] Default: alle an

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
