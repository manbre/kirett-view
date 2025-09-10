// src/graph/prepareNodes.ts
import { buildDisplayName, calcCollisionRadius } from "./labelMetrics";

// Minimal node shape we rely on (id, optional size, optional data)
export type BaseNode = {
  id: string;
  size?: number;
  label?: string; // optional label as display fallback
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
 * Lift nodes with computed display name and collision radius so the
 * simulation knows their effective footprint (circle + label).
 */
export function prepareNodes<T extends BaseNode>(
  rawNodes: readonly T[],
): NodeWithCollision<T>[] {
  return rawNodes.map((n) => {
    // Provide label fallback – consistent between viewer and export
    const nameForLabel = buildDisplayName(n.data, n.label);
    const collisionRadius = calcCollisionRadius(nameForLabel);
    const liftedSize = Math.max(n.size ?? 16, Math.ceil(2 * collisionRadius));
    return { ...n, nameForLabel, collisionRadius, size: liftedSize };
  });
}
