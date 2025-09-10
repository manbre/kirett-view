import { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getNeighbors(
  nodeId: string,
  depth: ("1" | "2")[],
  include: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const key = Array.from(new Set(depth)).sort().join(",");

  let query = "";

  switch (key) {
    case "1": // hop1
      query = `
  MATCH (n)-[r1]-(nbr1)
    WHERE id(n) = toInteger($nodeId)
    AND ANY (l IN labels(nbr1) WHERE l IN $include)
  RETURN n AS n, r1 AS r, nbr1 AS neighbor
    `;
      break;

    case "2": // hop2
      query = `
  MATCH (n)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE id(n) = toInteger($nodeId)
    AND ANY (l IN labels(nbr2) WHERE l IN $include)
  RETURN n AS n, r2 AS r, nbr2 AS neighbor
    `;
      break;

    case "1,2": // hop1 & hop2
      query = `
  MATCH (n)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE id(n) = toInteger($nodeId)
  WITH n, r1, r2, nbr1, nbr2
    UNWIND [[nbr1, r1], [nbr2, r2]] AS pair
  WITH n, pair[0] AS nbr, pair[1] AS r
    WHERE ANY (l IN labels(nbr) WHERE l IN $include)
  RETURN n AS n, r AS r, nbr AS neighbor
    `;
      break;

    default: // fallback: hop1 without label restriction
      query = `
  MATCH (n)-[r1]-(nbr1)
    WHERE id(n) = toInteger($nodeId)
  RETURN n AS n, r1 AS r, nbr1 AS neighbor
    `;
      break;
  }

  const result = await tx.run(query, { nodeId, include });
  return result.records;
}
// Expand fetcher: returns 1/2-hop neighborhood for a given node id
