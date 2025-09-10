import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

// "NS" appears only once and represents the same concept as "NFS"
const roleSynonyms: Record<string, string> = {
  NS: "NFS",
};

export async function getRolesSubgraph(
  roles: string[],
  tx: Transaction,
  depth: ("1" | "2")[],
  include: string[],
): Promise<Neo4jRecord[]> {
  const normalizedRoles = Array.from(
    new Set(roles.map((r) => roleSynonyms[r] ?? r)),
  );

  const key = Array.from(new Set(depth)).sort().join(",");

  let query = "";

  switch (key) {
    case "1":
    case "2":
    case "1,2":
      // attributes "Betrifft1", "Betrifft2" store role names (e.g. "NFS", "RA")
      query = `
   MATCH (n)
    UNWIND keys(n) AS prop
  WITH n, prop
    WHERE prop CONTAINS "Betrifft" AND n[prop] IN $roles
    AND ANY (l IN labels(n) WHERE l IN $include)
  RETURN n AS n

    `;
      break;

    default: // fallback: without label restriction
      query = `
    MATCH (n)
    UNWIND keys(n) AS prop
  WITH n, prop
    WHERE prop CONTAINS "Betrifft" AND n[prop] IN $roles
  RETURN n AS n
    `;
      break;
  }

  const result = await tx.run(query, { roles: normalizedRoles, include });
  return result.records;
}
