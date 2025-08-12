import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Category } from "@/constants/category";

type Props = {
  selectedCategory: Category;
};

type Term = {
  label: string;
};

export const TermField = ({ selectedCategory }: Props) => {
  const { selectedTerms, selectTerm, unselectTerm } = useStore();

  const [terms, setTerms] = useState<Term[]>([]);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/terms/${selectedCategory}`);
        if (!res.ok) throw new Error("network error while loading terms");
        const data = await res.json();
        setTerms(data);
      } catch (err) {
        console.error("error while loading terms:", err);
        setTerms([]);
      }
    };

    fetchTerms();
  }, [selectedCategory]);

  const selected = selectedTerms[selectedCategory] ?? [];

  return (
    <div className="bg-fore mt-2 ml-2 grid h-[calc(100%_-_2.5rem)] w-65 grid-cols-1 overflow-x-hidden overflow-y-scroll rounded-lg border border-[var(--border)] p-1 pb-3">
      {terms.map(({ label }, index) => {
        const isSelected = selected.includes(label);

        return (
          <button
            key={`${label}-${index}`}
            onClick={() =>
              isSelected
                ? unselectTerm(selectedCategory, label)
                : selectTerm(selectedCategory, label)
            }
            className="border-b-2 whitespace-normal"
          >
            <span
              className={`hover:cursor-pointer hover:text-[var(--mark)] ${
                isSelected ? "text-[var(--mark)]" : "text-[var(--text)]"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
