import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getDiseaseTerms(tx: Transaction): Promise<TermItem[]> {
  // second MATCH only because of "akutes Aortensyndrom"
  const result = await tx.run(
    `
MATCH (n:DisplayNode)
  WHERE n.Name CONTAINS "Hinweise" 
RETURN DISTINCT 
  REPLACE(REPLACE(REPLACE(n.Name, "Hinweise ", ""), "auf ", ""), ":", "") AS name
ORDER BY name

UNION

MATCH (n:WarningNode)
  WHERE n.Name CONTAINS "Hinweise"
RETURN DISTINCT 
   REPLACE(REPLACE(REPLACE(n.Name, "Hinweise ", ""), "auf ", ""), ":", "") AS name
ORDER BY name
`,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
// Term fetcher for disease names (DisplayNode connected to "Hinweise" context)
