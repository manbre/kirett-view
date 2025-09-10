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
    <div
      className="max-h-[18dvh] overflow-auto rounded-xl border border-[var(--color-border)] p-1.5 md:h-full md:max-h-none"
      role="list"
      aria-label="Begriffe"
    >
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
            className={[
              "group flex w-full items-center justify-between border-b py-2 text-left",
              "border-[var(--color-border)] last:border-b-0 hover:cursor-pointer",
            ].join(" ")}
            aria-pressed={isSelected}
          >
            <span
              className={`group-hover:text-[var(--color-mark)] ${
                isSelected
                  ? "text-[var(--color-mark)]"
                  : "text-[var(--color-text)]"
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
// TermField: shows selectable terms for the active category; writes to store
