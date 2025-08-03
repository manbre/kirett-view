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

type SelectedTerms = Record<Category, string[]>;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const selectedTerms = body.selectedTerms as SelectedTerms;
  const session: Session = neo4j.session();

  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  try {
    const allRecords: Neo4jRecord[] = [];

    if (selectedTerms.groups?.length) {
      const records = await getGroupsSubgraph(selectedTerms.groups, session);
      allRecords.push(...records);
    }

    if (selectedTerms.medications?.length) {
      const records = await getMedicationsSubgraph(
        selectedTerms.medications,
        session,
      );
      allRecords.push(...records);
    }

    if (selectedTerms.pathways?.length) {
      const records = await getPathwaysSubgraph(
        selectedTerms.pathways,
        session,
      );
      allRecords.push(...records);
    }

    if (selectedTerms.procedures?.length) {
      const records = await getProceduresSubgraph(
        selectedTerms.procedures,
        session,
      );
      allRecords.push(...records);
    }

    if (selectedTerms.roles?.length) {
      const records = await getRolesSubgraph(selectedTerms.roles, session);
      allRecords.push(...records);
    }

    for (const record of allRecords) {
      // Immer vorhanden
      const n = record.get("n") as Node;

      const id = n.identity.toString();
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          label: n.properties?.Name ?? n.labels?.[0] ?? "Node",
          data: {
            ...n.properties,
            labels: n.labels,
            type: n.labels?.[0] ?? null,
          },
        });
      }

      // Optional: neighbor und edge
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
    console.error("graph join error:", err);
    return NextResponse.json(
      { error: "could not load graph" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
