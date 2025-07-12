import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();

  try {
    const result = await session.run(`
      MATCH (n:BPRNode)-[r]->(m)
    RETURN n, r, m
    LIMIT 10
    `);

    const nodesMap = new Map();
    const edges = [];

    result.records.forEach((record) => {
      const n1 = record.get("n");
      const n2 = record.get("m");
      const r = record.get("r");

      [n1, n2].forEach((node) => {
        const id = node.identity.toString();
        if (!nodesMap.has(id)) {
          nodesMap.set(id, {
            id,
            label: node.properties.Name || node.labels?.[0] || "Node",
            data: node.properties,
          });
        }
      });

      edges.push({
        id: r.identity.toString(),
        source: n1.identity.toString(),
        target: n2.identity.toString(),
        label: r.type,
      });
    });

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      edges,
    });
  } catch (error) {
    console.error("Neo4j Fehler:", error);
    return NextResponse.error();
  } finally {
    await session.close();
  }
}
