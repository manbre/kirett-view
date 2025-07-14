"use client";
import React from "react";
import { Category, CategoryLabels } from "@/constants/category";

interface TabsProps {
  activeCategory: Category | null;
  onSelectCategory: (category: Category) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex h-fit w-screen flex-row pt-1">
      {Object.entries(CategoryLabels).map(([key, label]) => {
        const category = key as Category;
        const isActive = activeCategory === category;

        return (
          <button
            key={key}
            onClick={() => onSelectCategory(category)}
            className={`mx-3 border-b-2 hover:cursor-pointer hover:border-[var(--mark)] ${
              isActive ? "border-[var(--mark)]" : "border-transparent"
            }`}
          >
            {label}
            {/* <span class="icon">💡</span> */}
          </button>
        );
      })}
    </div>
  );
};
