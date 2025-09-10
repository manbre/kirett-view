import type { Node, Relationship, Record as Neo4jRecord } from "neo4j-driver";
import type { GraphNode, GraphEdge } from "@/types/graph";

export function convertNeo4jRecords(
  records: Neo4jRecord[],
  showOnlyEdges: boolean,
) {
  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  // Helpers
  const addNode = (n: Node) => {
    const id = n.identity.toString();
    if (nodesMap.has(id)) return;
    const props = n.properties as Record<string, unknown>;
    const name = typeof props.Name === "string" ? props.Name : undefined;
    nodesMap.set(id, {
      id,
      label: name ?? n.labels?.[0] ?? "Node",
      data: {
        ...props,
        labels: n.labels,
        type: n.labels?.[0] ?? null,
      },
    });
  };
  const addRel = (r: Relationship) => {
    edges.push({
      id: r.identity.toString(),
      source: r.start.toString(),
      target: r.end.toString(),
      label: r.type,
    });
  };
  const isNeoNode = (v: unknown): v is Node =>
    !!v &&
    typeof v === "object" &&
    "identity" in (v as Record<string, unknown>) &&
    "labels" in (v as Record<string, unknown>);
  const isNeoRel = (v: unknown): v is Relationship =>
    !!v &&
    typeof v === "object" &&
    "identity" in (v as Record<string, unknown>) &&
    "start" in (v as Record<string, unknown>) &&
    "end" in (v as Record<string, unknown>) &&
    "type" in (v as Record<string, unknown>);
  const isNeoPath = (
    v: unknown,
  ): v is {
    segments: Array<{ start: Node; end: Node; relationship: Relationship }>;
  } =>
    !!v &&
    typeof v === "object" &&
    "segments" in (v as Record<string, unknown>) &&
    Array.isArray((v as { segments?: unknown }).segments);

  const visit = (val: unknown): void => {
    if (val == null) return;
    if (isNeoNode(val)) {
      addNode(val);
      return;
    }
    if (isNeoRel(val)) {
      addRel(val);
      return;
    }
    if (isNeoPath(val)) {
      const p = val as {
        segments?: Array<{
          start?: Node;
          end?: Node;
          relationship?: Relationship;
        }>;
        start?: Node;
        end?: Node;
      };
      for (const seg of p.segments ?? []) {
        if (seg?.start) addNode(seg.start);
        if (seg?.end) addNode(seg.end);
        if (seg?.relationship) addRel(seg.relationship);
      }
      if (p.start) addNode(p.start);
      if (p.end) addNode(p.end);
      return;
    }
    if (Array.isArray(val)) {
      for (const v of val) visit(v);
      return;
    }
    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      for (const k of Object.keys(obj)) visit(obj[k]);
    }
  };

  // 1) Collect everything – alias-agnostic (nodes, relationships, arrays, paths)
  for (const record of records) {
    for (const key of record.keys) visit(record.get(key));
  }

  // 2) Deduplicate edges
  const uniqEdges = (() => {
    const seen = new Set<string>();
    const out: GraphEdge[] = [];
    for (const e of edges) {
      const key = e.id || `${e.source}|${e.target}|${e.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(e);
      }
    }
    return out;
  })();

  // 3) Crucial: restrict edges to known node ids first
  const knownIds = new Set(nodesMap.keys());
  const edgesOnKnownNodes = uniqEdges.filter(
    (e) => knownIds.has(e.source) && knownIds.has(e.target),
  );

  if (showOnlyEdges) {
    // 4) Build connected set from the cleaned edges
    const connected = new Set<string>();
    for (const e of edgesOnKnownNodes) {
      connected.add(e.source);
      connected.add(e.target);
    }

    // 5) Keep only nodes that participate in these edges
    const nodes = Array.from(nodesMap.values()).filter((n) =>
      connected.has(n.id),
    );
    const finalIds = new Set(nodes.map((n) => n.id));
    const finalEdges = edgesOnKnownNodes.filter(
      (e) => finalIds.has(e.source) && finalIds.has(e.target),
    );

    return { nodes, edges: finalEdges };
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges: edgesOnKnownNodes,
  };
}
// Converts raw Neo4j records (nodes/relationships/paths) into flat GraphNode/GraphEdge arrays
