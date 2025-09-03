"use client";

import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";

type Props = { src: string; className?: string };

export function MaskedIcon({ src, className = "w-5 h-5" }: Props) {
  const maskUrl = useWhiteSvgTexture(src);
  if (!maskUrl) return <span className={`inline-block ${className}`} />;

  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${maskUrl})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${maskUrl})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}
