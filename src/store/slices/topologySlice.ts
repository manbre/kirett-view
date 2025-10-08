"use client";

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";

// hop keys (ToolBar Section 2)
export type HopKey = "HopOne" | "HopTwo";
export type HopMode = "hop1" | "hop2" | "both";

export interface TopologySlice {
  selectedHops: HopKey[];

  // hop mode for HopToggle (exactly one selection)
  hopMode: HopMode;
  setHopMode: (m: HopMode) => void;

  showOnlyEdges: boolean;
  setShowOnlyEdges: (v: boolean) => void;
  toggleShowOnlyEdges: () => void;
}

// createTopologySlice: hop mode/array and edge-only flag
export const createTopologySlice = (
  set: StoreApi<Store>["setState"],
): TopologySlice => ({
  // default: HopOne active
  selectedHops: ["HopOne"],
  hopMode: "hop1",

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
