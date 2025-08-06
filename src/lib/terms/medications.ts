import { Session } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getMedicationTerms(
  session: Session,
): Promise<TermItem[]> {
  const result = await session.run(
    `
  MATCH (n:SAAMedicationNode)
  RETURN DISTINCT REPLACE(n.Name, "Standardarbeitsanweisung ", "") AS name
  ORDER BY name
    `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
