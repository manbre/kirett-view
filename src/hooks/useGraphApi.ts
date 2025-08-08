import { Category } from "@/constants/category";

export type SelectedTerms = Record<Category, string[]>;

export const useGraphApi = () => {
  const fetchGraphData = async (selectedTerms: SelectedTerms) => {
    const res = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms }),
    });

    if (!res.ok) throw new Error("Fehler beim Laden des Graphen");
    return res.json(); // { nodes, edges }
  };

  const fetchNeighbors = async (nodeId: string) => {
    const res = await fetch("/api/graph/expand/neighbors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId }),
    });
    if (!res.ok) throw new Error("Fehler beim Laden der Nachbarn");
    return res.json(); // { nodes, edges }
  };

  return { fetchGraphData, fetchNeighbors };
};
