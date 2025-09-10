"use client";
// TopologySlice
// Controls hop depth selection (as an exclusive mode and as an array for
// compatibility) and the edge-only rendering toggle.

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";

// Hop keys (Section 2)
export type HopKey = "HopOne" | "HopTwo";
export type HopMode = "hop1" | "hop2" | "both";

export interface TopologySlice {
  // Hops as an array (backward compatible for existing callers)
  selectedHops: HopKey[];
  setHops: (h: HopKey[]) => void;
  toggleHop: (k: HopKey) => void;

  // New, explicit hop mode for HopToggle (exactly one selection)
  hopMode: HopMode;
  setHopMode: (m: HopMode) => void;

  showOnlyEdges: boolean;
  setShowOnlyEdges: (v: boolean) => void;
  toggleShowOnlyEdges: () => void;
}

export const createTopologySlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): TopologySlice => ({
  // Default: only HopOne active
  selectedHops: ["HopOne"],
  hopMode: "hop1",

  setHops: (h) =>
    set(() => ({
      selectedHops: h,
      hopMode:
        h.length === 2
          ? "both"
          : h.includes("HopTwo")
          ? "hop2"
          : "hop1",
    })),

  toggleHop: (k) =>
    set((s) => {
      const exists = s.selectedHops.includes(k);
      const next = exists
        ? s.selectedHops.filter((x) => x !== k)
        : [...s.selectedHops, k];
      // Nie leer lassen: fallback auf HopOne
      const safe = next.length === 0 ? ["HopOne"] : (next as HopKey[]);
      const mode =
        safe.length === 2 ? "both" : safe.includes("HopTwo") ? "hop2" : "hop1";
      return { selectedHops: safe, hopMode: mode } as Partial<TopologySlice>;
    }),

  setHopMode: (m) =>
    set(() => {
      const map: Record<HopMode, HopKey[]> = {
        hop1: ["HopOne"],
        hop2: ["HopTwo"],
        both: ["HopOne", "HopTwo"],
      };
      return { hopMode: m, selectedHops: map[m] } as Partial<TopologySlice>;
    }),

  showOnlyEdges: false,
  setShowOnlyEdges: (v) => set({ showOnlyEdges: v }),
  toggleShowOnlyEdges: () => set((s) => ({ showOnlyEdges: !s.showOnlyEdges })),
});
