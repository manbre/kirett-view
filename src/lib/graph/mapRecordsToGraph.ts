import type { Record } from "neo4j-driver";
import type { GraphNode, GraphEdge } from "@/types/graph";

export function mapRecordsToGraph(records: Record[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();

  for (const record of records) {
    const n = record.get("n");
    const neighbor = record.get("neighbor");
    const r = record.get("r");

    if (n && n.identity) {
      nodeMap.set(n.identity.toString(), {
        id: n.identity.toString(),
        label: n.labels[0],
        data: n.properties,
      });
    }

    if (neighbor && neighbor.identity) {
      nodeMap.set(neighbor.identity.toString(), {
        id: neighbor.identity.toString(),
        label: neighbor.labels[0],
        data: neighbor.properties,
      });
    }

    if (r && r.identity) {
      edgeMap.set(r.identity.toString(), {
        id: r.identity.toString(),
        source: r.start.toString(),
        target: r.end.toString(),
        type: r.type,
        data: r.properties,
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}
