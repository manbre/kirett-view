import { useEffect, useRef } from "react";
import { useTermStore } from "@/store/useTermStore";
import { useGraphStore } from "@/store/useGraphStore";
import { fetchGraphSegment } from "@/services/graphService";
import { getGraphDelta } from "@/lib/graph/getGraphDelta";
import { CATEGORIES } from "@/constants/category";
import type { GraphNode, GraphEdge } from "@/types/graph";

export function useGraphUpdater(reagraphRef?: React.RefObject<any>) {
  const { getSelectedTerms } = useTermStore();
  const { addGraphPart, removeNodesById } = useGraphStore();

  // Ref speichert IDs des zuletzt gerenderten Teilgraphen
  const prevNodeIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const selectedTerms = getSelectedTerms();
    const hasTerms = Object.values(selectedTerms).some(
      (list) => list.length > 0,
    );
    if (!hasTerms) return;

    const updateGraph = async () => {
      const allNodes = new Map<string, GraphNode>();
      const allEdges = new Map<string, GraphEdge>();
      const currentIds = new Set<string>();

      for (const category of CATEGORIES) {
        const terms = selectedTerms[category];
        if (!terms?.length) continue;

        const { nodes, edges } = await fetchGraphSegment(category, terms);

        for (const node of nodes) {
          allNodes.set(node.id, node);
          currentIds.add(node.id);
        }

        for (const edge of edges) {
          allEdges.set(edge.id, edge);
        }
      }

      const prevIds = prevNodeIdsRef.current;
      const { toAdd, toRemove } = getGraphDelta(prevIds, currentIds);

      if (reagraphRef?.current) {
        reagraphRef.current.addNodes(toAdd.map((id) => allNodes.get(id)));
        reagraphRef.current.removeNodes(toRemove);
      }

      addGraphPart(
        toAdd.map((id) => allNodes.get(id)!),
        Array.from(allEdges.values()),
      );

      removeNodesById(toRemove);
      prevNodeIdsRef.current = currentIds;
    };

    updateGraph();
  }, [getSelectedTerms, reagraphRef]);
}
