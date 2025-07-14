"use client";

import { useEffect, useState } from "react";

interface SelectBarProps {
  selectedCategory: Category | null;
  onSelectedTerm: (category: Category, term: string) => void;
  selectedTerms: string[];
}

interface Term {
  value: string;
  label: string;
  group: string;
}

export const SelectBar = ({
  selectedCategory,
  selectedTerms,
  onSelectedTerm,
  onRemoveTerm,
}: SelectBarProps) => {
  const [terms, setTerms] = useState<Term[]>([]);

  useEffect(() => {
    if (!selectedCategory) return;

    fetch(`/api/${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => setTerms(data))
      .catch((err) => console.error(err));
  }, [selectedCategory]);

  const groupedTerms = terms.reduce(
    (groups, term) => {
      const group = term.group || "Andere";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(term);
      return groups;
    },
    {} as Record<string, Term[]>,
  );

  return (
    <div className="bg-fore mt-2 ml-2 h-[calc(100%_-_2.5rem)] w-fit overflow-scroll overflow-x-hidden rounded-lg border-1 border-[var(--border)] p-1">
      {Object.entries(groupedTerms).map(([groupName, groupTerms]) => (
        <div key={groupName} className="">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1">
            {groupTerms.map((term, index) => {
              const isSelected = selectedTerms.includes(term.label);

              return (
                <button
                  key={`${term.label}-${index}`}
                  onClick={() =>
                    isSelected
                      ? onRemoveTerm(selectedCategory, term.label)
                      : onSelectedTerm(selectedCategory, term.label)
                  }
                  className={
                    "w-64 justify-self-start p-1 whitespace-normal hover:cursor-pointer"
                  }
                >
                  <span
                    className={`${isSelected ? "text-[var(--mark)]" : "text-[var(--text)]"}`}
                  >
                    {term.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {terms.length === 0 && <div>Keine Begriffe gefunden.</div>}
    </div>
  );
};
