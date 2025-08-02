import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();
  try {
    // second MATCH only because of "akutes Aortensyndrom"
    const result = await session.run(
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
    const options = result.records.map((record) => ({
      value: record.get("name"),
      label: record.get("name"),
    }));
    return NextResponse.json(options);
  } finally {
    await session.close();
  }
}
