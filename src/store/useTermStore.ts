import { create } from "zustand";
import { Category } from "@/constants/category";

interface Store {
  selectedTerms: Record<Category, string[]>;

  selectTerm: (category: Category, term: string) => void;
  unselectTerm: (category: Category, term: string) => void;
}

export const useTermStore = create<Store>((set, get) => ({
  selectedTerms: {},

  selectTerm: (category, term) => {
    const prev = get().selectedTerms[category] ?? [];
    if (prev.includes(term)) return;

    const updated = [...prev, term];
    set((state) => ({
      selectedTerms: {
        ...state.selectedTerms,
        [category]: updated,
      },
    }));
  },

  unselectTerm: (category, term) => {
    const prev = get().selectedTerms[category] ?? [];
    const updated = prev.filter((t) => t !== term);
    set((state) => ({
      selectedTerms: {
        ...state.selectedTerms,
        [category]: updated,
      },
    }));
  },
}));
