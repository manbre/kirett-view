"use client";

import { Category, CategoryLabels } from "@/constants/category";
import { useStore } from "@/store/useStore";

export const CategoryTabs = () => {
  const { selectedCategory, changeCategory } = useStore();

  return (
    <div className="flex h-fit w-screen flex-row pt-1">
      {Object.entries(CategoryLabels).map(([categoryValue, label]) => (
        <button
          key={categoryValue}
          onClick={() => changeCategory(categoryValue as Category)}
          className={`mx-3 border-b-2 hover:cursor-pointer hover:border-[var(--mark)] ${
            selectedCategory === categoryValue
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
