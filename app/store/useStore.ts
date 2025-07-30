import { create } from "zustand";

interface Store {
  selectedCategory: string | null;
  selectedTerms: string[];
  suggestions: string[];

  changeCategory: (string) => void;
  selectTerm: (string) => void;
  unselectTerm: (string) => void;
  fetchSuggestions: () => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  selectedCategory: null,
  selectedTerms: [],
  suggestions: [],

  changeCategory: (category) => {
    const prev = get().selectedCategory;
    if (prev === category) return;
    set({ selectedCategory: category });
  },

  selectTerm: (term) => {
    const prev = get().selectedTerms;
    if (prev.includes(term)) return;
    const updated = [...prev, term];
    set({ selectedTerms: updated });
    get().fetchSuggestions();
  },

  unselectTerm: (term) => {
    const filtered = get().selectedTerms.filter((t) => t !== term);
    set({ selectedTerms: filtered });
    get().fetchSuggestions();
  },

  fetchSuggestions: async () => {
    try {
      const res = await fetch("/api/terms/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().selectedTerms),
      });
      const data = await res.json();
      set({ suggestions: data });
    } catch (error) {
      console.error("error while calling suggestions:", error);
    }
  },
}));
