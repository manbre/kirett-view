// EN: Low-level SVG helpers: escaping, sanitizing, parsing inline SVGs,
//     and simple text width/line estimation used by bbox & labels.
// DE: Low-Level SVG-Helfer: Escapen, Sanitizing, Inline-SVG parsen,
//     plus einfache Textbreiten-/Zeilenabschätzung für BBox & Labels.

export type ParsedIcon = { viewBox: string; inner: string };

// ---------- XML text escaping ----------

export function esc(s: string): string {
  return s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c] as string,
  );
}

// ---------- text metrics (approx) ----------

// EN: Approximate text width in px for a given font size.
//     0.5em per char is a robust compromise for UI fonts.
// DE: Grobe Textbreite in px (für gegebene Fontgröße).
//     0,5em pro Zeichen ist ein robuster Kompromiss für UI-Fonts.
export function estimateTextWidth(text: string, fontSize: number): number {
  const t = (text ?? "").trim();
  const approx = 0.5 * fontSize * t.length;
  const min = 2 * fontSize;
  const max = 20 * fontSize;
  return Math.max(min, Math.min(max, approx));
}

// EN: Wrap text to lines using the same width constraint we pass to the viewer.
//     Returns lines and the widest measured line width.
// DE: Text anhand einer Maximalbreite umbrechen – wie im Viewer.
//     Liefert Zeilen + Breite der breitesten Zeile.
export function wrapTextToLines(
  text: string,
  fontSize: number,
  maxWidth: number,
): { lines: string[]; widest: number } {
  const words = (text ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lines: [""], widest: 0 };

  const lines: string[] = [];
  let current = words[0];
  let widest = estimateTextWidth(current, fontSize);

  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    const w = estimateTextWidth(candidate, fontSize);
    if (w <= maxWidth) {
      current = candidate;
      widest = Math.max(widest, w);
    } else {
      lines.push(current);
      current = words[i];
      widest = Math.max(widest, estimateTextWidth(current, fontSize));
    }
  }
  lines.push(current);
  return { lines, widest };
}

// ---------- sanitize & parse inline svg ----------

export function sanitizeSvgInner(inner: string): string {
  let s = inner;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*["'][^"']*["']/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/\s(?:xlink:)?href\s*=\s*["']https?:[^"']*["']/gi, "");
  return s;
}

export function normalizeToCurrentColor(inner: string): string {
  return inner
    .replace(
      /fill\s*=\s*["']#(?:000000|111111|222222|333333|444444|555555)["']/gi,
      'fill="currentColor"',
    )
    .replace(
      /stroke\s*=\s*["']#(?:000000|111111|222222|333333|444444|555555)["']/gi,
      'stroke="currentColor"',
    );
}

export function parseInlineSvg(text: string): ParsedIcon {
  const cleaned = text
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .trim();

  const vb =
    cleaned.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1] ?? "0 0 24 24";
  const innerRaw = cleaned.replace(/<\/?svg[^>]*>/g, "").trim();
  const innerSan = sanitizeSvgInner(innerRaw);
  const inner = normalizeToCurrentColor(innerSan);
  return { viewBox: vb, inner };
}

// ---------- url helper for public assets ----------

export function toAbsoluteUrl(path: string): string {
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return path;
  }
}
