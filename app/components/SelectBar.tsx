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
  onSelectedTerm,
  selectedTerms,
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
    <div
      style={{
        backgroundColor: "var(--foreground)",
        height: "calc(100vh - 2.5rem)",
        border: "1.5px solid var(--border)",
      }}
      className="mt-2 ml-2 w-fit overflow-scroll overflow-x-hidden rounded-lg p-1"
    >
      {Object.entries(groupedTerms).map(([groupName, groupTerms]) => (
        <div key={groupName} className="">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1">
            {groupTerms.map((term, index) => {
              const isSelected = selectedTerms.includes(term.label);

              return (
                <button
                  key={`${term.label}-${index}`}
                  onClick={() => onSelectedTerm(selectedCategory, term.label)}
                  style={isSelected ? { color: "var(--mark)" } : undefined}
                  className={"w-64 justify-self-start p-1 whitespace-normal"}
                >
                  {term.label}
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
