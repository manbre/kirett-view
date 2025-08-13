import { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getNeighbors(
  nodeId: string,
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n)-[r]-(neighbor)
    WHERE id(n) = toInteger($nodeId)
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
    { nodeId },
  );
  return result.records;
}
