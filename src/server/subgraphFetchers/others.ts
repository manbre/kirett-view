import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getOthersSubgraph(
  others: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n)
    WHERE any(label IN labels(n) WHERE label IN $others)
RETURN n AS n
  `,
    { others },
  );

  return result.records;
}
