import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();
  try {
    // attributes "Betrifft1", "Betrifft2" store role names (e.g. "NFS", "RA")
    const result = await session.run(`
    MATCH (n)
      UNWIND keys(n) AS prop
      WITH DISTINCT prop
      WHERE prop CONTAINS "Betrifft"
      WITH prop
    MATCH (n)
      WHERE exists(n[prop])
    RETURN DISTINCT n[prop] AS name
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
