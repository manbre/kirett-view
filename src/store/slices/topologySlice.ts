"use client";

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";

// Hops-Keys (Section 2)
export type HopKey = "HopOne" | "HopTwo";

export interface TopologySlice {
  hops: HopKey[]; // Mehrfachauswahl
  toggleHop: (k: HopKey) => void;

  showOnlyEdges: boolean;
  setShowOnlyEdges: (v: boolean) => void;
  toggleShowOnlyEdges: () => void;
}

export const createTopologySlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): TopologySlice => ({
  // ✅ Default: nur HopOne aktiv
  selectedHops: ["HopOne"],

  toggleHop: (k) =>
    set((s) => ({
      selectedHops: s.selectedHops.includes(k)
        ? s.selectedHops.filter((x) => x !== k)
        : [...s.selectedHops, k],
    })),

  showOnlyEdges: false,
  setShowOnlyEdges: (v) => set({ showOnlyEdges: v }),
  toggleShowOnlyEdges: () => set((s) => ({ showOnlyEdges: !s.showOnlyEdges })),
});
