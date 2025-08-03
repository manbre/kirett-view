import { create } from "zustand";
import { Category } from "@/constants/category";

interface Store {
  selectedTerms: Record<Category, string[]>;
  suggestions: string[];

  selectTerm: (category: Category, term: string) => void;
  unselectTerm: (category: Category, term: string) => void;
  fetchSuggestions: () => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  selectedTerms: {},
  suggestions: [],

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
    // console.log(get().selectedTerms);
    // get().fetchSuggestions();
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
    // get().fetchSuggestions();
  },

  // fetchSuggestions: async () => {
  //   try {
  //     const allTerms = Object.values(get().selectedTerms).flat();
  //     const res = await fetch("/api/terms/suggestions", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(allTerms),
  //     });
  //     const data = await res.json();
  //     set({ suggestions: data });
  //   } catch (error) {
  //     console.error("error while calling suggestions:", error);
  //   }
  // },
}));
