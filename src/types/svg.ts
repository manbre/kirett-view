// src/types/svg.ts
// EN: Types used for SVG export of the graph.
// DE: Typen für den SVG-Export des Graphen.

export interface ExportNodePosition {
  // EN: Canvas-space position in pixels (center of the node).
  // DE: Position im Canvas (Pixel, Mittelpunkt des Knotens).
  x: number;
  y: number;
}

export interface ExportNodeData {
  id: string;
  label: string; // EN/DE: Node type label (e.g., MedicationNode)
  displayName: string; // EN/DE: Visible node text
  radius: number; // EN/DE: Node radius used for rendering
  fillColor: string; // EN/DE: Node fill color
  strokeColor: string; // EN/DE: Node stroke color
  strokeWidth: number; // EN/DE: Node stroke width
  iconPath?: string; // EN/DE: Public path to icon SVG (from constants/label.ts)
  position?: ExportNodePosition; // EN/DE: Optional position from the running layout engine
}

export interface ExportEdgeData {
  id: string;
  source: string; // EN/DE: Source node id
  target: string; // EN/DE: Target node id
  label?: string; // EN/DE: Optional edge label
  strokeColor: string; // EN/DE: Edge color
  strokeWidth: number; // EN/DE: Edge width
  withArrow: boolean; // EN/DE: Whether to draw an arrow marker
}

export interface ExportGraphData {
  nodes: ExportNodeData[];
  edges: ExportEdgeData[];
}

export interface SvgExportOptions {
  fileName: string; // EN/DE: Download file name, e.g. "subgraph.svg"
  padding: number; // EN/DE: Padding around drawing area
  fontFamily: string; // EN/DE: Font family for labels
  fontSize: number; // EN/DE: Font size in px
  background?: string; // EN/DE: Optional background fill ("#fff" or "transparent")
  includeEdgeLabels: boolean; // EN/DE: Whether to draw edge labels
  embedIcons: boolean; // EN/DE: Whether to inline SVG icons into the export
  iconScale: number; // EN/DE: Scale factor applied to icons relative to node radius
}
