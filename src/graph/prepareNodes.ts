// src/graph/prepareNodes.ts
import { buildDisplayName, calcCollisionRadius } from "./label-metrics";

// Minimale Node-Form, die wir brauchen (id, optionale Größe, optionale Daten).
export type BaseNode = {
  id: string;
  size?: number;
  label?: string; // ✅ optionales Label als Fallback verwenden
  data?: {
    BPR?: string | null;
    Name?: string | null;
    labels?: string[] | null;
  };
};

export type NodeCollisionExtras = {
  nameForLabel: string;
  collisionRadius: number;
};

export type NodeWithCollision<T extends BaseNode = BaseNode> = T &
  NodeCollisionExtras;

/**
 * Reicht Knoten so auf, dass Simulation ihre reale Ausdehnung (Kreis + Text) kennt.
 */
export function prepareNodes<T extends BaseNode>(
  rawNodes: readonly T[],
): NodeWithCollision<T>[] {
  return rawNodes.map((n) => {
    // ✅ Label als Fallback mitgeben – konsistent mit Viewer & Export
    const nameForLabel = buildDisplayName(n.data, n.label);
    const collisionRadius = calcCollisionRadius(nameForLabel);
    const liftedSize = Math.max(n.size ?? 16, Math.ceil(2 * collisionRadius));
    return { ...n, nameForLabel, collisionRadius, size: liftedSize };
  });
}
