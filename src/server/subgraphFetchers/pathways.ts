import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],
  tx: Transaction,
  depth: 1 | 2 | 3 = 2,
  exclude: string[] = ["JumpNode", "ActionNode", "DisplayNode", "BPRNode"],
): Promise<Neo4jRecord[]> {
  const q0 = `
MATCH (n:BPRNode)-[r1]-(m)
WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
  AND m.Name <> "Alle Behandlungspfade"
  AND m.Name <> "Andere Krankheiten"
AND NONE(l IN labels(m) WHERE l IN $exclude)
RETURN n, r1 AS r, m AS neighbor
`;

  const q1 = `
MATCH (n:BPRNode)-[r1]-(m)-[r2]-(nbr2)
WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
  AND nbr2.Name <> "Alle Behandlungspfade"
  AND nbr2.Name <> "Andere Krankheiten"
RETURN n, r2 AS r, nbr2 AS neighbor
`;

  const q2 = `
MATCH (n:BPRNode)-[r1]-(m)-[r2]-(nbr2)
WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
  AND nbr2.Name <> "Alle Behandlungspfade"
  AND nbr2.Name <> "Andere Krankheiten"
  UNWIND [r1,r2] AS r 
  UNWIND [m, nbr2] AS neighbor
RETURN n, r AS r, neighbor AS neighbor
`;

  //   const q2 = `
  // MATCH (n:BPRNode)-[r1]-(m)-[r2]-(nbr2)
  // WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
  //   AND nbr2.Name <> "Alle Behandlungspfade"
  //   AND nbr2.Name <> "Andere Krankheiten"
  //   UNWIND [r1,r2] AS r
  // RETURN n, r AS r, nbr2 AS neighbor
  // `;

  const result = await tx.run(depth === 1 ? q1 : q2, { pathways, exclude });
  return result.records;
}
