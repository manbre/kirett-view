import { NextResponse } from "next/server";
import { getSymptomTerms } from "@/lib/terms/symptoms";
import { getNeo4jSession } from "@/lib/neo4j";

export async function GET() {
  const session = getNeo4jSession();

  try {
    const terms = await getSymptomTerms(session);
    return NextResponse.json(terms);
  } catch (error) {
    console.error("error in /api/terms/symptoms:", error);
    return NextResponse.json(
      { error: "failed to fetch symptom terms" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
