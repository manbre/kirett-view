import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { labelTextureMap } from "@/constants/label";
import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";

export const CustomNode = ({ node }) => {
  const [hovered, setHovered] = useState(false);

  const label = node.data?.labels?.[0];
  const name = node.data?.Name ?? node.data?.BPR ?? "Unnamed";
  const svgUrl = labelTextureMap?.[label] ?? "/icons/default.svg";
  const dataUrl = useWhiteSvgTexture(svgUrl);

  const TexturedMaterial = ({
    url,
    hovered,
  }: {
    url: string;
    hovered: boolean;
  }) => {
    const texture = useLoader(THREE.TextureLoader, url);

    // safeguard: don't apply texture if loading failed
    if (!texture) return null;

    // increase sharpness on flat angles
    texture.anisotropy = 16;
    // reduce blurriness in downscaling
    texture.minFilter = THREE.LinearFilter;
    // reduce blurriness in upscaling
    texture.magFilter = THREE.NearestFilter;

    return (
      <meshBasicMaterial
        map={texture}
        color={hovered ? "cyan" : "gray"}
        transparent
        // always render on top
        depthTest={false}
        // preserve original color
        toneMapped={false}
      />
    );
  };

  return dataUrl ? (
    <group
      position={[0, 0, 0.1]} // Z leicht über 0
      renderOrder={10}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh position={[0, 0, 0.01]} renderOrder={1}>
        <circleGeometry args={[8, 32]} />
        <Suspense fallback={null}>
          <TexturedMaterial url={dataUrl} hovered={hovered} />
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
};
