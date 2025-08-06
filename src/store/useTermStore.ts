import { create } from "zustand";
import { CATEGORIES, type Category } from "@/constants/category";

export type TermStore = {
  termsByCategory: Record<Category, string[]>;
  setTermsForCategory: (category: Category, terms: string[]) => void;
  getSelectedTerms: () => string[];
};

const initialState: Record<Category, string[]> = Object.fromEntries(
  CATEGORIES.map((cat) => [cat, []]),
) as Record<Category, string[]>;

export const useTermStore = create<TermStore>((set, get) => ({
  termsByCategory: initialState,

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
}));
