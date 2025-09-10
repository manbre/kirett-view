"use client";
// CustomNode
// Renders a single graph node (icon + label) with optional collision debug
// and highlight ring when selected. Uses Drei/Text for labels and a white-
// tinted texture for icons so color can be controlled via material color.

import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { labelIconMap } from "@/constants/label"; // Record<string, string>
import { tokens } from "@/theme/tokens";
import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";
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
  id: string; // provided by parent (e.g., node.id)
  x: number; // provided by parent (e.g., node.position.x)
  y: number; // provided by parent (e.g., node.position.y)
};

// Simple textured material that tints a loaded SVG texture
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
      // Note: the texture is white, so material color tints the icon
      color={isHighlighted ? "blue" : hovered ? tokens.mark : "black"}
      transparent
      depthTest={false}
      toneMapped={false}
    />
  );
}

// Render a sized/tinted icon circle with a label underneath
export function CustomNode<T extends BaseNode>({
  node,
  isHighlighted = false,
  debugCollision = false,
  id,
  x,
  y,
}: CustomNodeProps<T>) {
  const [hovered, setHovered] = useState(false);

  // Report current node position to the store (used by SVG export)
  useReportNodePosition(id, x, y, { maxFrames: 90 });

  // Robust: labels kann fehlen/leer/null sein
  const labelKey =
    (Array.isArray(node.data?.labels) ? node.data!.labels![0] : undefined) ??
    "";
  const svgUrl = labelIconMap[labelKey] ?? "/icons/default.svg";

  // Generate white-only (tintable) SVG texture as data URL

  const dataUrl = useWhiteSvgTexture(svgUrl);
  if (!dataUrl) return null;

  // Same display name logic as label metrics
  const name = node.nameForLabel || buildDisplayName(node.data);

  return (
    <group
      position={[0, 0, 0.1]}
      renderOrder={10}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {isHighlighted && (
        <mesh position={[0, 0, 0.02]} renderOrder={5}>
          {/** Thick highlight ring around the node */}
          <ringGeometry args={[NODE_R + 2, NODE_R + 14, 64]} />
          <meshBasicMaterial
            color={tokens.mark}
            transparent
            opacity={0.4}
            depthTest={false}
          />
        </mesh>
      )}
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
