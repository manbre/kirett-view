import { Session, Record } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],
  session: Session,
): Promise<Record[]> {
  const result = await session.run(
    `
MATCH (n:BPRNode)-[r]-(neighbor)
    WHERE n.BPR IN $pathways
    AND neighbor.Name <> "Alle Behandlungspfade"
    AND neighbor.Name <> "Andere Krankheiten"
RETURN n, r, neighbor
    `,
    { pathways },
  );

  return result.records;
}
