import { NextResponse } from "next/server";
import { getNeo4jSession } from "@/lib/neo4j";
import { subgraphFetchers } from "@/lib/subgraphs";
import { mapRecordsToGraph } from "@/lib/graph/mapRecordsToGraph";
import type { SubgraphResult } from "@/types/graph";

export async function POST(req: Request) {
  const session = getNeo4jSession();

  try {
    const { selectedTerms } = await req.json();

    if (!selectedTerms || typeof selectedTerms !== "object") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const allRecords: SubgraphResult[] = [];

    for (const [category, fetcher] of Object.entries(subgraphFetchers)) {
      const terms = selectedTerms[category];
      if (Array.isArray(terms) && terms.length > 0) {
        const records = await fetcher(terms, session);
        allRecords.push(...records);
      }
    }

    const { nodes, edges } = mapRecordsToGraph(allRecords);
    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error("Graph merge failed:", error);
    return NextResponse.json(
      { error: "Failed to assemble graph" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
