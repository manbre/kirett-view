// src/utils/svg/exportGraphToSvg.ts
// EN: Convert graph data to a self-contained SVG string, optionally embedding icon SVGs.
// DE: Konvertiert Graphdaten in einen eigenständigen SVG-String und bettet optional Icon-SVGs ein.

import { ExportGraphData, SvgExportOptions, ExportNodeData } from "@/types/svg";

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface IconDef {
  id: string; // EN/DE: Symbol id used in <use href="#id">
  innerSvg: string; // EN/DE: Inner markup of the original <svg> (without outer tag)
  viewBox: { w: number; h: number }; // EN/DE: ViewBox width/height to scale correctly
}

function hasPositions(nodes: ExportNodeData[]): boolean {
  return nodes.every((n) => n.position !== undefined);
}

function computeFallbackPositions(
  nodes: ExportNodeData[],
): Map<string, { x: number; y: number }> {
  // EN: Deterministic circular layout as a safe fallback.
  // DE: Deterministisches Kreis-Layout als sichere Rückfallebene.
  const count = nodes.length;
  const map = new Map<string, { x: number; y: number }>();
  if (count === 0) return map;

  const radius = Math.max(160, Math.ceil(80 * Math.sqrt(count)));
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i += 1) {
    const angle = i * angleStep;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    map.set(nodes[i].id, { x, y });
  }
  return map;
}

function computeBBox(nodes: ExportNodeData[], padding: number): BBox {
  // EN: Build a bounding box from node positions, include radius for margins.
  // DE: Bounding Box aus Knotenpositionen inkl. Radius berechnen.
  const xs: number[] = [];
  const ys: number[] = [];

  for (const n of nodes) {
    const pos = n.position ?? { x: 0, y: 0 };
    xs.push(pos.x - n.radius, pos.x + n.radius);
    ys.push(pos.y - n.radius, pos.y + n.radius);
  }

  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;

  return { minX, minY, maxX, maxY };
}

function escapeXml(input: string): string {
  // EN: Minimal XML escaping for text nodes.
  // DE: Minimales XML-Escaping für Textinhalte.
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function hashString(s: string): string {
  // EN: Simple stable hash for ids (not cryptographic).
  // DE: Einfache, stabile Hashfunktion für IDs (nicht kryptographisch).
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0; // keep 32-bit
  }
  return Math.abs(h).toString(36);
}

function parseIconSvg(svgText: string): {
  inner: string;
  w: number;
  h: number;
} {
  // EN: Extract inner markup and viewBox size; default to 24x24 if missing.
  // DE: Extrahiert inneres Markup und ViewBox-Größe; Default 24x24 falls nicht vorhanden.
  const viewBoxMatch = svgText.match(/viewBox\s*=\s*"(.*?)"/i);
  let w = 24;
  let h = 24;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].split(/\s+/).map((p) => Number(p));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      w = parts[2];
      h = parts[3];
    }
  }
  const inner = svgText
    .replace(/^[\s\S]*?<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
  return { inner, w, h };
}

async function loadIconDefs(
  iconPaths: string[],
): Promise<Record<string, IconDef>> {
  // EN: Fetch and parse each icon SVG once; key by original path.
  // DE: Lädt und parst jedes Icon-SVG einmal; Schlüssel ist der Original-Pfad.
  const unique = Array.from(new Set(iconPaths.filter(Boolean)));
  const entries: Array<[string, IconDef]> = [];

  for (const path of unique) {
    try {
      const res = await fetch(path, { cache: "force-cache" });
      const text = await res.text();
      const parsed = parseIconSvg(text);
      const id = `icon-${hashString(path)}`;
      entries.push([
        path,
        {
          id,
          innerSvg: parsed.inner,
          viewBox: { w: parsed.w, h: parsed.h },
        },
      ]);
    } catch {
      // EN: If fetching fails, skip the icon; node will render without icon.
      // DE: Falls Laden fehlschlägt, Icon auslassen; Knoten wird ohne Icon gezeichnet.
      // (No logging here to keep overhead minimal)
    }
  }

  return Object.fromEntries(entries);
}

