import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();
  try {
    const result = await session.run(`
MATCH (j:JumpNode)
  WHERE j.BPR = "Disease Groups"
  AND j.Name <> "Manuelle Selektion"
RETURN j.Name AS name
            `);
    const options = result.records.map((record) => ({
      value: record.get("name"),
      label: record.get("name"),
    }));
    return NextResponse.json(options);
  } finally {
    await session.close();
  }
}
