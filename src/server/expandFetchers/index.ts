import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";
import { getNeighbors } from "./neighbors";

export const expandFetchers = {
  neighbors: (nodeId: string, tx: Transaction) => getNeighbors(nodeId, tx),
  attributes: (nodeId: string, tx: Transaction) => getAttributes(nodeId, tx),
} satisfies Record<
  string,
  (nodeId: string, tx: Transaction) => Promise<Neo4jRecord[]>
>;
