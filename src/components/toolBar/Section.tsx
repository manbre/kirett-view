"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MaskedIcon } from "./MaskedIcon";

type IconMap<K extends string = string> = Record<K, string>;

type Props<K extends string = string> = {
  keys: K[];
  map: IconMap<K>;
  className?: string;
  isActive?: (key: K) => boolean;
  onToggle?: (key: K) => void;
  cell?: string;
  // notifies parent when this section computed its rows (md)
  onReady?: () => void;
  // additional tiles (buttons) to be added to the grid
  children?: React.ReactNode;
  // mobile: prevent wrapping (keep in a single row)
  nowrapMobile?: boolean;
};

// on client useLayoutEffect (before paint),
// on server fallback to useEffect.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

//
// responsive container that lays out a set of icon tiles
// mobile: flex row with wrap, desktop: CSS grid that fills rows vertically and creates new columns
// row count (--rows) is computed pre-paint and remains hidden until ready
export function Section<K extends string>({
  keys,
  map,
  className = "",
  isActive,
  onToggle,
  cell = "clamp(36px, 3.2vw, 72px)",
  onReady,
  children,
  nowrapMobile,
}: Props<K>) {
  const items = useMemo(
    () => (keys || []).filter((k) => k in map),
    [keys, map],
  );
  const ref = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<number>(1);
  const [ready, setReady] = useState(false);

  const measureCellPx = (host: HTMLElement) => {
    const firstChild = host.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const h = Math.round(firstChild.getBoundingClientRect().height);
      if (h > 0) return h;
    }
    // fallback: measure var(--cell) using a temporary element
    const element = document.createElement("div");
    element.style.position = "absolute";
    element.style.visibility = "hidden";
    element.style.height = `var(--cell)`;
    element.style.width = `var(--cell)`;
    host.appendChild(element);
    const h = element.getBoundingClientRect().height || 0;
    host.removeChild(element);
    return h;
  };

  const computeRows = (host: HTMLElement) => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) {
      // mobile: no grid row computation needed
      return 1;
    }
    const cs = getComputedStyle(host);
    const cellPx = measureCellPx(host);
    const rowGap = parseFloat(cs.rowGap || cs.gap || "0") || 0;
    const h = host.clientHeight;
    if (cellPx <= 0 || h <= 0) return 1;
    return Math.max(1, Math.floor((h + rowGap) / (cellPx + rowGap)));
  };

  // compute rows before first paint and then reveal
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setAll = () => {
      setRows(computeRows(el));
      if (!ready) {
        setReady(true);
        onReady?.(); // notify parent that this section is ready
      }
    };

    setAll();

    const ro = new ResizeObserver(setAll);
    ro.observe(el);

    const mq = window.matchMedia("(min-width: 768px)");
    const mqListener = () => setAll();
    mq.addEventListener("change", mqListener);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", mqListener);
    };
  }, [onReady, ready]);

  return (
    <div
      ref={ref}
      data-ready={ready ? "1" : "0"}
      aria-hidden={ready ? undefined : true}
      className={[
        // mobile: flex + wrap into rows
        nowrapMobile
          ? "flex w-full flex-row flex-nowrap content-start justify-start gap-1"
          : "flex w-full flex-row flex-wrap content-start justify-start gap-1",
        // desktop (md): grid that fills rows vertically and then adds columns
        "md:grid md:content-start md:gap-1",
        "md:[grid-auto-columns:var(--cell)] md:[grid-auto-flow:column] md:[grid-auto-rows:var(--cell)]",
        "md:[grid-template-rows:repeat(var(--rows),var(--cell))]",
        // desktop (md): fixed height from parent, width follows content
        "md:h-full md:[width:max-content] md:overflow-visible",
        // no flash, keep hidden until ready (md)
        ready ? "md:visible md:opacity-100" : "md:invisible md:opacity-0",
        "transition-opacity",
        "min-h-0",
        className,
      ].join(" ")}
      style={
        {
          // @ts-expect-error CSS custom props
          "--cell": cell,
          "--rows": rows,
        } as React.CSSProperties
      }
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
              // exactly one cell in size
              "inline-grid h-[var(--cell)] w-[var(--cell)] place-items-center",
              "rounded-md border border-[var(--color-border)]",
              "hover: cursor-pointer hover:bg-[var(--color-mark)]/10",
              // ring instead of outline
              "focus-visible:ring-2 focus-visible:ring-[var(--color-mark)]",
              active
                ? "text-[var(--color-mark)] ring-1 ring-[var(--color-mark)]"
                : "text-[var(--color-node)]",
            ].join(" ")}
          >
            <MaskedIcon src={map[k]} className="h-5 w-5" />
          </button>
        );
      })}
      {children}
    </div>
  );
}
