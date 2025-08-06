import { Session, Record } from "neo4j-driver";

export async function getSymptomsSubgraph(
  symptoms: string[],
  session: Session,
): Promise<Record[]> {
  const result = await session.run(
    `
MATCH (n:DisplayNode)-[r]-(neighbor)
    WHERE n.Name IN $symptoms
RETURN n, r, neighbor
    `,
    { symptoms },
  );

  return result.records;
}
