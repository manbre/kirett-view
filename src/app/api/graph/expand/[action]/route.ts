import { NextRequest, NextResponse } from "next/server";
import { getNeo4jReadSession } from "@/server/db/neo4j";
import { expandFetchers, type ExpandAction } from "@/server/expandFetchers";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";

export const runtime = "nodejs"; // neo4j driver requires node.js runtime, not edge runtime

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ action: string }> }, // ctx contains ${action}
) {
  const { action } = await ctx.params;

  // validate the action
  if (!(action in expandFetchers)) {
    return NextResponse.json(
      { error: `unknown expand action: ${action}` },
      { status: 404 },
    );
  }

  // parse and validate the request body
  const { nodeId } = (await request.json()) as { nodeId?: string };
  if (!nodeId || typeof nodeId !== "string") {
    return NextResponse.json(
      { error: "invalid payload: expected { nodeId: string }" },
      { status: 400 },
    );
  }

  const session = getNeo4jReadSession();

  try {
    const fetcher = expandFetchers[action as ExpandAction]; // resolve the correct fetcher
    const records = await fetcher(nodeId, session);
    const graph = convertNeo4jRecords(records);

    return NextResponse.json(graph, { status: 200 }); // respond with the computed graph
  } catch (err) {
    console.error(`error in /api/graph/expand/${action}:`, err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
