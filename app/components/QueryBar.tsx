"use client";

import React from "react";
import { Category, CategoryLabels } from "@/constants/category";

interface QueryBarProps {
  selectedTerms: Record<Category, string[]>;
  selectedCategory: Category | null;
  onSelectCategory: (category: Category) => void;
  onRemoveTerm: (category: Category, term: string) => void;
}
export const QueryBar: React.FC<QueryBarProps> = ({
  selectedTerms,
  selectedCategory,
  onSelectCategory,
  onRemoveTerm,
}) => {
  return (
    <div className="h-fit w-screen pt-1">
      <div className="flex flex-row">
        {Object.entries(CategoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onSelectCategory(key as Category)}
            style={{
              borderBottom: "2px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottom = "2px solid var(--mark)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottom = "2px solid transparent";
            }}
            className={`mx-3 text-left hover:cursor-pointer py-4${
              selectedCategory === key ? "" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Begriffe in dieser Kategorie anzeigen */}
      {Object.entries(selectedTerms).map(([key, terms]) => {
        const category = key as Category;
        if (terms.length === 0) return null;

        return (
          <div key={category} className="mb-3">
            {/* <h3 className="">{CategoryLabels[category]}</h3> */}
            <div className="flex flex-wrap gap-2">
              {terms.map((term) => (
                <div key={`${category}-${term}`} className="">
                  {term}
                  <button
                    onClick={() => onRemoveTerm(category, term)}
                    className=""
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
