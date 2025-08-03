import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

// NS wird wie NFS behandelt
const roleSynonyms: Record<string, string> = {
  NS: "NFS",
};

export async function GET() {
  const session = neo4j.session();
  try {
    const result = await session.run(`
      MATCH (n)
      UNWIND keys(n) AS prop
      WITH n, prop
      WHERE prop CONTAINS "Betrifft" AND exists(n[prop])
      RETURN DISTINCT n[prop] AS name
    `);

    const rawNames = result.records.map((r) => r.get("name"));
    const normalized = Array.from(
      new Set(rawNames.map((name: string) => roleSynonyms[name] ?? name)),
    );

    const options = normalized.map((name) => ({
      value: name,
      label: name,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error("Fehler beim Rollenabruf:", error);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 500 });
  } finally {
    await session.close();
  }
}
