"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/store/useStore";
import { useGraphApi } from "@/hooks/useGraphApi";

type ViewState =
  | { mode: "terms"; anchorId?: undefined }
  | { mode: "neighbors"; anchorId: string };

export function useGraphController() {
  const selectedTerms = useStore((s) => s.selectedTerms);
  const selectedTypes = useStore((s) => s.selectedTypes);
  const selectedHops = useStore((s) => s.selectedHops);
  const showOnlyEdges = useStore((s) => s.showOnlyEdges);
  const setGraph = useStore((s) => s.setGraph);
  const clearTerms = useStore((s) => s.clearTerms);

  const { fetchGraphData, fetchNeighbors } = useGraphApi();

  const [view, setView] = useState<ViewState>({ mode: "terms" });

  useEffect(() => {
    const load = async () => {
      try {
        if (view.mode === "neighbors") {
          await fetchNeighbors(
            view.anchorId,
            selectedHops,
            selectedTypes,
            showOnlyEdges,
            { apply: "set" },
          );
          const hasTerms = Object.values(selectedTerms).flat().length > 0;
          if (hasTerms) {
            await fetchGraphData(
              selectedTerms,
              selectedTypes,
              selectedHops,
              showOnlyEdges,
              { apply: "merge" },
            );
          }
        } else {
          const hasTerms = Object.values(selectedTerms).flat().length > 0;
          if (!hasTerms) {
            setGraph([], []);
            return;
          }
          await fetchGraphData(
            selectedTerms,
            selectedTypes,
            selectedHops,
            showOnlyEdges,
            { apply: "set" },
          );
        }
      } catch (err) {
        console.error("graph loading error:", err);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedTerms),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedTypes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(selectedHops),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(showOnlyEdges),
    view,
  ]);

  const resetToTerms = useCallback(() => setView({ mode: "terms" }), []);

  const openNeighbors = useCallback(
    async (nodeId: string) => {
      try {
        await fetchNeighbors(
          nodeId,
          selectedHops,
          selectedTypes,
          showOnlyEdges,
        );
        setView({ mode: "neighbors", anchorId: nodeId });
        clearTerms();
      } catch (err) {
        console.error("error while loading neighbors:", err);
      }
    },
    [clearTerms, fetchNeighbors, selectedHops, selectedTypes, showOnlyEdges],
  );

  return { view, resetToTerms, openNeighbors };
}
