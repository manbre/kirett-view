// src/hooks/useGraphApi.ts
import { Category } from "@/constants/category";

type SelectedTerms = Record<Category, string[]>;

export const useGraphApi = () => {
  const fetchGraphDelta = async (selectedTerms: SelectedTerms) => {
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms }),
    });

    if (!res.ok) throw new Error("Fehler beim Laden des Graphen");
    return await res.json();
  };

  return { fetchGraphDelta };
};
