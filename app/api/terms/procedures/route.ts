import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();
  try {
    const result = await session.run(`
            MATCH (n:ProcedureNode)
            RETURN DISTINCT (n.Name) AS name
            ORDER BY name
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
