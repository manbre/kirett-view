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
  /** Optional feste Zellgröße; Standard ist responsive clamp(...) */
  cell?: string;
  /** Meldet dem Parent, dass diese Section ihre Rows berechnet hat (ab md) */
  onReady?: () => void;
  /** Zusätzliche Kacheln (Buttons) die in das Grid eingereiht werden */
  children?: React.ReactNode;
  /** Mobil: nicht umbrechen (in einer Reihe bleiben) */
  nowrapMobile?: boolean;
};

// Isomorphic Layout Effect: auf dem Client useLayoutEffect (vor Paint),
// auf dem Server (SSR) fallback auf useEffect.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Verhalten:
 * - 📱 Mobil (default): Flex + Wrap → Buttons laufen in ZEILEN um.
 * - 💻 Ab md: CSS Grid mit vertikalem Füllen und Spalten nach rechts.
 *   Die Zeilenanzahl (--rows) wird *vor dem Paint* berechnet.
 *   Bis dahin bleibt die Section ab md unsichtbar (kein Flash).
 */
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
  const [ready, setReady] = useState(false); // ⬅️ steuert Sichtbarkeit ab md

  // Hilfsfunktionen
  const measureCellPx = (host: HTMLElement) => {
    const firstChild = host.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const h = Math.round(firstChild.getBoundingClientRect().height);
      if (h > 0) return h;
    }
    // Fallback: Probe-Element misst var(--cell)
    const probe = document.createElement("div");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.height = `var(--cell)`;
    probe.style.width = `var(--cell)`;
    host.appendChild(probe);
    const h = probe.getBoundingClientRect().height || 0;
    host.removeChild(probe);
    return h;
  };

  const computeRows = (host: HTMLElement) => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) {
      // mobil: keine Grid-Zeilenberechnung nötig
      return 1;
    }
    const cs = getComputedStyle(host);
    const cellPx = measureCellPx(host);
    const rowGap = parseFloat(cs.rowGap || cs.gap || "0") || 0;
    const h = host.clientHeight;
    if (cellPx <= 0 || h <= 0) return 1;
    // floor((h + rowGap) / (cellPx + rowGap))
    return Math.max(1, Math.floor((h + rowGap) / (cellPx + rowGap)));
  };

  // Vor dem ersten Paint rows berechnen und danach sichtbar schalten
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setAll = () => {
      setRows(computeRows(el));
      if (!ready) {
        setReady(true);
        onReady?.(); // ⬅️ Parent informieren: diese Section ist bereit
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
        // 📱 Mobil: Flex + Wrap in Zeilen (immer sichtbar auf Mobil)
        nowrapMobile
          ? "flex w-full flex-row flex-nowrap content-start justify-start gap-1"
          : "flex w-full flex-row flex-wrap content-start justify-start gap-1",
        // 💻 Ab md: Grid, das vertikal füllt und dann neue Spalten anlegt
        "md:grid md:content-start md:gap-1",
        "md:[grid-auto-columns:var(--cell)] md:[grid-auto-flow:column] md:[grid-auto-rows:var(--cell)]",
        "md:[grid-template-rows:repeat(var(--rows),var(--cell))]",
        // Desktop: feste Höhe vom Parent, Breite folgt dem Inhalt
        "md:h-full md:[width:max-content] md:overflow-visible",
        // 💡 WICHTIG: Kein Flash – bis ready unsichtbar (nur ab md)
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
              // exakt eine Zelle groß
              "inline-grid h-[var(--cell)] w-[var(--cell)] place-items-center",
              "rounded-md border border-[var(--color-border)]",
              "hover: cursor-pointer hover:bg-[var(--color-mark)]/10",
              // Fokus: Ring statt Outline
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
