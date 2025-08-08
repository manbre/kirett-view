import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { labelTextureMap } from "@/constants/label";
import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";

const TexturedMaterial = ({
  url,
  hovered,
  isHighlighted,
}: {
  url: string;
  hovered: boolean;
  isHighlighted: boolean;
}) => {
  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <meshBasicMaterial
      map={texture}
      color={isHighlighted ? "blue" : hovered ? "cyan" : "gray"}
      transparent
      depthTest={false}
      toneMapped={false}
    />
  );
};

type CustomNodeProps = {
  node: any;
  isHighlighted?: boolean;
};

export function CustomNode({ node, isHighlighted = false }: CustomNodeProps) {
  const [hovered, setHovered] = useState(false);

  const label = node.data?.labels?.[0];
  const name = node.data?.Name ?? node.data?.BPR ?? "Unnamed";
  const svgUrl = labelTextureMap[label] || "/icons/default.svg";

  const dataUrl = useWhiteSvgTexture(svgUrl);

  if (!dataUrl) return null;

  return dataUrl ? (
    <group
      position={[0, 0, 0.1]}
      renderOrder={10}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0, 0.01]} renderOrder={1}>
        <circleGeometry args={[8, 32]} />
        <Suspense fallback={null}>
          <TexturedMaterial
            url={dataUrl}
            hovered={hovered}
            isHighlighted={isHighlighted}
          />
        </Suspense>
      </mesh>
      <Text
        position={[0, -8, 0]}
        fontSize={5}
        maxWidth={45}
        textAlign="center"
        anchorX="center"
        anchorY="start"
        color={hovered ? "cyan" : "#333"}
      >
        {name}
      </Text>
    </group>
  ) : null;
}
