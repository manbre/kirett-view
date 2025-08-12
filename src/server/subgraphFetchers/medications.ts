import { Session, Record } from "neo4j-driver";

export async function getMedicationsSubgraph(
  medications: string[],
  session: Session,
): Promise<Record[]> {
  return session.executeRead(async (tx) => {
    const result = await tx.run(
      `
MATCH (n:SAAMedicationNode)-[r]-(neighbor)
    WHERE ANY(term IN $medications WHERE n.Name CONTAINS term)
    AND neighbor.Name <> "Alle Standardarbeitsanweisungen"
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
      { medications },
    );

    return result.records;
  });
}
