import { NextRequest, NextResponse } from "next/server";
import neo4j from "@/lib/neo4j";
import { subgraphFetchers } from "@/lib/subgraphs";
import { Category } from "@/constants/category";
import { convertNeo4jRecords } from "@/lib/utils/convertNeo4jRecords";

import type { Session } from "neo4j-driver";

type SelectedTerms = Record<Category, string[]>;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const selectedTerms = body.selectedTerms as SelectedTerms;
  const session: Session = neo4j.session();

  try {
    const allRecords = [];

    for (const [category, fetcher] of Object.entries(subgraphFetchers)) {
      const terms = selectedTerms[category];
      if (Array.isArray(terms) && terms.length > 0) {
        const records = await fetcher(terms, session);
        allRecords.push(...records);
      }
    }

    const graphData = convertNeo4jRecords(allRecords);
    return NextResponse.json(graphData);
  } catch (err) {
    console.error("Fehler beim Zusammenführen:", err);
    return NextResponse.json(
      { error: "Graph konnte nicht geladen werden" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
