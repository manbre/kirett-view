import { NextResponse } from "next/server";
import { getMedicationsSubgraph } from "@/lib/subgraphs/medications";
import { getNeo4jSession } from "@/lib/neo4j";

export async function POST(req: Request) {
  const session = getNeo4jSession();

  try {
    const { selectedTerms } = await req.json();

    const records = await getMedicationsSubgraph(selectedTerms, session);
    return NextResponse.json(records);
  } catch (error) {
    console.error("error in /api/graph/subgraphs/medications:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
