import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getSymptomsSubgraph(
  symptoms: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n:DisplayNode)-[r]-(neighbor)
    WHERE n.Name IN $symptoms
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
    { symptoms },
  );

  return result.records;
}
