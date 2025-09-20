"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import type { HopMode } from "@/store/slices/topologySlice";

//
// three mutually exclusive hop-depth options (1 / 2 / 1&2)
// mobile: horizontal row, desktop: vertical column with 3 rows
export function HopToggle() {
  const hopMode = useStore((s) => s.hopMode);
  const setHopMode = useStore((s) => s.setHopMode);

  const items: { value: HopMode; label: string; title: string }[] = [
    { value: "hop1", label: "1", title: "Hop 1" },
    { value: "hop2", label: "2", title: "Hop 2" },
    { value: "both", label: "1&2", title: "Hop 1 & 2" },
  ];

  return (
    <div className="flex items-stretch justify-start gap-1.5 rounded-md bg-[var(--color-bg)] ring-1 ring-[var(--color-border)] md:[grid-row:span_3_/span_3] md:[width:var(--cell)] md:flex-col">
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
