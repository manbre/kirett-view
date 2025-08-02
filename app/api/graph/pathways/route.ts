import { Session } from "neo4j-driver";

export async function getPathwaysSubgraph(
  pathways: string[],
  session: Session,
) {
  const result = await session.run(
    `
MATCH (n:BPRNode)-[r]-(neighbor)
    WHERE n.BPR IN $pathways
    AND neighbor.Name <> "Alle Behandlungspfade"
    AND neighbor.Name <> "Andere Krankheiten"
RETURN id(n) AS id, n.name AS name, labels(n) AS labels, n, r, neighbor
    `,
    { pathways },
  );

  return result.records;
}
