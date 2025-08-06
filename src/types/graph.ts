import { Node, Relationship } from "neo4j-driver";

// Struktur eines Knotens für das Frontend
export type GraphNode = {
  id: string;
  label: string;
  data: Record<string, unknown>;
};

// Struktur einer Kante für das Frontend
export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export type SubgraphResult = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

// Record aus Neo4j für get("n"), get("neighbor") etc.
export type GraphRecord = {
  get: (key: "n" | "neighbor" | "r") => Node | Relationship;
};
