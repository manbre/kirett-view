import { Session, Record } from "neo4j-driver";

export async function getGroupsSubgraph(
  groups: string[],
  session: Session,
): Promise<Record[]> {
  if (!Array.isArray(groups) || groups.length === 0) return [];
  return session.executeRead(async (tx) => {
    const result = await tx.run(
      `
MATCH (n:JumpNode)-[r]-(neighbor)
  WHERE n.BPR = "Disease Groups"
  AND n.Name IN $groups
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
      { groups },
    );

    return result.records;
  });
}
