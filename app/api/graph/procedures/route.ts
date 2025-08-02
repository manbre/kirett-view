import { Session } from "neo4j-driver";

export async function getProceduresSubgraph(
  procedures: string[],
  session: Session,
) {
  const result = await session.run(
    `
MATCH (n:SAAProcedureNode)-[r]-(neighbor)
    WHERE ANY(term IN $procedures WHERE n.Name CONTAINS term)
    AND neighbor.Name <> "Alle Standardarbeitsanweisungen"
RETURN id(n) AS id, n.name AS name, labels(n) AS labels, n, r, neighbor
    `,
    { procedures },
  );

  return result.records;
}
