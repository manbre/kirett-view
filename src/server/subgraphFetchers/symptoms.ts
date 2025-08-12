import { Session, Record } from "neo4j-driver";

export async function getSymptomsSubgraph(
  symptoms: string[],
  session: Session,
): Promise<Record[]> {
  return session.executeRead(async (tx) => {
    const result = await tx.run(
      `
MATCH (n:DisplayNode)-[r]-(neighbor)
    WHERE n.Name IN $symptoms
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
      { symptoms },
    );

    return result.records;
  });
}
