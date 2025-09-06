export type GraphNode = {
  id: string;
  label: string;
  data: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
};

export type SubgraphResult = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
