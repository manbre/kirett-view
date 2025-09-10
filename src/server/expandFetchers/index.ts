import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";
import { getNeighbors } from "./neighbors";

export type ExpandFetcher = (
  nodeId: string,
  depth: ("1" | "2")[], // hop selection
  include: string[], // type selection
  tx: Transaction,
) => Promise<Neo4jRecord[]>;

export const expandFetchers: Record<string, ExpandFetcher> = {
  neighbors: getNeighbors,
};

export type ExpandAction = keyof typeof expandFetchers;
// Registry of server-side expand actions (e.g., neighbors)
