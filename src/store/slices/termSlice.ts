"use client";

import type { StoreApi } from "zustand";
import { Category } from "@/constants/category";
import type { Store } from "../useStore";

// [API] Fachliche Terms (Begriffe pro Kategorie)
export interface TermSlice {
  selectedTerms: Record<Category, string[]>;
  selectTerm: (category: Category, term: string) => void;
  unselectTerm: (category: Category, term: string) => void;
}

// [FACTORY] Slice-Fabrik für Terms
export const createTermSlice = (
  set: StoreApi<Store>["setState"],
  get: StoreApi<Store>["getState"],
): TermSlice => ({
  selectedTerms: {},

  selectTerm: (category, term) => {
    const prev = get().selectedTerms[category] ?? [];
    if (prev.includes(term)) return;
    set((state) => ({
      selectedTerms: {
        ...state.selectedTerms,
        [category]: [...prev, term],
      },
    }));
  },

  unselectTerm: (category, term) => {
    const prev = get().selectedTerms[category] ?? [];
    set((state) => ({
      selectedTerms: {
        ...state.selectedTerms,
        [category]: prev.filter((t) => t !== term),
      },
    }));
  },
});
