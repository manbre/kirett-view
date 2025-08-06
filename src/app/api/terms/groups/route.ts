import { NextResponse } from "next/server";
import { getGroupTerms } from "@/lib/terms/groups";
import { getNeo4jSession } from "@/lib/neo4j";

export async function GET() {
  const session = getNeo4jSession();

  try {
    const terms = await getGroupTerms(session);
    return NextResponse.json(terms);
  } catch (error) {
    console.error("error in /api/terms/groups:", error);
    return NextResponse.json(
      { error: "failed to fetch group terms" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
