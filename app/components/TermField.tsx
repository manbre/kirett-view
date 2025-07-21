import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export const TermField = () => {
  const {
    selectedCategory,
    selectedTerms,
    selectTerm,
    suggestions,
    unselectTerm,
  } = useStore();
  const [terms, setTerms] = useState<{ label: string }[]>([]);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/${selectedCategory}`);
        const data = await res.json();
        setTerms(data);
      } catch (err) {
        console.error("Fehler beim Laden der Begriffe:", err);
        setTerms([]);
      }
    };

    fetchTerms();
  }, [selectedCategory]);

  return (
    <div className="bg-fore mt-2 ml-2 grid h-[calc(100%_-_2.5rem)] w-fit grid-cols-1 overflow-scroll overflow-x-hidden rounded-lg border-1 border-[var(--border)] p-1 sm:grid-cols-1 md:grid-cols-1">
      {terms.map((term, index) => {
        const isSelected = selectedTerms.some((t) => t.term === term.label);
        const isSuggested = suggestions.includes(term.label);

        return (
          <button
            key={`${term.label}-${index}`}
            onClick={() =>
              isSelected ? unselectTerm(term.label) : selectTerm(term.label)
            }
            className={
              "w-64 justify-self-start p-1 whitespace-normal hover:cursor-pointer"
            }
          >
            <span
              className={` ${
                isSelected
                  ? "text-[var(--mark)]"
                  : isSuggested
                    ? "text-green-300"
                    : "text-[var(--text)]"
              }`}
            >
              {term.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
