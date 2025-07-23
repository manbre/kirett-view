import { NextRequest, NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const allTerms: string[] = body.selectedTerms ?? [];
  console.log("📥 Request body:", body);
  console.log("🔍 Selected terms:", allTerms);

  if (!Array.isArray(allTerms)) {
    return NextResponse.json(
      { error: "Ungültige Datenstruktur" },
      { status: 400 },
    );
  }

  const session = neo4j.session();
  try {
    const result = await session.run(
      `
      MATCH (n)
      WHERE any(k IN keys(n) WHERE n[k] IN $terms)
      MATCH (n)-[r]-(neighbor)
      RETURN DISTINCT n, r, neighbor
      `,
      { terms: allTerms },
    );

    const nodesMap = new Map();
    const edges: any[] = [];

    result.records.forEach((record) => {
      const n = record.get("n");
      const neighbor = record.get("neighbor");
      const r = record.get("r");

      [n, neighbor].forEach((node) => {
        const id = node.identity.toString();
        if (!nodesMap.has(id)) {
          nodesMap.set(id, {
            id,
            label: node.properties?.Name ?? node.labels?.[0] ?? "Node",
            data: node.properties,
          });
        }
      });

      if (r) {
        edges.push({
          id: r.identity.toString(),
          source: r.start.toString(),
          target: r.end.toString(),
          label: r.type,
        });
      }
    });

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      edges,
    });
  } catch (err) {
    console.error("Neo4j-Fehler:", err);
    return NextResponse.json(
      { error: "Graph konnte nicht geladen werden" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
