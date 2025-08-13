import { Transaction } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getProcedureTerms(tx: Transaction): Promise<TermItem[]> {
  const result = await tx.run(
    `
    MATCH (n:SAAProcedureNode)
    RETURN DISTINCT REPLACE(n.Name, "Standardarbeitsanweisung ", "") AS name
    ORDER BY name
    `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
