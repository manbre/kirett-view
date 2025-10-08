"use client";

import React, { useCallback, useState } from "react";
import {
  labelIconMap,
  type NodeLabel,
  filterIconMap,
  type FilterLabel,
  exportIconMap,
  type ExportLabel,
} from "@/constants/label";
import { Section } from "./Section";
import { useStore } from "@/store/useStore";
import { useSvgExport } from "@/hooks/useSvgExport";
import { HopToggle } from "./HopToggle";
import { NODE_R, FONT_PX, MAX_W } from "@/graphUtils/labelMetrics";

const excluded: NodeLabel[] = ["StartNode", "StopNode"];
const group = Object.keys(labelIconMap) as NodeLabel[];
const group1 = group.filter((k) => !excluded.includes(k));
const group3 = Object.keys(exportIconMap) as ExportLabel[];

//
// three stacked sections controlling the graph
// 1) type filter node icons (5/8)
// 2) topology controls: HopToggle, OnlyEdges (2/8)
// 3) export actions: SVG export (1/8)
export function ToolBar() {
  const selectedTypes = useStore((s) => s.selectedTypes);
  const toggleType = useStore((s) => s.toggleType);
  const showOnlyEdges = useStore((s) => s.showOnlyEdges);
  const toggleOnlyEdges = useStore((s) => s.toggleShowOnlyEdges);

  const { exportSvg } = useSvgExport();

  // track readiness of all sections to avoid width jump on first paint
  const totalSections = 3;
  const [readyCount, setReadyCount] = useState(0);
  const ready = readyCount >= totalSections;
  const onSectionReady = useCallback(() => {
    setReadyCount((c) => Math.min(totalSections, c + 1));
  }, []);

  const desktopWidthClass = ready ? "md:[width:max-content]" : "md:w-0";
  const desktopVisibilityClass = ready
    ? "md:visible md:opacity-100"
    : "md:invisible md:opacity-0";

  return (
    <aside
      role="toolbar"
      aria-label="Graph-Filter"
      aria-busy={!ready}
      className={[
        "rounded-xl border border-[var(--color-border)] p-2",
        // mobile: full-width, desktop (md): animate to max-content when ready
        "w-full md:min-w-0",
        desktopWidthClass,
        desktopVisibilityClass,
        // fill full height within the row to maintain 5/8 – 2/8 – 1/8 layout
        "md:h-full",
        // clip potential intermediate frames
        "md:overflow-hidden",
      ].join(" ")}
    >
      <div className="flex h-full flex-col gap-2 md:min-h-0 md:[width:max-content]">
        {/* ===== Section 1: 5/8 ===== */}
        <Section<NodeLabel>
          keys={group1}
          map={labelIconMap}
          className="w-full md:min-h-0 md:flex-[5_0_0]"
          isActive={(k) => selectedTypes.includes(k)}
          onToggle={toggleType}
          onReady={onSectionReady}
        />

        <div className="hidden border-t border-[var(--color-border)] md:block" />

        {/* ===== Section 2: (2/8) ===== */}
        <div className="flex flex-row gap-2 md:min-h-0 md:flex-[3_0_0] md:flex-col md:gap-0 md:pt-4">
          {/* with HopToggle and OnlyEdges-Icon */}
          <Section<FilterLabel>
            keys={["OnlyEdges"] as FilterLabel[]}
            map={filterIconMap}
            className="flex-1 gap-5 md:min-h-0 md:flex-[4_0_0]"
            isActive={() => showOnlyEdges}
            onToggle={() => toggleOnlyEdges()}
            onReady={onSectionReady}
          >
            <HopToggle />
          </Section>
          <div className="hidden border-t border-[var(--color-border)] md:block md:pb-2" />

          {/* ===== Section 3: (1/8) ===== */}
          <Section<ExportLabel>
            keys={group3}
            map={exportIconMap}
            className="flex-0 md:min-h-0 md:flex-[1_0_0]"
            onToggle={() =>
              exportSvg({
                background: "white",
                iconSize: NODE_R * 2,
                nodeRadius: NODE_R,
                fontSize: FONT_PX,
                maxTextWidth: MAX_W,
                edgeColor: "#9bbcff",
                edgeWidth: 1.5,
                labelBg: false,
                //
                overscan: 4,
                padding: 300,
                extraBottom: 1000,
                //
                debug: false,
                fileName: "subgraph.svg",
              })
            }
            onReady={onSectionReady}
          />
        </div>
      </div>
    </aside>
  );
}
