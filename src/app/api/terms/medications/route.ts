import { NextResponse } from "next/server";
import { getMedicationTerms } from "@/lib/terms/medications";
import { getNeo4jSession } from "@/lib/neo4j";

export async function GET() {
  const session = getNeo4jSession();

  try {
    const terms = await getMedicationTerms(session);
    return NextResponse.json(terms);
  } catch (error) {
    console.error("error in /api/terms/medications:", error);
    return NextResponse.json(
      { error: "failed to fetch medication terms" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
