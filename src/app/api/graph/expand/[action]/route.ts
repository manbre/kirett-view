// app/api/graph/expand/[action]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { expandFetchers } from "@/server/expandFetchers";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { ExpandAction } from "@/server/expandFetchers";

export const runtime = "nodejs";

type Payload = {
  nodeId?: string;
  depth?: ("1" | "2")[]; // optional: ["1","2"]
  include?: string[]; // optional: label/type filter
  showOnlyEdges?: boolean; // optional
};

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } },
) {
  // 1) parse once
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { action } = params;

  // 2) validate action
  if (!Object.prototype.hasOwnProperty.call(expandFetchers, action)) {
    return NextResponse.json(
      { error: `unknown expand action: ${action}` },
      { status: 404 },
    );
  }

  // 3) validate payload
  const nodeId = body.nodeId;
  if (!nodeId || typeof nodeId !== "string") {
    return NextResponse.json(
      { error: "invalid payload: expected { nodeId: string }" },
      { status: 400 },
    );
  }

  // sanitize optionals
  const depth = Array.isArray(body.depth) ? (body.depth as ("1" | "2")[]) : [];
  const include = Array.isArray(body.include) ? body.include : [];
  const showOnlyEdges = Boolean(body.showOnlyEdges);

  try {
    // 4) single read transaction
    const records = await withReadTx((tx) =>
      expandFetchers[action as ExpandAction](nodeId, depth, include, tx),
    );

    // 5) shape response (respect showOnlyEdges)
    const payload = convertNeo4jRecords(records, showOnlyEdges);
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error(`error in /api/graph/expand/${action}:`, err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
