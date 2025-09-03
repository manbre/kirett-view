import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { subgraphFetchers } from "@/server/subgraphFetchers";
import { Category } from "@/constants/category";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = (await req.json()) ?? {};
  const selectedTerms = (body.selectedTerms ?? {}) as Partial<
    Record<Category, string[]>
  >;
  const selectedTypes = (body.selectedTypes ?? []) as string[]; // aktive Labels
  const selectedHops = (body.selectedHops ?? []) as string[]; // z.B. ["1"], ["2"], ["1","2"]

  if (!selectedTerms) {
    return NextResponse.json(
      { error: "selectedTerms missing" },
      { status: 400 },
    );
  }

  // include: eindeutige aktive Labels
  const include = Array.from(new Set(selectedTypes));

  // depth: nur "1" und/oder "2" zulassen, Default = ["1"]
  const depthArr = (() => {
    const d = Array.from(
      new Set(selectedHops.filter((x) => x === "1" || x === "2")),
    );
    return d.length ? d : ["1"];
  })();

  try {
    const all = await withReadTx<Neo4jRecord[]>(async (tx: Transaction) => {
      const tasks: Promise<Neo4jRecord[]>[] = [];

      for (const cat of Object.values(Category)) {
        const terms = selectedTerms[cat];
        if (Array.isArray(terms) && terms.length) {
          // Erwartete Signatur: (terms, tx, depth, include)
          tasks.push(subgraphFetchers[cat](terms, tx, depthArr, include));
        }
      }

      if (!tasks.length) return [];
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
