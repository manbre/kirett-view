import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getMedicationsSubgraph(
  medications: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n:SAAMedicationNode)-[r]-(neighbor)
    WHERE ANY(x IN $medications WHERE toLower(n.Name) CONTAINS toLower(x))
    AND neighbor.Name <> "Alle Standardarbeitsanweisungen"
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
    { medications },
  );

  return result.records;
}
