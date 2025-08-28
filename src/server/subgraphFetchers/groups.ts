import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export async function getGroupsSubgraph(
  groups: string[],
  tx: Transaction,
): Promise<Neo4jRecord[]> {
  if (!Array.isArray(groups) || groups.length === 0) return [];
  const result = await tx.run(
    `
MATCH (n:JumpNode)-[r]-(neighbor)
  WHERE n.BPR = "Disease Groups"
  AND ANY(x IN $groups WHERE toLower(n.Name) = toLower(x))
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
    { groups },
  );

  return result.records;
}
