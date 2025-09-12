//
// expands neighbors from a node with optional filters

import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { expandFetchers, type ExpandAction } from "@/server/expandFetchers";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export const runtime = "nodejs";

type Payload = {
  nodeId?: string;
  include?: string[];
  depth?: ("1" | "2")[];
  // translate if present into include/depth
  selectedTypes?: string[];
  selectedHops?: string[];
  showOnlyEdges?: boolean;
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ action: string }> },
) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  // validate action
  const { action } = await ctx.params;
  if (!Object.prototype.hasOwnProperty.call(expandFetchers, action)) {
    return NextResponse.json(
      { error: `unknown expand action: ${action}` },
      { status: 404 },
    );
  }

  // validate required nodeId
  const nodeId = body.nodeId;
  if (!nodeId || typeof nodeId !== "string") {
    return NextResponse.json(
      { error: "invalid payload: expected { nodeId: string }" },
      { status: 400 },
    );
  }

  // adopt filters if provided
  let include = Array.isArray(body.include) ? body.include : undefined;
  let depth = Array.isArray(body.depth) ? body.depth : undefined;

  // derive from legacy fields if needed
  if (!include && Array.isArray(body.selectedTypes)) {
    include = Array.from(new Set(body.selectedTypes));
  }
  if (!depth && Array.isArray(body.selectedHops)) {
    const hops = body.selectedHops;
    const d: ("1" | "2")[] = [];
    if (hops.includes("HopOne")) d.push("1");
    if (hops.includes("HopTwo")) d.push("2");
    depth = d.length ? d : ["1"];
  }

  // defaults
  const finalInclude: string[] = include ?? [];
  const finalDepth: ("1" | "2")[] = depth && depth.length ? depth : ["1"];
  const showOnlyEdges = Boolean(body.showOnlyEdges);

  try {
    const records = await withReadTx<Neo4jRecord[]>((tx: Transaction) =>
      expandFetchers[action as ExpandAction](
        nodeId,
        finalDepth,
        finalInclude,
        tx,
      ),
    );

    // response (respect showOnlyEdges)
    const payload = convertNeo4jRecords(records, showOnlyEdges);
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error(`error in /api/graph/expand/${action}:`, err);
    return NextResponse.json(
      { error: "expand could not be loaded" },
      { status: 500 },
    );
  }
}
