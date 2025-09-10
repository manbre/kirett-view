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
import { useStore, selectors } from "@/store/useStore";
import { useSvgExport } from "@/hooks/useSvgExport";
import { HopToggle } from "./HopToggle";
import { NODE_R, FONT_PX, MAX_W } from "@/graphUtils/labelMetrics";

const excluded: NodeLabel[] = ["StartNode", "StopNode"];
const group = Object.keys(labelIconMap) as NodeLabel[];
const group1 = group.filter((k) => !excluded.includes(k));
const group3 = Object.keys(exportIconMap) as ExportLabel[];

export function ToolBar() {
  const selectedTypes = useStore(selectors.selectedTypes);
  const toggleType = useStore(selectors.toggleType);
  const showOnlyEdges = useStore(selectors.showOnlyEdges);
  const toggleOnlyEdges = useStore(selectors.toggleShowOnlyEdges);

  const { exportSvg } = useSvgExport();

  // Readiness aller drei Sektionen: verhindert Vollbreiten-Sprung beim Paint
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
        // mobil vollbreit, ab md: von 0 → max-content, sobald ready
        "w-full md:min-w-0",
        desktopWidthClass,
        desktopVisibilityClass,
        // volle Höhe innerhalb der Row, damit 5/8–2/8–1/8 funktionieren
        "md:h-full",
        // Clipping für eventuelle Zwischenframes
        "md:overflow-hidden",
      ].join(" ")}
    >
      <div className="flex h-full flex-col gap-2 md:min-h-0 md:[width:max-content]">
        {/* ===== Section 1: 5/8 ===== */}
        <Section<NodeLabel>
          keys={group1}
          map={labelIconMap}
          className="w-full md:min-h-0 md:flex-[5_0_0]" // 5/8
          isActive={(k) => selectedTypes.includes(k)}
          onToggle={toggleType}
          onReady={onSectionReady}
        />

        <div className="hidden border-t border-[var(--color-border)] md:block" />

        {/* ===== Section 2 (2/8) + Section 3 (1/8) ===== */}
        <div className="flex flex-row gap-2 md:min-h-0 md:flex-[3_0_0] md:flex-col md:gap-0">
          {/* 2/8: Section-Grid mit HopToggle (als Grid-Items) + OnlyEdges-Icon */}
          <Section<FilterLabel>
            keys={["OnlyEdges"] as FilterLabel[]}
            map={filterIconMap}
            className="flex-1 md:min-h-0 md:flex-[2_0_0]"
            isActive={() => showOnlyEdges}
            onToggle={() => toggleOnlyEdges()}
            onReady={onSectionReady}
          >
            <HopToggle />
          </Section>
          <div className="hidden border-t border-[var(--color-border)] md:block md:pb-2" />

          {/* 1/8 */}
          <Section<ExportLabel>
            keys={group3}
            map={exportIconMap}
            className="flex-1 md:min-h-0 md:flex-[1_0_0]"
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
                extraBottom: 300,
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
