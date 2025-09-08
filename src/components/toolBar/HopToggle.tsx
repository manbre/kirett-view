"use client";

import React from "react";
import { useStore } from "@/store/useStore";
import type { HopMode } from "@/store/slices/topologySlice";

/** Drei Optionen: Hop 1, Hop 2, Hop 1 & 2.
 *  Mobil horizontal (row), ab md vertikal (col).
 */
export function HopToggle() {
  const hopMode = useStore((s) => s.hopMode);
  const setHopMode = useStore((s) => s.setHopMode);

  const Item = ({ value, label }: { value: HopMode; label: string }) => {
    const active = hopMode === value;
    return (
      <button
        type="button"
        onClick={() => setHopMode(value)}
        className={[
          "rounded-md border px-3 py-1 text-sm transition-colors",
          active
            ? "border-[var(--color-mark)] bg-[var(--color-mark)]/10"
            : "border-[var(--color-border)] bg-white hover:bg-[var(--color-border)]/20",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex gap-2 md:flex-col">
      <Item value="hop1" label="Hop 1" />
      <Item value="hop2" label="Hop 2" />
      <Item value="both" label="Hop 1 & 2" />
    </div>
  );
}
