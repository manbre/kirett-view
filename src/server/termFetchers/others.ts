import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getOtherTerms(tx: Transaction): Promise<TermItem[]> {
  const result = await tx.run(
    `
MATCH (n)
UNWIND labels(n) AS name
    WITH DISTINCT name
    WHERE name <> "DisplayNode"
RETURN name
    ORDER BY name
    `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
// Term fetcher for miscellaneous labels (all labels except DisplayNode)
