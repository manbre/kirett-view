// src/app/api/graph/subgraphs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { subgraphFetchers } from "@/server/subgraphFetchers";
import { Category } from "@/constants/category";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export const runtime = "nodejs";

type SelectedTerms = Partial<Record<Category, string[]>>;

export async function POST(req: NextRequest) {
  const { selectedTerms } = (await req.json()) as {
    selectedTerms?: SelectedTerms;
  };
  if (!selectedTerms)
    return NextResponse.json(
      { error: "selectedTerms missing" },
      { status: 400 },
    );

  try {
    const all = await withReadTx<Neo4jRecord[]>(async (tx: Transaction) => {
      const tasks: Promise<Neo4jRecord[]>[] = [];
      for (const cat of Object.values(Category)) {
        const terms = selectedTerms[cat];
        if (Array.isArray(terms) && terms.length) {
          tasks.push(subgraphFetchers[cat](terms, tx));
        }
      }
      if (tasks.length === 0) return [];
      const results = await Promise.all(tasks);
      return results.flat();
    });

    return NextResponse.json(convertNeo4jRecords(all), { status: 200 });
  } catch (err) {
    console.error("error in /api/graph/subgraphs:", err);
    return NextResponse.json(
      { error: "graph could not be loaded" },
      { status: 500 },
    );
  }
}
