// src/graph/label-metrics.ts
import {
  buildDisplayName as _bdn,
  calcCollisionRadius as _ccr,
} from "./label-metrics"; // (Nur damit dein Import oben nicht meckert, falls du es als Barrel nutzt)

export const NODE_R = 25; // sichtbarer Kreisradius im CustomNode
export const FONT_PX = 20; // <Text fontSize={20}>
export const MAX_W = 80; // <Text maxWidth={80}>
export const LABEL_Y_OFFSET = 20; // <Text position={[0, -20, 0]}>
export const PADDING = 6; // etwas Luft um Kreis+Text
export const COLLISION_SCALE = 0.5; // dämpft Texteinfluss auf den Radius

function getStr(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = data[key];
  return typeof v === "string" ? v : undefined;
}

/** Baut exakt den Namen, den wir anzeigen wollen. */
export function buildDisplayName(
  data: Record<string, unknown> | undefined,
  fallbackLabel?: string,
): string {
  const bpr = data ? getStr(data, "BPR") : undefined;
  const name = data ? getStr(data, "Name") : undefined;
  const prefix = bpr && bpr !== "None" ? `${bpr}: ` : "";
  // ✅ WICHTIG: Prefix wirklich verwenden + Label als Fallback zulassen
  return `${prefix}${name ?? fallbackLabel ?? ""}`;
}

/** Grobe Schätzung der Text-Bounding-Box (Breite/Höhe). */
export function estimateTextBox(
  text: string,
  fontPx: number = FONT_PX,
  maxW: number = MAX_W,
): { width: number; height: number } {
  const approxW = 0.5 * fontPx * text.length;
  const width = Math.min(approxW, maxW);
  const lines = Math.max(1, Math.ceil(approxW / maxW));
  const lineHeight = fontPx * 1.2;
  const height = lines * lineHeight;
  return { width, height };
}

/** Radialer Kollisionsradius für Kreis + (versetzten) Text. */
export function calcCollisionRadius(displayName: string): number {
  const { width, height } = estimateTextBox(displayName);
  const halfW = width / 2;
  const halfH = height / 2 + LABEL_Y_OFFSET; // Label hängt unter dem Kreis
  const textHalfDiag = Math.hypot(halfW, halfH);
  return NODE_R + COLLISION_SCALE * textHalfDiag + PADDING;
}
