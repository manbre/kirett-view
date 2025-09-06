// EN: Low-level SVG helpers: escaping, sanitizing, parsing inline SVGs.
// DE: Low-Level SVG-Helfer: Escapen, Sanitisieren, Inline-SVGs parsen.

export type ParsedIcon = { viewBox: string; inner: string };

// EN: Escape XML text content.
// DE: XML-Text-Inhalt escapen.
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

// EN: Estimate text width for bbox calc (≈0.6em per char, clamped).
// DE: Textbreite für BBox schätzen (≈0,6em pro Zeichen, begrenzt).
export function estimateTextWidth(text: string, fontSize: number): number {
  const w = fontSize * 0.6 * text.length;
  const min = fontSize * 2;
  const max = fontSize * 20;
  return Math.max(min, Math.min(max, w));
}

// EN: Basic sanitization to prevent XSS in embedded SVG fragments.
// DE: Grundlegende Sanitization gegen XSS in eingebetteten SVG-Snippets.
export function sanitizeSvgInner(inner: string): string {
  let s = inner;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*["'][^"']*["']/gi, "");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
  s = s.replace(/\s(?:xlink:)?href\s*=\s*["']https?:[^"']*["']/gi, "");
  return s;
}

// EN: Normalize common dark fills/strokes to 'currentColor' (optional visual parity).
// DE: Gängige dunkle Fills/Strokes zu 'currentColor' normalisieren (optional für Optik).
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

// EN: Remove outer <svg>, keep viewBox + sanitized (and normalized) inner markup.
// DE: Äußeres <svg> entfernen, viewBox + saniertes (und normalisiertes) Inneres behalten.
export function parseInlineSvg(text: string): ParsedIcon {
  const cleaned = text
    .replace(/<\?xml[^>]*>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .trim();

  const vb =
    cleaned.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1] ?? "0 0 24 24";
  const innerRaw = cleaned.replace(/<\/?svg[^>]*>/g, "").trim();
  const innerSan = sanitizeSvgInner(innerRaw);
  const inner = normalizeToCurrentColor(innerSan); // helps tint via 'currentColor'
  return { viewBox: vb, inner };
}

// EN: Resolve absolute URL for /public assets.
// DE: Absolute URL für /public-Assets bilden.
export function toAbsoluteUrl(path: string): string {
  try {
    return new URL(path, window.location.origin).toString();
  } catch {
    return path;
  }
}
