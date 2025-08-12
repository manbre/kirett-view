import { Session, Record } from "neo4j-driver";

export async function getNeighbors(
  nodeId: string,
  session: Session,
): Promise<Record[]> {
  return session.executeRead(async (tx) => {
    const result = await tx.run(
      `
MATCH (n)-[r]-(neighbor)
    WHERE id(n) = toInteger($nodeId)
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
      { nodeId },
    );
    return result.records;
  });
}
