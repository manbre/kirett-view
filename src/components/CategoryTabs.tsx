"use client";

import { Category, CategoryLabels } from "@/constants/category";
import { useStore } from "@/store/useStore";

type Props = {
  selectedCategory: Category | null;
  onChangeCategory: (category: Category) => void;
};

export const CategoryTabs = ({ selectedCategory, onChangeCategory }: Props) => {
  const selectedTerms = useStore((state) => state.selectedTerms);

  return (
    <div className="flex h-fit w-screen flex-row pt-1">
      {Object.entries(CategoryLabels)
        // in alphabetical order
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([catKey, label]) => {
          const category = catKey as Category;
          // check if at least one term is out of the category
          const hasAny =
            Array.isArray(selectedTerms[category]) &&
            selectedTerms[category].length > 0;
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => onChangeCategory(category)}
              className={`relative mx-3 my-2 border-b-2 hover:cursor-pointer hover:border-[var(--mark)] ${
                isActive ? "border-[var(--mark)]" : "border-transparent"
              } `}
            >
              {label}
              {hasAny && (
                <span
                  className="absolute top-4 text-xs text-blue-400"
                  // title={`${selectedTerms[category].length} ausgewählt`}
                >
                  {selectedTerms[category].length}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
};
