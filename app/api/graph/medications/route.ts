import { Session } from "neo4j-driver";

export async function getMedicationsSubgraph(
  medications: string[],
  session: Session,
) {
  const result = await session.run(
    `
MATCH (n:SAAMedicationNode)-[r]-(neighbor)
    WHERE ANY(term IN $medications WHERE n.Name CONTAINS term)
    AND neighbor.Name <> "Alle Standardarbeitsanweisungen"
RETURN n, r, neighbor
    `,
    { medications },
  );

  return result.records;
}
