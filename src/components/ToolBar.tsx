"use client";

import {
  labelIconMap,
  type NodeLabel,
  filterIconMap,
  type FilterLabel,
} from "@/constants/label";
import { Section } from "@/components/Section";
import { useStore, selectors } from "@/store/useStore";
import type { HopKey } from "@/store/slices/topologySlice";

const group1 = Object.keys(labelIconMap) as NodeLabel[];
const group2 = Object.keys(filterIconMap) as FilterLabel[];
const group3: NodeLabel[] = ["BPRNode", "StopNode"];

const isHop = (k: FilterLabel): k is HopKey => k === "HopOne" || k === "HopTwo";

type Props = { className?: string };

export function ToolBar({ className = "" }: Props) {
  const selectedTypes = useStore(selectors.selectedTypes);
  const toggleType = useStore(selectors.toggleType);
  const hops = useStore(selectors.hops);
  const toggleHop = useStore(selectors.toggleHop);
  const showOnlyEdges = useStore(selectors.showOnlyEdges);
  const toggleOnlyEdges = useStore(selectors.toggleShowOnlyEdges);

  return (
    <aside
      role="toolbar"
      aria-label="Graph-Filter"
      className={[
        "bg-fore rounded-xl border border-[var(--color-border)] p-2",
        "overflow-visible",
        // Desktop: Box schrumpft auf Inhalt
        "md:inline-block md:[width:max-content] md:min-w-0",
        className,
      ].join(" ")}
    >
      <div
        className="flex flex-col gap-2 md:h-full md:min-h-0 md:[width:max-content]" // [FIX] Toolbar-intern feste Gesamthöhe
      >
        {/* ===== Section 1: 5/8 ===== */}
        <Section<NodeLabel>
          keys={group1}
          map={labelIconMap}
          className={[
            // mobil egal
            "w-full",
            // [FIX] wirklich feste Höheanteile: 5/8
            // flex-[grow shrink basis] → 5 0 0  (keine Schrumpfung, Basis 0)
            "md:h-0 md:min-h-0 md:flex-[5_0_0]",
          ].join(" ")}
          isActive={(k) => selectedTypes.includes(k)}
          onToggle={toggleType}
        />

        <div className="hidden border-t border-[var(--color-border)] md:block" />

        {/* ===== Section 2 (2/8) + Section 3 (1/8) ===== */}
        <div
          className={[
            "flex flex-row gap-2 md:flex-col md:gap-0",
            "md:h-0 md:min-h-0 md:flex-[3_0_0]", // zusammen 3/8
          ].join(" ")}
        >
          {/* 2/8 */}
          <Section<FilterLabel>
            keys={group2}
            map={filterIconMap}
            className="flex-1 md:h-0 md:min-h-0 md:flex-[2_0_0]"
            isActive={(k) => (isHop(k) ? hops.includes(k) : showOnlyEdges)}
            onToggle={(k) => (isHop(k) ? toggleHop(k) : toggleOnlyEdges())}
          />

          <div className="hidden border-t border-[var(--color-border)] md:block" />

          {/* 1/8 */}
          <Section<NodeLabel>
            keys={group3}
            map={labelIconMap}
            className="flex-1 md:h-0 md:min-h-0 md:flex-[1_0_0]"
            isActive={(k) => selectedTypes.includes(k)}
            onToggle={toggleType}
          />
        </div>
      </div>
    </aside>
  );
}
