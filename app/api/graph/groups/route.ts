import { Session } from "neo4j-driver";

export async function getGroupsSubgraph(groups: string[], session: Session) {
  const result = await session.run(
    `
MATCH (j:JumpNode)-[r]-(neighbor)
  WHERE j.BPR = "Disease Groups"
  AND j.Name IN $groups
RETURN id(j) AS id, j.name AS name, labels(j) AS labels, j, r, neighbor
    `,
    { groups },
  );

  return result.records;
}
