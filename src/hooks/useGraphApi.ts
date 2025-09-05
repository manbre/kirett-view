import { Category } from "@/constants/category";

export type SelectedTerms = Record<Category, string[]>;
export type SelectedTypes = string[];
export type SelectedHops = string[]; // "HopOne" | "HopTwo"

export const useGraphApi = () => {
  const fetchGraphData = async (
    selectedTerms: SelectedTerms,
    selectedTypes: SelectedTypes,
    selectedHops: SelectedHops,
    showOnlyEdges: boolean,
  ) => {
    // Labels übernehmen
    const include = selectedTypes;

    // Hops mappen auf "1"/"2"
    const depth: ("1" | "2")[] = [];
    if (selectedHops.includes("HopOne")) depth.push("1");
    if (selectedHops.includes("HopTwo")) depth.push("2");
    if (depth.length === 0) depth.push("1"); // Default: immer mindestens 1-Hop

    const res = await fetch("/api/graph/subgraphs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedTerms, depth, include, showOnlyEdges }),
    });

    if (!res.ok) throw new Error("error while loading graph");
    return res.json(); // { nodes, edges }
  };

  const fetchNeighbors = async (nodeId: string) => {
    const res = await fetch("/api/graph/expand/neighbors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, depth, include, showOnlyEdges }),
    });
    if (!res.ok) throw new Error("error while loading neighbors");
    return res.json();
  };

  return { fetchGraphData, fetchNeighbors };
};
