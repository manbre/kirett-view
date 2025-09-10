import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getOthersSubgraph(
  others: string[],
  tx: Transaction,
  depth: ("1" | "2")[],
  include: string[],
): Promise<Neo4jRecord[]> {
  const key = Array.from(new Set(depth)).sort().join(",");

  let query = "";

  switch (key) {
    case "1":
    case "2":
    case "1,2":
      query = `
MATCH (n)
    WHERE ANY(label IN labels(n) WHERE label IN $others)
RETURN n AS n
  `;
      break;

    default: // fallback: without label restriction
      query = `
 MATCH (n)
    WHERE ANY(label IN labels(n) WHERE label IN $others)
RETURN n AS n
    `;
      break;
  }

  const result = await tx.run(query, { others, include });
  return result.records;
}
// Subgraph fetcher for miscellaneous nodes (Others)
