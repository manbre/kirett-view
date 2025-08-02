import { Session } from "neo4j-driver";

export async function getRolesSubgraph(roles: string[], session: Session) {
  // attributes "Betrifft1", "Betrifft2" store role names (e.g. "NFS", "RA")
  const result = await session.run(
    `
    MATCH (n)
      UNWIND keys(n) AS prop
      WITH n, prop
      WHERE prop CONTAINS "Betrifft" AND n[prop] IN $roles
    RETURN id(n) AS id, n.name AS name, labels(n) AS labels, n
    `,
    { roles },
  );

  return result.records;
}
