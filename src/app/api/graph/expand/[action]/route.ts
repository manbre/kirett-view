import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { expandFetchers } from "@/server/expandFetchers";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { ExpandAction } from "@/server/expandFetchers";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ action: string }> },
) {
  const { action } = await ctx.params;

  // validate action
  if (!(action in expandFetchers)) {
    return NextResponse.json(
      { error: `unknown expand action: ${action}` },
      { status: 404 },
    );
  }

  // parse body
  const { nodeId } = (await request.json()) as { nodeId?: string };
  if (!nodeId || typeof nodeId !== "string") {
    return NextResponse.json(
      { error: "invalid payload: expected { nodeId: string }" },
      { status: 400 },
    );
  }

  try {
    // use one read transaction
    const records = await withReadTx((tx) =>
      expandFetchers[action as ExpandAction](nodeId, tx),
    );

    return NextResponse.json(convertNeo4jRecords(records), { status: 200 });
  } catch (err) {
    console.error(`error in /api/graph/expand/${action}:`, err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
