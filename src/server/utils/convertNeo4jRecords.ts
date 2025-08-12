import type { Node, Relationship, Record as Neo4jRecord } from "neo4j-driver";
import type { GraphNode, GraphEdge } from "@/types/graph";

export function convertNeo4jRecords(records: Neo4jRecord[]) {
  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  for (const record of records) {
    const n = record.get("n") as Node;
    const nId = n.identity.toString();

    if (!nodesMap.has(nId)) {
      nodesMap.set(nId, {
        id: nId,
        label: n.properties?.Name ?? n.labels?.[0] ?? "Node",
        data: {
          ...n.properties,
          labels: n.labels,
          type: n.labels?.[0] ?? null,
        },
      });
    }

    if (record.has("neighbor") && record.has("r")) {
      const neighbor = record.get("neighbor") as Node;
      const r = record.get("r") as Relationship;
      const neighborId = neighbor.identity.toString();

      if (!nodesMap.has(neighborId)) {
        nodesMap.set(neighborId, {
          id: neighborId,
          label: neighbor.properties?.Name ?? neighbor.labels?.[0] ?? "Node",
          data: {
            ...neighbor.properties,
            labels: neighbor.labels,
            type: neighbor.labels?.[0] ?? null,
          },
        });
      }

      edges.push({
        id: r.identity.toString(),
        source: r.start.toString(),
        target: r.end.toString(),
        label: r.type,
      });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}
