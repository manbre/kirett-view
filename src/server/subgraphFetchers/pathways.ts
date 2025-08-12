import { Session, Record } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],
  session: Session,
): Promise<Record[]> {
  return session.executeRead(async (tx) => {
    const result = await tx.run(
      `
MATCH (n:BPRNode)-[r]-(neighbor)
    WHERE n.BPR IN $pathways
    AND neighbor.Name <> "Alle Behandlungspfade"
    AND neighbor.Name <> "Andere Krankheiten"
RETURN n AS n, r AS r, neighbor AS neighbor
    `,
      { pathways },
    );

    return result.records;
  });
}
