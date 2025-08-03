import { useCallback } from "react";
import { Category } from "@/constants/category";

type SelectedTerms = Record<Category, string[]>;

export const useGraphApi = () => {
  return useCallback(async (terms: SelectedTerms) => {
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms: terms }),
    });

    if (!res.ok) {
      throw new Error("graph api request failed");
    }

    return res.json();
  }, []);
};
