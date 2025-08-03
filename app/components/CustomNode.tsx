import React, { useState, Suspense } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { labelTextureMap } from "@/constants/label";
import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";

const TexturedMaterial = ({
  url,
  hovered,
}: {
  url: string;
  hovered: boolean;
}) => {
  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <meshBasicMaterial
      map={texture}
      color={hovered ? "cyan" : "gray"}
      transparent
      depthTest={false}
      toneMapped={false}
    />
  );
};

export function CustomNode({ node }) {
  const [hovered, setHovered] = useState(false);

  const label = node.data?.labels?.[0];
  const svgUrl = labelTextureMap[label] || "/icons/default.svg";

  const dataUrl = useWhiteSvgTexture(svgUrl);

  if (!dataUrl) return null;

  return (
    <mesh
      position={[0, 0, 0.01]}
      renderOrder={1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <circleGeometry args={[8, 32]} />
      {dataUrl ? (
        <Suspense fallback={null}>
          <TexturedMaterial url={dataUrl} hovered={hovered} />
        </Suspense>
      ) : (
        <meshBasicMaterial
          color="gray"
          transparent
          opacity={0.8}
          depthTest={false}
          toneMapped={false}
        />
      )}
    </mesh>
  );
}
