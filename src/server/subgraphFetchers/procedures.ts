import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getProceduresSubgraph(
  procedures: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  const result = await tx.run(
    `
MATCH (n:SAAProcedureNode)-[r]-(neighbor)
    WHERE ANY(term IN $procedures WHERE n.Name CONTAINS term)
    AND neighbor.Name <> "Alle Standardarbeitsanweisungen"
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
    { procedures },
  );

  return result.records;
}
