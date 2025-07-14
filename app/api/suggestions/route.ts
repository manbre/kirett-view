import { NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";

export async function POST(request: Request) {
  const session = neo4j.session();
  try {
    const { selected } = await request.json(); // [{ category: "MedicationNode", term: "Ibuprofen" }, ...]

    if (!selected || !Array.isArray(selected)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Build Cypher query for neighbors
    const terms = selected.map((s) => `"${s.term}"`).join(", ");

    const query = `
      MATCH (n)
      WHERE n.Name IN [${terms}]
      MATCH (n)-[]-(neighbor)
      WHERE neighbor.Name IS NOT NULL AND NOT neighbor.Name IN [${terms}]
      RETURN DISTINCT labels(neighbor)[0] AS category, neighbor.Name AS term
      LIMIT 100
    `;

    const result = await session.run(query);

    const suggestions = result.records.map((record) => ({
      category: record.get("category"),
      term: record.get("term"),
    }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Suggestion API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
