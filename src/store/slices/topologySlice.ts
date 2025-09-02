"use client";

import type { StoreApi } from "zustand";
import type { Store } from "../useStore";

// [API] Hops-Keys aus deiner Filter-Gruppe
export type HopKey = "HopOne" | "HopTwo";

// [API] Topologische Filter (Reichweite & Konnektivität)
export interface TopologySlice {
  hops: HopKey[]; // Mehrfachauswahl (z. B. ["HopOne","HopTwo"])
  toggleHop: (k: HopKey) => void;

  showOnlyEdges: boolean; // z. B. „Nur Knoten mit Kanten anzeigen“ (dein OnlyEdges)
  setShowOnlyEdges: (v: boolean) => void;
  toggleShowOnlyEdges: () => void;
}

// [FACTORY] Slice-Fabrik für Topologie-Filter
export const createTopologySlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): TopologySlice => ({
  hops: ["HopOne", "HopTwo"], // [NOTE] Default: beide aktiv
  toggleHop: (k) =>
    set((s) => ({
      hops: s.hops.includes(k) ? s.hops.filter((x) => x !== k) : [...s.hops, k],
    })),

  showOnlyEdges: false,
  setShowOnlyEdges: (v) => set({ showOnlyEdges: v }),
  toggleShowOnlyEdges: () => set((s) => ({ showOnlyEdges: !s.showOnlyEdges })),
});
