"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import type { HopMode } from "@/store/slices/topologySlice";
// no icon imports here; OnlyEdges is handled by the Section

/** Drei Optionen: Hop 1, Hop 2, Hop 1 & 2.
 *  Mobil horizontal (row), ab md vertikal (col).
 *  Buttons sind quadratisch (var(--cell)) und reihen sich in Section-Spalten ein.
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

  // Wrapper als EIN Grid-Item (Verbund): mobil Reihe, ab md Spalte; spannt 3 Rows
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
              // exakt eine Zelle groß, wie die Icons
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
