import { NextRequest, NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

import { getGroupsSubgraph } from "./groups/route";
import { getMedicationsSubgraph } from "./medications/route";
import { getPathwaysSubgraph } from "./pathways/route";
import { getProceduresSubgraph } from "./procedures/route";
import { getRolesSubgraph } from "./roles/route";

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

type GraphRecord = Neo4jRecord & {
  get: (key: "n" | "neighbor" | "r") => Node | Relationship;
};

type SelectedTerms = Record<Category, string[]>;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const selectedTerms = body.selectedTerms as SelectedTerms;
  const session: Session = neo4j.session();

  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  try {
    const allRecords: GraphRecord[] = [];

    if (selectedTerms.groups?.length) {
      const records = await getGroupsSubgraph(selectedTerms.groups, session);
      allRecords.push(...(records as GraphRecord[]));
    }

    if (selectedTerms.medications?.length) {
      const records = await getMedicationsSubgraph(
        selectedTerms.medications,
        session,
      );
      allRecords.push(...(records as GraphRecord[]));
    }

    if (selectedTerms.pathways?.length) {
      const records = await getPathwaysSubgraph(
        selectedTerms.pathways,
        session,
      );
      allRecords.push(...(records as GraphRecord[]));
    }

    if (selectedTerms.procedures?.length) {
      const records = await getProceduresSubgraph(
        selectedTerms.procedures,
        session,
      );
      allRecords.push(...(records as GraphRecord[]));
    }

    if (selectedTerms.roles?.length) {
      const records = await getRolesSubgraph(selectedTerms.roles, session);
      allRecords.push(...(records as GraphRecord[]));
    }

    for (const record of allRecords) {
      const n = record.get("n") as Node;
      const neighbor = record.get("neighbor") as Node;
      const r = record.get("r") as Relationship;

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
    }

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      edges,
    });
  } catch (err) {
    console.error("graph join error:", err);
    return NextResponse.json(
      { error: "could not load graph" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
