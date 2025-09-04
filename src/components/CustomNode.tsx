import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { labelIconMap } from "@/constants/label"; // Record<string, string>
import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";
import { tokens } from "@/theme/tokens";
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
  debugCollision?: boolean; // optional: zeigt Kollisionskreis
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
      color={isHighlighted ? "blue" : hovered ? tokens.mark : "grey"}
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
}: CustomNodeProps<T>) {
  const [hovered, setHovered] = useState<boolean>(false);

  const labelKey = node.data?.labels?.[0] ?? "";
  const svgUrl = labelIconMap[labelKey] ?? "/icons/default.svg";
  const dataUrl = useWhiteSvgTexture(svgUrl);
  if (!dataUrl) return null;

  // exakt derselbe Text wie beim Vorbereiten
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
