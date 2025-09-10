"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

/**
 * Report a node's position once it becomes finite.
 * Retries for a few frames because many layouts assign x/y asynchronously.
 */
export function useReportNodePosition(
  id: string,
  x?: number,
  y?: number,
  opts?: { maxFrames?: number },
) {
  const setNodePos = useStore.getState().setNodePos;
  const triesLeft = useRef<number>(opts?.maxFrames ?? 60); // ~1s at 60fps
  const last = useRef<{ x?: number; y?: number }>({});

  useEffect(() => {
    let raf: number | null = null;

    const tick = () => {
      // Only update when we have finite coordinates
      const isFiniteXY =
        typeof x === "number" &&
        typeof y === "number" &&
        Number.isFinite(x) &&
        Number.isFinite(y);

      if (isFiniteXY) {
        // Avoid redundant store updates
        if (last.current.x !== x || last.current.y !== y) {
          setNodePos(id, x!, y!);
          last.current = { x, y };
        }
        // We have a valid position -> stop the loop
        triesLeft.current = 0;
      } else {
        // Not yet valid -> keep trying while retries remain
        triesLeft.current -= 1;
        if (triesLeft.current <= 0) {
          return;
        }
        raf = requestAnimationFrame(tick);
      }
    };

    // Kick off immediately; continue via rAF if needed
    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // Intentionally only restart when id/x/y change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, x, y]);
}
