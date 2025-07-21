import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function GET() {
  const session = neo4j.session();

  try {
    const result = await session.run(`
MATCH (n { Name: "Paracetamol" })-[r]-(neighbor)
RETURN n, r, neighbor
    `);

    const nodesMap = new Map();
    const edges = [];

    result.records.forEach((record) => {
      record.keys.forEach((key) => {
        const value = record.get(key);

        if (value && value.identity && value.labels) {
          // Es ist ein Node
          const id = value.identity.toString();
          if (!nodesMap.has(id)) {
            nodesMap.set(id, {
              id,
              label: value.properties.Name || value.labels[0] || "Node",
              data: value.properties,
            });
          }
        }

        if (value && value.identity && value.type) {
          // Es ist eine Relationship
          edges.push({
            id: value.identity.toString(),
            source: value.start.toString(),
            target: value.end.toString(),
            label: value.type,
          });
        }
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
