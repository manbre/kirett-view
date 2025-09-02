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
 * 💻 Desktop: Multi-Column (spaltet horizontal, wenn vertikal voll)
 *      – WICHTIG: Die Section muss eine feste Höhe haben (vom Parent),
 *        daher hier md:h-full, damit der Column-Container wirklich die
 *        verteilte Höhe (5/8, 2/8, 1/8) annimmt und NICHT nach unten wächst.
 */
export function Section<K extends string>({
  keys,
  map,
  className = "",
  isActive,
  onToggle,
}: Props<K>) {
  const items = (keys || []).filter((k) => k in map);

  const btnBase =
    "inline-flex items-center justify-center rounded-md border border-[var(--color-border)] " +
    "bg-fore hover:bg-[var(--mark)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mark)]";

  return (
    <div
      className={[
        // 📱 mobil: Wrap
        "flex w-full flex-row flex-wrap content-start justify-start gap-1",
        // 💻 desktop: Multi-Column, keine Stretch-Breite
        "md:block md:h-full md:[width:max-content] md:overflow-visible",
        "md:[column-gap:0.25rem] md:[column-fill:auto] md:[column-width:2.9rem]",
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
              "inline-flex items-center justify-center",
              "bg-fore h-9 w-9 rounded-md border border-[var(--color-border)]",
              "hover:bg-[var(--mark)]/10 focus-visible:outline focus-visible:outline-[var(--mark)]",
              // Column-Item:
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
