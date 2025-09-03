import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],
  tx: Transaction,
  depth: string[],
  include: string[],
): Promise<Neo4jRecord[]> {
  const key = Array.from(new Set(depth)).sort().join(",");

  let query = "";

  switch (key) {
    case "1": // hop1
      query = `
  MATCH (n:BPRNode)-[r1]-(nbr1)
    WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
    AND ANY (l IN labels(nbr1) WHERE l IN $include)
  RETURN n, r1 AS r, nbr1 AS neighbor
    `;
      break;

    case "2": // hop2
      query = `
  MATCH (n:BPRNode)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
    AND ANY (l IN labels(nbr2) WHERE l IN $include)
  RETURN n, r2 AS r, nbr2 AS neighbor
    `;
      break;

    case "1,2": // hop1 & hop2
      query = `
  MATCH (n:BPRNode)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
  WITH n, r1, r2, nbr1, nbr2
    UNWIND [[nbr1, r1], [nbr2, r2]] AS pair
  WITH n, pair[0] AS nbr, pair[1] AS r
    WHERE ANY(l IN labels(nbr) WHERE l IN $include)
  RETURN DISTINCT n, r, nbr AS neighbor
    `;
      break;

    default: // fallback: hop1 without label restriction
      query = `
  MATCH (n:BPRNode)-[r1]-(nbr1)
    WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
  RETURN n, r1 AS r, nbr1 AS neighbor
    `;
      break;
  }

  const result = await tx.run(query, { pathways, include });
  return result.records;
}
