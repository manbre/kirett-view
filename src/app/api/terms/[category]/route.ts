import { NextRequest, NextResponse } from "next/server";
import { getNeo4jReadSession } from "@/server/db/neo4j";
import { termFetchers } from "@/server/termFetchers";
import { Category } from "@/constants/category";

import type { Session } from "neo4j-driver";
import type { TermItem } from "@/types/terms";

export const runtime = "nodejs"; // neo4j driver requires node.js runtime, not edge runtime

export async function GET(
  _req: NextRequest,
  // ctx contains ${category}
  ctx: { params: Promise<{ category: string }> },
) {
  const { category } = await ctx.params;
  // validate the category
  if (!Object.values(Category).includes(category as Category)) {
    return NextResponse.json(
      { error: `unknown category: ${category}` },
      { status: 404 },
    );
  }

  // fetcher function for this category
  const fetcher = termFetchers[category as Category];

  if (typeof fetcher !== "function") {
    return NextResponse.json(
      { error: `no term fetcher for category: ${category}` },
      { status: 500 },
    );
  }

  const session: Session = getNeo4jReadSession();

  try {
    const terms: TermItem[] = await fetcher(session);
    return NextResponse.json(terms, { status: 200 });
  } catch (err) {
    console.error(`error in /api/terms:`, err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  } finally {
    await session.close();
  }
}
