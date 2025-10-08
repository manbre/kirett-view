"use client";

import { create } from "zustand";

// slices
import { createTermSlice, type TermSlice } from "./slices/termSlice";
import { createTypeSlice, type TypeSlice } from "./slices/typeSlice";
import {
  createTopologySlice,
  type TopologySlice,
} from "./slices/topologySlice";
import { createGraphSlice, type GraphSlice } from "./slices/graphSlice";

// zustand type combining all slices
export type Store = TermSlice & TypeSlice & TopologySlice & GraphSlice;

// composed zustand store of all slices
export const useStore = create<Store>()((set, get) => ({
  ...createTermSlice(set, get),
  ...createTypeSlice(set, get),
  ...createTopologySlice(set, get),
  ...createGraphSlice(set, get),
}));
