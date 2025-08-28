import { buildDisplayName, calcCollisionRadius } from "./label-metrics";

// Minimale Node-Form, die wir brauchen (id, optionale Größe, optionale Daten).
export type BaseNode = {
  id: string;
  size?: number;
  data?: {
    BPR?: string | null;
    Name?: string | null;
    labels?: string[] | null;
  };
};

// Zusätzliche Felder, die wir für Simulation/Renderer ergänzen.
export type NodeCollisionExtras = {
  nameForLabel: string;
  collisionRadius: number;
};

// Ergebnis-Typ nach der Aufbereitung.
export type NodeWithCollision<T extends BaseNode = BaseNode> = T &
  NodeCollisionExtras;

/**
 * Reicht Knoten so auf, dass Simulation ihre reale Ausdehnung (Kreis + Text) kennt.
 * - baut den Anzeigetext (`nameForLabel`)
 * - berechnet den `collisionRadius`
 * - (optional) hebt `size` an, falls das Layout diese Größe nutzt
 */
export function prepareNodes<T extends BaseNode>(
  rawNodes: readonly T[],
): NodeWithCollision<T>[] {
  return rawNodes.map((n) => {
    const nameForLabel = buildDisplayName(n.data);
    const collisionRadius = calcCollisionRadius(nameForLabel);

    const liftedSize = Math.max(n.size ?? 16, Math.ceil(2 * collisionRadius));

    return {
      ...n,
      nameForLabel,
      collisionRadius,
      size: liftedSize,
    };
  });
}
