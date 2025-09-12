import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

//
// term fetcher: all labels except DisplayNode
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
  // without "DisplayNode" because there are 2222 of them
  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
