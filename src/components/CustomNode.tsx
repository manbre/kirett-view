"use client";

import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { labelIconMap } from "@/constants/label"; // Record<string, string>
import { tokens } from "@/theme/tokens";
import { useReportNodePosition } from "@/hooks/useReportNodePosition";

import {
  NODE_R,
  FONT_PX,
  MAX_W,
  LABEL_Y_OFFSET,
  buildDisplayName,
} from "@/graphUtils/labelMetrics";
import type { BaseNode, NodeWithCollision } from "@/graphUtils/prepareNodes";

type CustomNodeProps<T extends BaseNode> = {
  node: NodeWithCollision<T>;
  isHighlighted?: boolean;
  debugCollision?: boolean;
  id: string; // vom Parent übergeben (z. B. node.id)
  x: number; // vom Parent übergeben (z. B. node.position.x)
  y: number; // vom Parent übergeben (z. B. node.position.y)
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
      // Hinweis: Weil die Texture weiß ist, färbt die color hier den Icon-Ton.
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

  // Positionen an den Store melden (damit der SVG-Export sie bekommt)
  useReportNodePosition(id, x, y, { maxFrames: 90 });

  // Robust: labels kann fehlen/leer/null sein
  const labelKey =
    (Array.isArray(node.data?.labels) ? node.data!.labels![0] : undefined) ??
    "";
  const svgUrl = labelIconMap[labelKey] ?? "/icons/default.svg";

  // In Weiß gerenderte (färbbare) Textur als Data-URL

  if (!svgUrl) return null;

  // Exakt derselbe Text wie im Label-Metrics
  const name = node.nameForLabel || buildDisplayName(node.data);

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
            url={svgUrl}
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
