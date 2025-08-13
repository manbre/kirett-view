import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getGroupTerms(tx: Transaction): Promise<TermItem[]> {
  const result = await tx.run(
    `
    MATCH (n:JumpNode)
    WHERE n.BPR = "Disease Groups"
      AND n.Name <> "Manuelle Selektion"
    RETURN DISTINCT n.Name AS name
    ORDER BY name
    `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
