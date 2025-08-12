import type { Session, Record as Neo4jRecord } from "neo4j-driver";
import { getNeighbors } from "./neighbors";

// define all allowed expand actions here
export const expandFetchers = {
  neighbors: (nodeId: string, session: Session) =>
    getNeighbors(nodeId, session),
} satisfies Record<
  string,
  (nodeId: string, session: Session) => Promise<Neo4jRecord[]>
>;

export type ExpandAction = keyof typeof expandFetchers;
