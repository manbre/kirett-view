// ---------------- api types ----------------
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

// ---------------- ui types ----------------
export type UiGraphNode = GraphNode & {
  x?: number;
  y?: number;
  __radius?: number;
  hovered?: boolean;
  selected?: boolean;
  type?: string; // for icon mapping
};

export type UiGraphEdge = GraphEdge & {
  source: string | UiGraphNode;
  target: string | UiGraphNode;
};

export type UiGraphData = {
  nodes: UiGraphNode[];
  links: UiGraphEdge[];
};
