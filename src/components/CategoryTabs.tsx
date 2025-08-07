"use client";

import { Category, CategoryLabels } from "@/constants/category";

type Props = {
  selectedCategory: Category | null;
  onChangeCategory: (category: Category) => void;
};

export const CategoryTabs = ({ selectedCategory, onChangeCategory }: Props) => {
  return (
    <div className="flex h-fit w-screen flex-row pt-1">
      {Object.entries(CategoryLabels)
        // in alphabetical order
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([category, label]) => (
          <button
            key={category}
            onClick={() => onChangeCategory(category as Category)}
            className={`mx-3 border-b-2 hover:cursor-pointer hover:border-[var(--mark)] ${
              selectedCategory === category
                ? "border-[var(--mark)]"
                : "border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
    </div>
  );
};
