"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

//
// report a node's position once it becomes finite
// retries for a few frames
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
      // only update when we have finite coordinates
      const isFiniteXY =
        typeof x === "number" &&
        typeof y === "number" &&
        Number.isFinite(x) &&
        Number.isFinite(y);

      if (isFiniteXY) {
        // avoid redundant store updates
        if (last.current.x !== x || last.current.y !== y) {
          setNodePos(id, x!, y!);
          last.current = { x, y };
        }
        // valid position -> stop
        triesLeft.current = 0;
      } else {
        // not valid -> keep trying while retries remain
        triesLeft.current -= 1;
        if (triesLeft.current <= 0) {
          return;
        }
        raf = requestAnimationFrame(tick);
      }
    };

    // kick off, continue with rAF if needed
    raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // only restart when id/x/y change
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, x, y]);
}
