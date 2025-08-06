// export const useGraphApi = () => {
//   const fetchNodeIds = async (selectedTerms: any): Promise<string[]> => {
//     const res = await fetch("/api/graph", {
//       method: "POST",
//       body: JSON.stringify({ selectedTerms }),
//     });
//     if (!res.ok) throw new Error("Fehler beim Laden der Knoten-IDs");
//     const data = await res.json();
//     return data.nodeIds;
//   };

//   const resolveGraphData = async (nodeIds: string[]) => {
//     const res = await fetch("/api/graph/resolve", {
//       method: "POST",
//       body: JSON.stringify({ nodeIds }),
//     });
//     if (!res.ok) throw new Error("Fehler beim Laden der Graphdaten");
//     return res.json(); // { nodes, edges }
//   };

//   return { fetchNodeIds, resolveGraphData };
// };
