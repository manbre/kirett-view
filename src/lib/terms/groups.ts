import { Session } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export async function getGroupTerms(session: Session): Promise<TermItem[]> {
  const result = await session.run(
    `
    MATCH (j:JumpNode)
    WHERE j.BPR = "Disease Groups"
      AND j.Name <> "Manuelle Selektion"
    RETURN DISTINCT j.Name AS name
    ORDER BY name
    `,
  );

  return result.records.map((record) => ({
    value: record.get("name"),
    label: record.get("name"),
  }));
}
