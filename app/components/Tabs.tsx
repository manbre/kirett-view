"use client";
import { Category, CategoryLabels } from "@/constants/category";

interface TabsProps {
  activeCategory: Category;
  onSelect: (category: Category) => void;
}

export const Tabs = ({ activeCategory, onSelect }: TabsProps) => {
  return (
    <div className="flex flex-col w-fit border-t-2-black border-gray-300 bg-white">
      {Object.entries(CategoryLabels).map(([key, label]) => {
        const category = key as Category;
        const isActive = activeCategory === category;

        return (
          <button
            key={key}
            onClick={() => onSelect(category)}
            className={`px-4 py-2 rounded-t ${
              isActive ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
