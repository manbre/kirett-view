import { create } from "zustand";
import type { GraphNode, GraphEdge } from "@/types/graph";

export type GraphStore = {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  expandedIds: Set<string>;
  graphCache: Map<string, { nodes: GraphNode[]; edges: GraphEdge[] }>;

  addGraphPart: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  removeNodesById: (ids: string[]) => void;
  markExpanded: (id: string) => void;
  isExpanded: (id: string) => boolean;
  getCachedGraph: (
    key: string,
  ) => { nodes: GraphNode[]; edges: GraphEdge[] } | undefined;
  setCachedGraph: (key: string, nodes: GraphNode[], edges: GraphEdge[]) => void;
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: new Map(),
  edges: new Map(),
  expandedIds: new Set(),
  graphCache: new Map(),

  addGraphPart: (newNodes, newEdges) => {
    const currentNodes = new Map(get().nodes);
    const currentEdges = new Map(get().edges);

    newNodes.forEach((node) => currentNodes.set(node.id, node));
    newEdges.forEach((edge) => currentEdges.set(edge.id, edge));

    set({ nodes: currentNodes, edges: currentEdges });
  },

  removeNodesById: (ids) => {
    const currentNodes = new Map(get().nodes);
    const currentEdges = new Map(get().edges);

    ids.forEach((id) => currentNodes.delete(id));
    for (const [edgeId, edge] of currentEdges.entries()) {
      if (ids.includes(edge.source) || ids.includes(edge.target)) {
        currentEdges.delete(edgeId);
      }
    }

    set({ nodes: currentNodes, edges: currentEdges });
  },

  markExpanded: (id) => {
    const setCopy = new Set(get().expandedIds);
    setCopy.add(id);
    set({ expandedIds: setCopy });
  },

  isExpanded: (id) => get().expandedIds.has(id),
}));
