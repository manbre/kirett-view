import { NextResponse } from "next/server";
import { getProcedureTerms } from "@/lib/terms/procedures";
import { getNeo4jSession } from "@/lib/neo4j";

export async function GET() {
  const session = getNeo4jSession();

  try {
    const terms = await getProcedureTerms(session);
    return NextResponse.json(terms);
  } catch (error) {
    console.error("error in /api/terms/procedures:", error);
    return NextResponse.json(
      { error: "failed to fetch procedure terms" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
