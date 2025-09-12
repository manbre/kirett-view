export const NODE_R = 25; // visible circle radius in customNode
export const FONT_PX = 20; // label font size
export const MAX_W = 80; // label max width
export const LABEL_Y_OFFSET = 20; // vertical offset between icon and label
export const PADDING = 6; // small padding around circle and text
export const COLLISION_SCALE = 0.5; // text influence on radius

function getStr(
  data: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = data[key];
  return typeof v === "string" ? v : undefined;
}

/// build exact display name used in the UI
export function buildDisplayName(
  data: Record<string, unknown> | undefined,
  fallbackLabel?: string,
): string {
  const bpr = data ? getStr(data, "BPR") : undefined;
  const name = data ? getStr(data, "Name") : undefined;
  const prefix = bpr && bpr !== "None" ? `${bpr}: ` : "";
  // apply prefix and allow label fallback
  return `${prefix}${name ?? fallbackLabel ?? ""}`;
}

// rough estimate of text bounding box (width/height)
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

// radial collision radius for icon + offset label
export function calcCollisionRadius(displayName: string): number {
  const { width, height } = estimateTextBox(displayName);
  const halfW = width / 2;
  const halfH = height / 2 + LABEL_Y_OFFSET;
  const textHalfDiag = Math.hypot(halfW, halfH);
  return NODE_R + COLLISION_SCALE * textHalfDiag + PADDING;
}
