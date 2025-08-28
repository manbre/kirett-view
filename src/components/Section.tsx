"use client";

import { labelIconMap, type NodeLabel } from "@/constants/label";
import { MaskedIcon } from "@/components/MaskedIcon";

type Props = {
  keys: NodeLabel[];
  onSelect?: (label: NodeLabel) => void;
};

export function Section({ keys, onSelect }: Props) {
  const btnBase =
    "flex items-center justify-center rounded-md border border-[var(--border)] " +
    "bg-fore text-[var(--text)] hover:text-[var(--mark)] " +
    "bg-fore hover:bg-[var(--mark)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mark)]";

  return (
    <div
      className={[
        "grid gap-2",
        "auto-rows-[2rem] grid-cols-[repeat(auto-fill,_minmax(2rem,_1fr))]",
        "md:auto-rows-[2rem] md:grid-cols-2",
        "justify-items-center",
      ].join(" ")}
    >
      {keys
        .filter((k) => k in labelIconMap)
        .map((label) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            onClick={() => onSelect?.(label)}
            className={`${btnBase} aspect-square h-9`}
          >
            <MaskedIcon src={labelIconMap[label]} className="h-5 w-5" />
          </button>
        ))}
    </div>
  );
}
