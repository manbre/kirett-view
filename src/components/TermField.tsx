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
      className="bg-fore max-h-[30dvh] overflow-auto rounded-xl border border-[var(--border)] p-2 md:h-full md:max-h-none"
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
              "hover:bg-back border-[var(--border)] last:border-b-0",
            ].join(" ")}
            aria-pressed={isSelected}
          >
            <span
              className={`hover:cursor-pointer ${
                isSelected ? "text-[var(--mark)]" : "text-[var(--text)]"
              }`}
            >
              {label}
            </span>
            <span
              className={[
                "ml-3 inline-flex h-4 w-4 items-center justify-center rounded-sm border",
                isSelected
                  ? "border-[var(--mark)] bg-[var(--mark)]"
                  : "bg-fore border-[var(--border)]",
              ].join(" ")}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};
