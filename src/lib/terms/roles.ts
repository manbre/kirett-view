import { Session } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

// NS is treated the same as NFS
const roleSynonyms: Record<string, string> = {
  NS: "NFS",
};

export async function getRoleTerms(session: Session): Promise<TermItem[]> {
  const result = await session.run(
    `
     MATCH (n)
      UNWIND keys(n) AS prop
      WITH n, prop
      WHERE prop CONTAINS "Betrifft" AND exists(n[prop])
      RETURN DISTINCT n[prop] AS name
    `,
  );

  const rawNames = result.records.map((r) => r.get("name"));
  const normalizedNames = Array.from(
    new Set(rawNames.map((name: string) => roleSynonyms[name] ?? name)),
  );

  return normalizedNames.map((name) => ({
    value: name,
    label: name,
  }));
}
