import { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getAttributes(
  nodeId: string,
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n)
    WHERE id(n) = toInteger($nodeId)
RETURN n AS n,
    `,
    { nodeId },
  );
  return result.records;
}
