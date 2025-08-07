import { NextRequest, NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";
import { subgraphFetchers } from "@/lib/subgraphs";
import { Category } from "@/constants/category";

import type {
  Session,
  Record as Neo4jRecord,
  Node,
  Relationship,
} from "neo4j-driver";

type GraphNode = {
  id: string;
  label: string;
  data: Record<string, unknown>;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

type SelectedTerms = Record<Category, string[]>;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const selectedTerms = body.selectedTerms as SelectedTerms;
  const session: Session = neo4j.session();
  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  try {
    const allRecords: Neo4jRecord[] = [];
    for (const [category, fetcher] of Object.entries(subgraphFetchers)) {
      const terms = selectedTerms[category];
      if (Array.isArray(terms) && terms.length > 0) {
        const records = await fetcher(terms, session);
        allRecords.push(...records);
      }
    }

    for (const record of allRecords) {
      const n = record.get("n") as Node;

      const nId = n.identity.toString();
      if (!nodesMap.has(nId)) {
        nodesMap.set(nId, {
          id: nId,
          label: n.properties?.Name ?? n.labels?.[0] ?? "Node",
          data: {
            ...n.properties,
            labels: n.labels,
            type: n.labels?.[0] ?? null,
          },
        });
      }

      if (record.has("neighbor") && record.has("r")) {
        const neighbor = record.get("neighbor") as Node;
        const r = record.get("r") as Relationship;

        const neighborId = neighbor.identity.toString();
        if (!nodesMap.has(neighborId)) {
          nodesMap.set(neighborId, {
            id: neighborId,
            label: neighbor.properties?.Name ?? neighbor.labels?.[0] ?? "Node",
            data: {
              ...neighbor.properties,
              labels: neighbor.labels,
              type: neighbor.labels?.[0] ?? null,
            },
          });
        }

        edges.push({
          id: r.identity.toString(),
          source: r.start.toString(),
          target: r.end.toString(),
          label: r.type,
        });
      }
    }

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      edges,
    });
  } catch (err) {
    console.error("❌ Fehler beim Zusammenführen:", err);
    return NextResponse.json(
      { error: "Graph konnte nicht geladen werden" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
