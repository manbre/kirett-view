import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

//
// subgraph fetcher for diseases: returns nodes/edges around matching Nodes
export async function getDiseasesSubgraph(
  diseases: string[],
  tx: Transaction,
  depth: ("1" | "2")[],
  include: string[],
): Promise<Neo4jRecord[]> {
  const key = Array.from(new Set(depth)).sort().join(",");

  let query = "";

  switch (key) {
    case "1": // hop1
      query = `
  MATCH (n:DisplayNode)-[r1]-(nbr1)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
    AND ANY (l IN labels(nbr1) WHERE l IN $include)
  RETURN n AS n, r1 AS r, nbr1 AS neighbor

UNION

  MATCH (n:WarningNode)-[r1]-(nbr1)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
    AND ANY (l IN labels(nbr1) WHERE l IN $include)
  RETURN n AS n, r1 AS r, nbr1 AS neighbor
    `;
      break;

    case "2": // hop2
      query = `
  MATCH (n:DisplayNode)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
    AND ANY (l IN labels(nbr2) WHERE l IN $include)
  RETURN n AS n, r2 AS r, nbr2 AS neighbor

UNION

  MATCH (n:WarningNode)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
    AND ANY (l IN labels(nbr2) WHERE l IN $include)
  RETURN n AS n, r2 AS r, nbr2 AS neighbor
    `;
      break;

    case "1,2": // hop1 & hop2
      query = `
  MATCH (n:DisplayNode)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
  WITH n, r1, r2, nbr1, nbr2
    UNWIND [[nbr1, r1], [nbr2, r2]] AS pair
  WITH n, pair[0] AS nbr, pair[1] AS r
    WHERE ANY (l IN labels(nbr2) WHERE l IN $include)
  RETURN n AS n, r AS r, nbr AS neighbor

UNION

  MATCH (n:WarningNode)-[r1]-(nbr1)-[r2]-(nbr2)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
  WITH n, r1, r2, nbr1, nbr2
    UNWIND [[nbr1, r1], [nbr2, r2]] AS pair
  WITH n, pair[0] AS nbr, pair[1] AS r
    WHERE ANY (l IN labels(nbr2) WHERE l IN $include)
  RETURN n AS n, r AS r, nbr AS neighbor
    `;
      break;

    default: // fallback: hop1 without label restriction
      query = `
  MATCH (n:DisplayNode)-[r1]-(nbr1)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))
  RETURN n AS n, r1 AS r, nbr1 AS neighbor

UNION

  MATCH (n:WarningNode)-[r1]-(nbr1)
    WHERE ANY(x IN $diseases WHERE toLower(n.Name) CONTAINS toLower(x))   
  RETURN n AS n, r1 AS r, nbr1 AS neighbor
    `;
      break;
  }

  const result = await tx.run(query, { diseases, include });
  return result.records;
}
