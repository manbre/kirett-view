import { Session, Record } from "neo4j-driver";

// "NS" appears only once and represents the same concept as "NFS"
const roleSynonyms: Record<string, string> = {
  NS: "NFS",
};

export async function getRolesSubgraph(
  roles: string[],
  session: Session,
): Promise<Record[]> {
  const normalizedRoles = Array.from(
    new Set(roles.map((r) => roleSynonyms[r] ?? r)),
  );
  // attributes "Betrifft1", "Betrifft2" store role names (e.g. "NFS", "RA")
  const result = await session.run(
    `
  MATCH (n)
    UNWIND keys(n) AS prop
    WITH n, prop
    WHERE prop CONTAINS "Betrifft" AND n[prop] IN $roles
  RETURN n
    `,
    { roles: normalizedRoles },
  );

  return result.records;
}
