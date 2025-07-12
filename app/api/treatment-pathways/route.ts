import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();
  try {
    const result = await session.run(`
          MATCH (n:BPRNode)
          RETURN 
            COALESCE(n.SituationDetectionGroup, "") AS Gruppe,
            REPLACE(n.Name, "Behandlungspfad ", "") AS Name
          ORDER BY Gruppe, Name
            `);
    const options = result.records.map((record) => ({
      value: record.get("Name"),
      label: record.get("Name"),
      group: record.get("Gruppe"),
    }));
    return NextResponse.json(options);
  } finally {
    await session.close();
  }
}
