// app/api/graph/expand/[action]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withReadTx } from "@/server/db/neo4j";
import { expandFetchers, type ExpandAction } from "@/server/expandFetchers";
import { convertNeo4jRecords } from "@/server/utils/convertNeo4jRecords";
import type { Transaction, Record as Neo4jRecord } from "neo4j-driver";

export const runtime = "nodejs";

type Payload = {
  nodeId?: string;

  // Neu bevorzugt (wie bei subgraph):
  include?: string[]; // Label-/Type-Filter (z. B. ["MedicationNode", ...])
  depth?: ("1" | "2")[]; // Hops als Strings ["1","2"]

  // Rückwärtskompatibel (werden – falls vorhanden – in include/depth übersetzt):
  selectedTypes?: string[]; // alte Form der Types
  selectedHops?: string[]; // alte Form der Hops: ["HopOne","HopTwo"]

  showOnlyEdges?: boolean; // reine Kanten-Ansicht
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ action: string }> }, // <<< wichtig: Promise + await
) {
  // 1) Body einmal sicher parsen
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // 2) Dynamic route param korrekt awaiten (Next.js Warnung vermeiden)
  const { action } = await ctx.params;

  // 3) Action validieren
  if (!Object.prototype.hasOwnProperty.call(expandFetchers, action)) {
    return NextResponse.json(
      { error: `unknown expand action: ${action}` },
      { status: 404 },
    );
  }

  // 4) Pflichtfeld nodeId prüfen
  const nodeId = body.nodeId;
  if (!nodeId || typeof nodeId !== "string") {
    return NextResponse.json(
      { error: "invalid payload: expected { nodeId: string }" },
      { status: 400 },
    );
  }

  // 5) Optionale Filter gemäß "neuem" Schema übernehmen …
  let include = Array.isArray(body.include) ? body.include : undefined;
  let depth = Array.isArray(body.depth) ? body.depth : undefined;

  //    … und rückwärtskompatibel aus alten Feldern ableiten, falls nötig
  if (!include && Array.isArray(body.selectedTypes)) {
    include = Array.from(new Set(body.selectedTypes));
  }
  if (!depth && Array.isArray(body.selectedHops)) {
    const hops = body.selectedHops;
    const d: ("1" | "2")[] = [];
    if (hops.includes("HopOne")) d.push("1");
    if (hops.includes("HopTwo")) d.push("2");
    depth = d.length ? d : ["1"];
  }

  // 6) Defaults finalisieren
  const finalInclude: string[] = include ?? [];
  const finalDepth: ("1" | "2")[] = depth && depth.length ? depth : ["1"];
  const showOnlyEdges = Boolean(body.showOnlyEdges);

  try {
    // 7) Eine Read-Transaktion; Signatur entspricht expandFetchers:
    //    (nodeId: string, depth: ("1"|"2")[], include: string[], tx: Transaction)
    const records = await withReadTx<Neo4jRecord[]>((tx: Transaction) =>
      expandFetchers[action as ExpandAction](
        nodeId,
        finalDepth,
        finalInclude,
        tx,
      ),
    );

    // 8) Response formen (showOnlyEdges respektieren)
    const payload = convertNeo4jRecords(records, showOnlyEdges);
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error(`error in /api/graph/expand/${action}:`, err);
    return NextResponse.json(
      { error: "expand could not be loaded" },
      { status: 500 },
    );
  }
}
