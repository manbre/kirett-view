"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * EN: Report a node's position once it becomes finite. We try for a few frames
 *     because many layouts assign x/y asynchronously.
 * DE: Meldet die Knotenposition, sobald sie endlich ist. Wir probieren es über
 *     einige Frames, weil viele Layouts x/y asynchron setzen.
 */
export function useReportNodePosition(
  id: string,
  x?: number,
  y?: number,
  opts?: { maxFrames?: number },
) {
  const setNodePos = useStore.getState().setNodePos;
  const triesLeft = useRef<number>(opts?.maxFrames ?? 60); // ~1s bei 60fps
  const last = useRef<{ x?: number; y?: number }>({});

  useEffect(() => {
    let raf: number | null = null;

    const tick = () => {
      // nur melden, wenn wir endliche Werte haben
      const isFiniteXY =
        typeof x === "number" &&
        typeof y === "number" &&
        Number.isFinite(x) &&
        Number.isFinite(y);

      if (isFiniteXY) {
        // unnötige Store-Updates vermeiden
        if (last.current.x !== x || last.current.y !== y) {
          setNodePos(id, x!, y!);
          last.current = { x, y };
        }
        // wir haben eine gültige Position -> keinen weiteren Loop nötig
        triesLeft.current = 0;
      } else {
        // noch keine gültigen Werte -> weiter probieren, solange Rest > 0
        triesLeft.current -= 1;
        if (triesLeft.current <= 0) {
          return;
        }
        raf = requestAnimationFrame(tick);
      }
    };

    // sofort starten, dann ggf. über RAF weiter probieren
    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // bewusst nur bei id/x/y neu starten
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, x, y]);
}
