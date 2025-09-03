"use client";

import { MaskedIcon } from "@/components/MaskedIcon";

type IconMap<K extends string = string> = Record<K, string>;

type Props<K extends string = string> = {
  keys: K[];
  map: IconMap<K>;
  className?: string;
  isActive?: (key: K) => boolean;
  onToggle?: (key: K) => void;
};

/**
 * 📱 Mobile: Flex-Row + Wrap
 * 💻 Desktop: CSS Multi-Column – füllt zunächst vertikal, dann neue Spalten rechts.
 * Voraussetzung: Die Section hat im Desktop eine feste Höhe (vom Parent),
 * daher hier md:h-full. Dadurch funktioniert column-fill:auto sequentiell.
 */
export function Section<K extends string>({
  keys,
  map,
  className = "",
  isActive,
  onToggle,
}: Props<K>) {
  const items = (keys || []).filter((k) => k in map);

  return (
    <div
      className={[
        // 📱 mobil: Wrap-Gitter
        "flex w-full flex-row flex-wrap content-start justify-start gap-1",
        // 💻 desktop: Multi-Column; feste Höhe nötig
        "md:block md:h-full md:[width:max-content] md:overflow-visible",
        // WICHTIG: Spaltenbreite + Gap passend zu Button-Maßen (w-9/h-9)
        "md:[column-gap:theme(spacing.1)] md:[column-fill:auto] md:[column-width:theme(spacing.9)]",
        "min-h-0",
        className,
      ].join(" ")}
    >
      {items.map((k) => {
        const active = isActive?.(k) ?? false;
        return (
          <button
            key={k}
            type="button"
            aria-label={k}
            aria-pressed={active}
            title={k}
            onClick={() => onToggle?.(k)}
            className={[
              // Kachel: quadratisch 9x9 (2.25rem), konsistent mit column-width
              "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)]",
              "bg-fore hover:bg-[var(--mark)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mark)]",
              // Multi-Column Item-Eigenschaften
              "mb-1 inline-block break-inside-avoid align-top",
              active
                ? "text-[var(--mark)] ring-1 ring-[var(--mark)]"
                : "text-[var(--text)]",
            ].join(" ")}
          >
            <MaskedIcon src={map[k]} className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
