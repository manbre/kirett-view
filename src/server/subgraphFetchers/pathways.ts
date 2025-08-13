import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n:BPRNode)-[r]-(neighbor)
    WHERE n.BPR IN $pathways
    AND neighbor.Name <> "Alle Behandlungspfade"
    AND neighbor.Name <> "Andere Krankheiten"
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
    { pathways },
  );

  return result.records;
}
