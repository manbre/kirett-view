import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";
import { getNeighbors } from "./neighbors";

export type ExpandFetcher = (
  nodeId: string[],
  tx: Transaction,
) => Promise<Neo4jRecord[]>;

export const expandFetchers: Record<ExpandFetcher> = {
  neighbors: getNeighbors,
};
