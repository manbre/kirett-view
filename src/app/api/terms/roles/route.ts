import { NextResponse } from "next/server";
import { getRoleTerms } from "@/lib/terms/roles";
import { getNeo4jSession } from "@/lib/neo4j";

export async function GET() {
  const session = getNeo4jSession();

  try {
    const terms = await getRoleTerms(session);
    return NextResponse.json(terms);
  } catch (error) {
    console.error("error in /api/terms/roles:", error);
    return NextResponse.json(
      { error: "failed to fetch role terms" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