export async function exportGraphToSvgString(
  graph: ExportGraphData,
  options: SvgExportOptions,
): Promise<string> {
  const { nodes, edges } = graph;
  const {
    padding,
    fontFamily,
    fontSize,
    background,
    includeEdgeLabels,
    embedIcons,
    iconScale,
  } = options;

  // EN: Ensure every node has a position (use fallback if missing).
  // DE: Sicherstellen, dass jeder Knoten eine Position hat (Fallback verwenden falls fehlend).
  if (!hasPositions(nodes)) {
    const fallback = computeFallbackPositions(nodes);
    for (const n of nodes) {
      n.position = n.position ?? fallback.get(n.id);
    }
  }

  const bbox = computeBBox(nodes, padding);
  const width = Math.max(64, Math.ceil(bbox.maxX - bbox.minX));
  const height = Math.max(64, Math.ceil(bbox.maxY - bbox.minY));

  // EN: Lookup map for node positions.
  // DE: Lookup-Map für Knotenpositionen.
  const pos = new Map(nodes.map((n) => [n.id, n.position!]));

  // EN: Arrow marker id (unique per export).
  // DE: Eindeutige Pfeil-Marker-ID je Export.
  const markerId = `arrow-${Math.random().toString(36).slice(2)}`;

  // EN: Optionally load icon defs based on nodes' iconPath.
  // DE: Optionales Laden der Icon-Definitionen basierend auf iconPath der Knoten.
  const iconPaths = embedIcons ? nodes.map((n) => n.iconPath ?? "") : [];
  const iconDefsMap = embedIcons ? await loadIconDefs(iconPaths) : {};

  const edgeSvgs = edges.map((e) => {
    const s = pos.get(e.source);
    const t = pos.get(e.target);
    if (!s || !t) return "";

    const line = `<line x1="${s.x - bbox.minX}" y1="${s.y - bbox.minY}" x2="${t.x - bbox.minX}" y2="${t.y - bbox.minY}" stroke="${e.strokeColor}" stroke-width="${e.strokeWidth}" ${e.withArrow ? `marker-end="url(#${markerId})"` : ""} />`;

    let label = "";
    if (includeEdgeLabels && e.label) {
      const mx = (s.x + t.x) / 2 - bbox.minX;
      const my = (s.y + t.y) / 2 - bbox.minY - 4;
      label = `<text x="${mx}" y="${my}" font-family="${fontFamily}" font-size="${fontSize - 2}" text-anchor="middle">${escapeXml(e.label)}</text>`;
    }
    return `${line}${label}`;
  });

  const nodeSvgs = nodes.map((n) => {
    const cx = n.position!.x - bbox.minX;
    const cy = n.position!.y - bbox.minY;

    // EN: Node circle.
    // DE: Knoten-Kreis.
    const circle = `<circle cx="${cx}" cy="${cy}" r="${n.radius}" fill="${n.fillColor}" stroke="${n.strokeColor}" stroke-width="${n.strokeWidth}" />`;

    // EN: Optional icon centered in the node (using <use>).
    // DE: Optionales Icon zentriert im Knoten (via <use>).
    let icon = "";
    if (embedIcons && n.iconPath && iconDefsMap[n.iconPath]) {
      const def = iconDefsMap[n.iconPath];
      const size = n.radius * iconScale;
      const sx = size / def.viewBox.w;
      const sy = size / def.viewBox.h;

      // EN: Center icon at (cx, cy): translate to center, scale, translate by -viewBox/2.
      // DE: Icon auf (cx,cy) zentrieren: zur Mitte verschieben, skalieren, um -viewBox/2 versetzen.
      icon = `
        <g transform="translate(${cx},${cy}) scale(${sx},${sy}) translate(${-def.viewBox.w / 2},${-def.viewBox.h / 2})" color="#111" fill="currentColor" stroke="currentColor" vector-effect="non-scaling-stroke">
          <use href="#${def.id}" />
        </g>
      `;
    }

    const label = `<text x="${cx}" y="${cy + n.radius + fontSize + 2}" font-family="${fontFamily}" font-size="${fontSize}" text-anchor="middle">${escapeXml(n.displayName)}</text>`;
    return `${circle}${icon}${label}`;
  });

  // EN: <defs> contains arrow marker + embedded icons as <symbol>.
  // DE: <defs> enthält Pfeil-Marker + eingebettete Icons als <symbol>.
  const iconSymbols = embedIcons
    ? Object.values(iconDefsMap)
        .map(
          (d) =>
            `<symbol id="${d.id}" viewBox="0 0 ${d.viewBox.w} ${d.viewBox.h}">${d.innerSvg}</symbol>`,
        )
        .join("\n")
    : "";

  const bg = background
    ? `<rect x="0" y="0" width="${width}" height="${height}" fill="${background}" />`
    : "";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Exported subgraph">
  <defs>
    <marker id="${markerId}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
    </marker>
    ${iconSymbols}
  </defs>
  ${bg}
  <g fill="none" stroke="none" stroke-linecap="round" stroke-linejoin="round">
    <g id="edges" color="#444">
      ${edgeSvgs.join("\n")}
    </g>
    <g id="nodes" color="#000">
      ${nodeSvgs.join("\n")}
    </g>
  </g>
</svg>`.trim();

  return svg;
}
