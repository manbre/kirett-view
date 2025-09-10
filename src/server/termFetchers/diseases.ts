import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getDiseaseTerms(tx: Transaction): Promise<TermItem[]> {
  // second MATCH only because of "akutes Aortensyndrom"
  const result = await tx.run(
    `
MATCH (d1:DisplayNode)-[]-(d2:DisplayNode)
  WHERE d2.Name CONTAINS "Hinweise"
    AND d1.Name <> "Zusatzinformationen"
RETURN DISTINCT d1.Name AS name

UNION

MATCH (d1:DisplayNode)-[]-(w:WarningNode)
  WHERE w.Name CONTAINS "Hinweise"
    AND d1.Name <> "Erweiterte spez. Diagnostik"
    AND d1.Name <> "Zusatzinformationen"
RETURN DISTINCT d1.Name AS name
            `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
// Term fetcher for disease names (DisplayNode connected to "Hinweise" context)
