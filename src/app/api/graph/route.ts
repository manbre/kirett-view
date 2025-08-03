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

type SelectedTerms = Record<Category, string[]>;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const selectedTerms = body.selectedTerms as SelectedTerms;
  const session: Session = neo4j.session();

  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  try {
    const allRecords: Neo4jRecord[] = [];

    if (selectedTerms.groups?.length) {
      allRecords.push(
        ...(await getGroupsSubgraph(selectedTerms.groups, session)),
      );
    }
    if (selectedTerms.medications?.length) {
      allRecords.push(
        ...(await getMedicationsSubgraph(selectedTerms.medications, session)),
      );
    }
    if (selectedTerms.pathways?.length) {
      allRecords.push(
        ...(await getPathwaysSubgraph(selectedTerms.pathways, session)),
      );
    }
    if (selectedTerms.procedures?.length) {
      allRecords.push(
        ...(await getProceduresSubgraph(selectedTerms.procedures, session)),
      );
    }
    if (selectedTerms.roles?.length) {
      allRecords.push(
        ...(await getRolesSubgraph(selectedTerms.roles, session)),
      );
    }

    for (const record of allRecords) {
      const n = record.get("n") as Node;
      nodeIds.add(n.identity.toString());

      if (record.has("neighbor")) {
        const neighbor = record.get("neighbor") as Node;
        nodeIds.add(neighbor.identity.toString());
      }

      if (record.has("r")) {
        const r = record.get("r") as Relationship;
        edgeIds.add(r.identity.toString());
      }
    }

    return NextResponse.json({
      nodeIds: Array.from(nodeIds),
      edgeIds: Array.from(edgeIds),
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
