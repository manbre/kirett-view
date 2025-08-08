import { Session, Record } from "neo4j-driver";

export async function getNeighbors(
  nodeId: string,
  session: Session,
): Promise<Record[]> {
  const result = await session.run(
    `
MATCH (n)-[r]-(neighbor)
    WHERE id(n) = toInteger($nodeId)
RETURN n, r, neighbor
    `,
    { nodeId },
  );

  return result.records;
}
