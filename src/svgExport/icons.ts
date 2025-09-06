// EN: Load only icons used by the current graph (inline, sanitized, cached).
// DE: Nur die im aktuellen Graph verwendeten Icons laden (inline, saniert, gecacht).

import { labelIconMap, type NodeLabel } from "@/constants/label";
import { parseInlineSvg, toAbsoluteUrl, type ParsedIcon } from "./svgUtils";
import type { GraphNode } from "@/types/graph";
import { resolveIconKey } from "./graphUtils";

const ICON_CACHE = new Map<NodeLabel, ParsedIcon>();

export async function loadIconsFor(
  nodes: GraphNode[],
): Promise<Map<NodeLabel, ParsedIcon>> {
  // EN: collect unique label keys we actually need
  // DE: nur die tatsächlich benötigten Label-Keys sammeln
  const labels = new Set<NodeLabel>();
  for (const n of nodes) {
    const key = resolveIconKey(n);
    if (key && labelIconMap[key]) labels.add(key);
  }

  const out = new Map<NodeLabel, ParsedIcon>();
  await Promise.all(
    Array.from(labels).map(async (k) => {
      const cached = ICON_CACHE.get(k);
      if (cached) {
        out.set(k, cached);
        return;
      }
      try {
        const res = await fetch(toAbsoluteUrl(labelIconMap[k]));
        if (!res.ok) return;
        const txt = await res.text();
        const parsed = parseInlineSvg(txt); // sanitized + normalized
        ICON_CACHE.set(k, parsed);
        out.set(k, parsed);
      } catch {
        // EN: ignore; caller will draw a circle fallback
        // DE: ignorieren; Aufrufer zeichnet Kreis-Fallback
      }
    }),
  );
  return out;
}
