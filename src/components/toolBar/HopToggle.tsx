"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import type { HopMode } from "@/store/slices/topologySlice";
// OnlyEdges is handled by the Section; this component is a single grouped control

/**
 * HopToggle
 * Three mutually exclusive hop-depth options (1 / 2 / 1&2).
 * Mobile: horizontal row; Desktop: vertical column.
 * Rendered as a single column group that spans 3 rows in the Section grid.
 */
export function HopToggle() {
  const hopMode = useStore((s) => s.hopMode);
  const setHopMode = useStore((s) => s.setHopMode);
  // OnlyEdges control is rendered by the parent Section (ToolBar)

  const items: { value: HopMode; label: string; title: string }[] = [
    { value: "hop1", label: "1", title: "Hop 1" },
    { value: "hop2", label: "2", title: "Hop 2" },
    { value: "both", label: "1&2", title: "Hop 1 & 2" },
  ];

  // Wrapper as a single grid item (group): mobile row, desktop column; spans 3 rows
  return (
    <div className="flex items-stretch justify-start gap-1.5 rounded-md bg-[var(--color-border)] ring-1 ring-[var(--color-bg)] md:[grid-row:span_3_/span_3] md:[width:var(--cell)] md:flex-col">
      {items.map(({ value, label, title }) => {
        const active = hopMode === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={title}
            title={title}
            aria-pressed={active}
            onClick={() => setHopMode(value)}
            className={[
              // exactly one cell size, same as icon tiles
              "inline-grid h-[var(--cell)] w-[var(--cell)] place-items-center",
              "rounded-md border border-[var(--color-border)] bg-[var(--color-bg)]",
              "hover:cursor-pointer hover:bg-[var(--color-mark)]/10",
              "focus-visible:ring-2 focus-visible:ring-[var(--color-mark)]",
              active
                ? "border-[var(--color-mark)] font-bold text-[var(--color-mark)] ring-1 ring-[var(--color-mark)]"
                : "text-[var(--color-node)]",
              "text-xs",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
