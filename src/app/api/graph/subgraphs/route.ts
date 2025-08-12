import { NextRequest, NextResponse } from "next/server";
import { getNeo4jReadSession } from "@/server/db/neo4j";
import { subgraphFetchers } from "@/server/subgraphFetchers";
import { Category } from "@/constants/category";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";

import type { Session, Record as Neo4jRecord } from "neo4j-driver";

export const runtime = "nodejs"; // neo4j driver requires node.js runtime, not edge runtime

type SelectedTerms = Record<Category, string[]>;

export async function POST(request: NextRequest) {
  const { selectedTerms } = (await request.json()) as {
    selectedTerms?: Partial<SelectedTerms>; //partial: all properties are optional
  };

  // ensure selectedTerms is an object
  if (!selectedTerms || typeof selectedTerms !== "object") {
    return NextResponse.json(
      { error: "invalid payload: selectedTerms missing" },
      { status: 400 },
    );
  }

  // early exit: if no category has any selected terms, return empty graph
  const hasAny = Object.values(Category).some(
    (category) =>
      Array.isArray(selectedTerms[category]) &&
      (selectedTerms[category] as string[]).length > 0,
  );
  if (!hasAny) {
    return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
  }

  const session: Session = getNeo4jReadSession();

  try {
    const tasks: Promise<Neo4jRecord[]>[] = [];
    for (const category of Object.values(Category)) {
      const terms = selectedTerms[category];

      // only process if there are terms for this category
      if (Array.isArray(terms) && terms.length > 0) {
        const fetcher = subgraphFetchers[category];
        tasks.push(fetcher(terms, session));
      }
    }

    const results = await Promise.all(tasks); // run fetchers in parallel
    const allRecords: Neo4jRecord[] = results.flat(); // array of arrays into one array
    const graphData = convertNeo4jRecords(allRecords);

    return NextResponse.json(graphData, { status: 200 });
  } catch (err) {
    console.error("error in /api/graph/subgraphs:", err);
    return NextResponse.json(
      { error: "graph could not be loaded" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
