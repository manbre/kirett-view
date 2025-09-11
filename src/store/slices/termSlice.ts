"use client";

import type { StoreApi } from "zustand";
import { Category, createEmptySelectedTerms } from "@/constants/category";
import type { Store } from "../useStore";

// TermSlice state and actions (selected terms per category)
export interface TermSlice {
  selectedTerms: Record<Category, string[]>;
  selectTerm: (category: Category, term: string) => void;
  unselectTerm: (category: Category, term: string) => void;
  unselectTermEverywhere: (term: string) => void;
  clearTerms: () => void;
}

// createTermSlice: builds the term selection slice
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

  // Remove a term from all categories
  unselectTermEverywhere: (term) => {
    const cur = get().selectedTerms;
    const next: Record<Category, string[]> = Object.fromEntries(
      Object.entries(cur).map(([cat, list]) => [
        cat,
        Array.isArray(list) ? list.filter((t) => t !== term) : [],
      ]),
    ) as Record<Category, string[]>;
    set({ selectedTerms: next });
  },

  // Clear all selected terms (all categories)
  clearTerms: () => {
    set({ selectedTerms: createEmptySelectedTerms() });
  },
});
