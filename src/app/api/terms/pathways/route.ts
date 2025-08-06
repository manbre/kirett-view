import { NextResponse } from "next/server";
import { getPathwayTerms } from "@/lib/terms/pathways";
import { getNeo4jSession } from "@/lib/neo4j";

export async function GET() {
  const session = getNeo4jSession();

  try {
    const terms = await getPathwayTerms(session);
    return NextResponse.json(terms);
  } catch (error) {
    console.error("error in /api/terms/pathways:", error);
    return NextResponse.json(
      { error: "failed to fetch pathway terms" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
