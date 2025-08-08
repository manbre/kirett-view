import { NextResponse } from "next/server";
import { getNeighbors } from "@/lib/expand/neighbors";
import { getNeo4jSession } from "@/lib/neo4j";
import { convertNeo4jRecords } from "@/lib/utils/convertNeo4jRecords";

export async function POST(req: Request) {
  const session = getNeo4jSession();

  try {
    const { nodeId } = await req.json();
    const records = await getNeighbors(nodeId, session);
    const data = convertNeo4jRecords(records);

    return NextResponse.json(data);
  } catch (error) {
    console.error("error in /api/graph/expand/neighbors:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
