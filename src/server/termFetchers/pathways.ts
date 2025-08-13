import type { Transaction } from "neo4j-driver";
import type { GroupedTermItem } from "@/types/terms";

export async function getPathwayTerms(
  tx: Transaction,
): Promise<GroupedTermItem[]> {
  const result = await tx.run(
    `
    MATCH (n:BPRNode)
    RETURN 
      COALESCE(n.SituationDetectionGroup, "") AS group,
      REPLACE(n.Name, "Behandlungspfad ", "") AS name
    ORDER BY group, name
    `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
    group: record.get("group"),
  }));
}
