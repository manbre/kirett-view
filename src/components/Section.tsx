"use client";

import { useStore } from "@/store/useStore";
import { labelIconMap, type NodeLabel } from "@/constants/label";
import { MaskedIcon } from "@/components/MaskedIcon";

type Props = {
  keys?: NodeLabel[];
  className?: string; // auf Desktop bekommt die Section Höhe via md:h-0 + md:flex-[…]
  onSelect?: (l: NodeLabel) => void;
};

/**
 * Desktop:
 *  - Zweispaltiges Grid (grid-cols-2)
 *  - Section hat feste (zugeteilte) Höhe und scrollt VERTIKAL (overflow-auto)
 *  - Icons feste Größe -> sauberes Raster
 *
 * Mobile:
 *  - Zeilenweises Wrappen (flex-row flex-wrap), keine Scrollbar in Section
 */
export function Section({ keys = [], onSelect, className = "" }: Props) {
  const selectedIcons = useStore((s) => s.selectedIcons); // Array ist robust (persist)
  const toggleIcon = useStore((s) => s.toggleIcon);

  const btn =
    "group inline-flex items-center justify-center rounded-md border border-[var(--color-border)] " +
    "bg-fore hover:bg-[var(--mark)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mark)]";

  const items = (keys || []).filter((k) => k in labelIconMap);

  return (
    <div
      className={[
        // 📱 Mobil: volle Breite, Zeilenweise, KEIN Scroll
        "flex w-full flex-row flex-wrap content-start justify-start gap-2",
        // 💻 Desktop: zweispaltiges Grid mit eigenem Scroll
        "md:grid md:auto-rows-[2rem] md:grid-cols-2 md:overflow-auto",
        // Höhe kommt von außen: md:h-0 + md:flex-[x]
        "min-h-0",
        className,
      ].join(" ")}
    >
      {items.map((label) => {
        const src = labelIconMap[label];
        const active = false;
        return (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => {
              toggleIcon(label);
              onSelect?.(label);
            }}
            className={[
              btn,
              "h-9 w-9 shrink-0", // quadratisch
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
