import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],

  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n:BPRNode)-[r1]-(m)-[r2]-(neighbor)
    WHERE ANY(x IN $pathways WHERE toLower(n.BPR) = toLower(x))
    AND neighbor.Name <> "Alle Behandlungspfade"
    AND neighbor.Name <> "Andere Krankheiten"
RETURN n AS n, r2 AS r, neighbor AS neighbor
    `,
    { pathways },
  );

  return result.records;
}
