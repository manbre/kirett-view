//
// build a subgraph for selected terms with optional filters

import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { subgraphFetchers } from "@/server/subgraphFetchers";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";
import { Category } from "@/constants/category";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const body = await req.json();

  // required field
  const selectedTerms = (body?.selectedTerms ?? {}) as Partial<
    Record<Category, string[]>
  >;
  const allTerms = Object.values(selectedTerms).flat();
  if (allTerms.length === 0) {
    return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
  }

  // preferred payload fields
  let include = Array.isArray(body?.include)
    ? (body.include as string[])
    : undefined;
  let depth = Array.isArray(body?.depth) ? (body.depth as string[]) : undefined;

  // derive from selectedTypes / selectedHops if needed
  if (!include && Array.isArray(body?.selectedTypes)) {
    include = Array.from(new Set(body.selectedTypes as string[]));
  }
  if (!depth && Array.isArray(body?.selectedHops)) {
    const hops = body.selectedHops as string[];
    const d: ("1" | "2")[] = [];
    if (hops.includes("HopOne")) d.push("1");
    if (hops.includes("HopTwo")) d.push("2");
    depth = d.length ? d : ["1"];
  }

  // defaults
  const finalInclude: string[] = include ?? [];
  const finalDepth = (depth && depth.length ? depth : ["1"]) as ("1" | "2")[];

  try {
    const records = await withReadTx<Neo4jRecord[]>(async (tx: Transaction) => {
      const tasks: Promise<Neo4jRecord[]>[] = [];
      for (const cat of Object.values(Category)) {
        const terms = selectedTerms[cat];
        if (Array.isArray(terms) && terms.length) {
          tasks.push(
            subgraphFetchers[cat](terms, tx, finalDepth, finalInclude),
          );
        }
      }
      if (!tasks.length) return [];
      const results = await Promise.all(tasks);
      return results.flat();
    });

    // response (respect showOnlyEdges)
    return NextResponse.json(convertNeo4jRecords(records, body.showOnlyEdges), {
      status: 200,
    });
  } catch (err) {
    console.error("error in /api/graph/subgraphs:", err);
    return NextResponse.json(
      { error: "subgraph could not be loaded" },
      { status: 500 },
    );
  }
}
