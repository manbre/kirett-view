"use client";

import { useRef } from "react";
import { GraphCanvas, GraphCanvasRef } from "reagraph";
import { useGraphStore } from "@/store/useGraphStore";
import { useGraphUpdater } from "@/hooks/useGraphUpdater";

export function GraphViewer() {
  const { nodes, edges } = useGraphStore();
  const reagraphRef = useRef<GraphCanvasRef>(null);

  useGraphUpdater(reagraphRef);

  return (
    <div className="h-full w-full">
      <GraphCanvas
        ref={reagraphRef}
        nodes={nodes}
        edges={edges}
        labelType="all"
        layoutType="forceDirected2d"
        sizingType="centrality"
        edgeDirectionalArrow={true}
        edgeStrokeWidth={1.5}
        edgeArrowSize={2}
        animated={true}
        readonly={false}
        onNodeDoubleClick={(node) => {
          // Optional: Doppelklick-Expansion hier später einbauen
          console.log("Double clicked:", node);
        }}
      />
    </div>
  );
}
