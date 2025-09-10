"use client";

import { Category, CategoryLabels } from "@/constants/category";
import { useStore } from "@/store/useStore";
import { useMemo } from "react";

type Props = {
  selectedCategory: Category | null;
  onChangeCategory: (category: Category) => void;
};

// CategoryTabs: renders category pills with counts; integrates with store selection
export const CategoryTabs = ({ selectedCategory, onChangeCategory }: Props) => {
  const selectedTerms = useStore((state) => state.selectedTerms);

  const entries = useMemo(
    () =>
      Object.entries(CategoryLabels).sort((a, b) => a[1].localeCompare(b[1])),
    [],
  );

  return (
    <div
      role="tablist"
      aria-label="Kategorien"
      className="no-scrollbar -mx-2 flex h-fit w-full snap-x snap-mandatory flex-row gap-2 overflow-x-auto px-2 pt-2 pb-1 whitespace-nowrap"
    >
      {entries.map(([catKey, label]) => {
        const category = catKey as Category;
        const hasAny =
          Array.isArray(selectedTerms[category]) &&
          selectedTerms[category].length > 0;
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            data-cat={category}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChangeCategory(category)}
            className={[
              "hover:cursor-pointer",
              "relative inline-flex snap-start items-center justify-center",
              "h-9 rounded-full border px-3 text-sm",
              "transition-colors",
              isActive
                ? "border-[var(--color-mark)] bg-[var(--color-mark)] text-white"
                : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-mark)] hover:text-[var(--color-mark)]",
            ].join(" ")}
          >
            <span>{label}</span>
            {hasAny && (
              <span
                className="ml-1 inline-flex min-w-[1.5em] items-center justify-center rounded-full bg-white px-2 py-1 text-xs leading-none font-medium text-black md:text-sm 2xl:text-[0.8em]"
                aria-label={`${selectedTerms[category].length} ausgewählt`}
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
