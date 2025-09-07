// EN: Load inline SVG icons per node id.
// DE: Lädt Inline-SVG-Icons pro Knoten-ID.

import type { GraphNode } from "@/types/graph";
import { labelIconMap } from "@/constants/label";
import { parseInlineSvg, toAbsoluteUrl, type ParsedIcon } from "./svgUtils";
import { resolveIconKey } from "./graphUtils";

export async function loadIconsFor(
  nodes: GraphNode[],
): Promise<Map<string, ParsedIcon>> {
  const out = new Map<string, ParsedIcon>();

  await Promise.all(
    nodes.map(async (n) => {
      const key = resolveIconKey(n);
      const url = key ? labelIconMap[key] : "/icons/default.svg";
      if (!url) return;

      try {
        const abs = toAbsoluteUrl(url);
        const txt = await fetch(abs).then((r) => r.text());
        const parsed = parseInlineSvg(txt);
        out.set(n.id, parsed);
      } catch {
        // ignore: fallback drawing will kick in
      }
    }),
  );

  return out;
}
