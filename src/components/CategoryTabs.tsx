"use client";

import { Category, CategoryLabels } from "@/constants/category";
import { useStore } from "@/store/useStore";
import { useMemo, KeyboardEvent } from "react";

type Props = {
  selectedCategory: Category | null;
  onChangeCategory: (category: Category) => void;
};

export const CategoryTabs = ({ selectedCategory, onChangeCategory }: Props) => {
  const selectedTerms = useStore((state) => state.selectedTerms);

  const entries = useMemo(
    () =>
      Object.entries(CategoryLabels).sort((a, b) => a[1].localeCompare(b[1])),
    [],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target?.role !== "tab") return;
    const idx = entries.findIndex(([key]) => key === target.dataset.cat);
    if (idx === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = entries[(idx + 1) % entries.length]?.[0] as Category;
      onChangeCategory(next);
      (document.querySelector(`[data-cat="${next}"]`) as HTMLElement)?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = entries[
        (idx - 1 + entries.length) % entries.length
      ]?.[0] as Category;
      onChangeCategory(prev);
      (document.querySelector(`[data-cat="${prev}"]`) as HTMLElement)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Kategorien"
      className="no-scrollbar -mx-2 flex h-fit w-full snap-x snap-mandatory flex-row gap-2 overflow-x-auto px-2 pt-2 pb-1 whitespace-nowrap"
      onKeyDown={onKeyDown}
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
                ? "border-[var(--mark)] bg-[var(--mark)] text-white"
                : "bg-fore border-[var(--border)] text-[var(--text)] hover:border-[var(--mark)] hover:text-[var(--mark)]",
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
