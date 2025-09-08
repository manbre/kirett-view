// src/components/CustomNode.tsx
"use client";

import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { labelIconMap, type NodeLabel } from "@/constants/label";
import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";
import { tokens } from "@/theme/tokens";
import { useReportNodePosition } from "@/hooks/useReportNodePosition";
import {
  NODE_R,
  FONT_PX,
  MAX_W,
  LABEL_Y_OFFSET,
  buildDisplayName,
} from "@/graph/label-metrics";
import type { BaseNode, NodeWithCollision } from "@/graph/prepareNodes";

type CustomNodeProps<T extends BaseNode> = {
  node: NodeWithCollision<T>;
  isHighlighted?: boolean;
  debugCollision?: boolean;
  id?: string;
  x?: number;
  y?: number;
};

function TexturedMaterial({
  url,
  hovered,
  isHighlighted,
}: {
  url: string;
  hovered: boolean;
  isHighlighted: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <meshBasicMaterial
      map={texture}
      color={isHighlighted ? "blue" : hovered ? tokens.mark : "black"}
      transparent
      depthTest={false}
      toneMapped={false}
    />
  );
}

export function CustomNode<T extends BaseNode>({
  node,
  isHighlighted = false,
  debugCollision = false,
  id,
  x,
  y,
}: CustomNodeProps<T>) {
  const [hovered, setHovered] = useState(false);

  // PRIO der Quellen:
  // 1) node.position.x/y (reagraph interner Zustand)
  // 2) node.x/y (falls von lib gesetzt)
  // 3) Props x/y (Fallback)
  const raw: any = node as any;
  const nx =
    (raw?.position?.x as number | undefined) ??
    (raw?.x as number | undefined) ??
    x;
  const ny =
    (raw?.position?.y as number | undefined) ??
    (raw?.y as number | undefined) ??
    y;

  const nodeId = (id ?? node.id) as string;

  // An den Store melden, sobald endlich → Export kann posMap nutzen
  useReportNodePosition(nodeId, nx, ny, { maxFrames: 90 });

  // Icon-Key wie im Export
  const dataLabels = Array.isArray((node.data as any)?.labels)
    ? ((node.data as any).labels as string[])
    : [];
  const iconKey =
    (dataLabels[0] as NodeLabel | undefined) ??
    (node.label as NodeLabel | undefined);
  const svgUrl =
    iconKey && labelIconMap[iconKey]
      ? labelIconMap[iconKey]
      : "/icons/default.svg";

  const dataUrl = useWhiteSvgTexture(svgUrl);
  if (!dataUrl) return null;

  const name = (node as any).nameForLabel || buildDisplayName(node.data);

  return (
    <group
      position={[0, 0, 0.1]}
      renderOrder={10}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {debugCollision && (
        <mesh position={[0, 0, 0]}>
          <circleGeometry args={[node.collisionRadius, 64]} />
          <meshBasicMaterial
            color={tokens.node}
            transparent
            opacity={0.05}
            depthTest={false}
          />
        </mesh>
      )}

      <mesh position={[0, 0, 0.01]} renderOrder={1}>
        <circleGeometry args={[NODE_R, 32]} />
        <Suspense fallback={null}>
          <TexturedMaterial
            url={dataUrl}
            hovered={hovered}
            isHighlighted={isHighlighted}
          />
        </Suspense>
      </mesh>

      <Text
        position={[0, -LABEL_Y_OFFSET, 0]}
        fontSize={FONT_PX}
        maxWidth={MAX_W}
        textAlign="center"
        anchorX="center"
        anchorY="start"
        color={hovered ? tokens.mark : tokens.node}
      >
        {name}
      </Text>
    </group>
  );
}
