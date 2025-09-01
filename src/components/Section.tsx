"use client";

import { useStore } from "@/store/useStore";
import { labelIconMap, type NodeLabel } from "@/constants/label";
import { MaskedIcon } from "@/components/MaskedIcon";

type Props = {
  keys?: NodeLabel[];
  className?: string; // bekommt md:h-full + md:flex-[x] vom Parent
  onSelect?: (l: NodeLabel) => void;
};

/**
 * Section:
 * - Desktop: flex-col + flex-wrap + h-full  → füllt zuerst vertikal,
 *   dann entstehen Spalten nach rechts (Toolbar wächst horizontal).
 * - Keine Scrollbars in der Section.
 */
export function Section({ keys = [], onSelect, className = "" }: Props) {
  const selectedIcons = useStore((s) => s.selectedIcons); // Array -> robust
  const toggleIcon = useStore((s) => s.toggleIcon);

  const btn =
    "group inline-flex items-center justify-center rounded-md border border-[var(--color-border)] " +
    "bg-fore hover:bg-[var(--mark)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mark)]";

  return (
    <div
      className={[
        "min-h-0",
        // Mobil: Zeilen + Wrap
        "flex flex-row flex-wrap content-start justify-start gap-1",
        // Desktop: SPALTEN via Flex → erst vertikal füllen, dann nach rechts wachsen
        "md:flex md:h-full md:flex-col md:flex-wrap md:content-start",
        "overflow-visible", // <— nie hidden; Toolbar/Parent schneiden nicht ab
        className,
      ].join(" ")}
    >
      {(keys || [])
        .filter((k) => k in labelIconMap)
        .map((label) => {
          const src = labelIconMap[label];
          const active = false;

          return (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              onClick={() => {
                toggleIcon(label);
                onSelect?.(label);
              }}
              className={[
                btn,
                "h-9 w-9 shrink-0", // feste Kachelgröße -> sauberes Wrap-Verhalten
                active
                  ? "text-[var(--mark)] ring-1 ring-[var(--mark)]"
                  : "text-[var(--text)]",
              ].join(" ")}
            >
              <MaskedIcon src={src} className="h-5 w-5" />
            </button>
          );
        })}
    </div>
  );
}
