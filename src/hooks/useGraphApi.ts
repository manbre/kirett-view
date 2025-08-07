import { Category } from "@/constants/category";
import { GraphNode, GraphEdge } from "@/types/graph";

type SelectedTerms = Record<Category, string[]>;

export const useGraphApi = () => {
  const fetchGraphData = async (
    selectedTerms: SelectedTerms,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> => {
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms }),
    });

    if (!res.ok) throw new Error("Fehler beim Laden des Graphen");

    return res.json();
  };

  return { fetchGraphData };
};
