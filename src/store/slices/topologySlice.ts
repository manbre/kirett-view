"use client";

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";

// Hops-Keys (Section 2)
export type HopKey = "HopOne" | "HopTwo";
export type HopMode = "hop1" | "hop2" | "both";

export interface TopologySlice {
  // Hops als Array (Rückwärtskompatibel für bestehende Aufrufer)
  selectedHops: HopKey[];
  setHops: (h: HopKey[]) => void;
  toggleHop: (k: HopKey) => void;

  // Neuer, eindeutiger Modus für HopToggle (exakt eine Auswahl)
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
  // ✅ Default: nur HopOne aktiv
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
