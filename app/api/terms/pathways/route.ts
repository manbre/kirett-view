import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();
  try {
    // pathways grouped and sorted alphabetically
    // (e.g. "ms","sda", "sdak", "sdb", "sdh", "sdi", "sdp", "sdr", "sds", "sdz" )
    const result = await session.run(`
          MATCH (n:BPRNode)
          RETURN 
            COALESCE(n.SituationDetectionGroup, "") AS group,
            REPLACE(n.Name, "Behandlungspfad ", "") AS name
          ORDER BY group, name
            `);
    const options = result.records.map((record) => ({
      value: record.get("name"),
      label: record.get("name"),
      group: record.get("group"),
    }));
    return NextResponse.json(options);
  } finally {
    await session.close();
  }
}
