//
// returns list of selectable terms for given category

import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { termFetchers } from "@/server/termFetchers";
import { Category } from "@/constants/category";
import type { TermItem } from "@/types/terms";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ category: string }> },
) {
  const { category: raw } = await ctx.params;
  const category = raw.toLowerCase();
  if (!Object.values(Category).includes(category as Category)) {
    return NextResponse.json(
      { error: `unknown category: ${raw}` },
      { status: 404 },
    );
  }

  try {
    const terms = await withReadTx<TermItem[]>((tx) =>
      termFetchers[category as Category](tx),
    );
    return new NextResponse(JSON.stringify(terms), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(`error in /api/terms/${raw}:`, err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
