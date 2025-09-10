import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

// NS is treated the same as NFS
const roleSynonyms: Record<string, string> = {
  NS: "NFS",
};

export async function getRoleTerms(tx: Transaction): Promise<TermItem[]> {
  const result = await tx.run(
    `
     MATCH (n)
      UNWIND keys(n) AS prop
      WITH n, prop
      WHERE prop CONTAINS "Betrifft" AND exists(n[prop])
      RETURN DISTINCT n[prop] AS name
    `,
  );

  const rawNames = result.records.map((record) => record.get("name"));
  const normalizedNames = Array.from(
    new Set(rawNames.map((name: string) => roleSynonyms[name] ?? name)),
  );

  return normalizedNames.map((name) => ({
    value: name,
    label: name,
  }));
}
// Term fetcher for role names stored in attributes like "Betrifft1/2"
