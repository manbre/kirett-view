// src/store/useTermStore.ts

import { create } from "zustand";
import { Category, createEmptySelectedTerms } from "@/constants/category";

export type TermStore = {
  termsByCategory: Record<Category, string[]>;
  setTermsForCategory: (category: Category, terms: string[]) => void;
  getSelectedTerms: () => string[];
  getTermsByCategory: () => Record<Category, string[]>;
  clearAllTerms: () => void;
};

export const useTermStore = create<TermStore>((set, get) => ({
  termsByCategory: createEmptySelectedTerms(),

  setTermsForCategory: (category, terms) => {
    set((state) => ({
      termsByCategory: {
        ...state.termsByCategory,
        [category]: terms,
      },
    }));
  },

  getSelectedTerms: () => {
    return Object.values(get().termsByCategory).flat();
  },

  getTermsByCategory: () => {
    return get().termsByCategory;
  },

  clearAllTerms: () => {
    set({ termsByCategory: createEmptySelectedTerms() });
  },
}));
