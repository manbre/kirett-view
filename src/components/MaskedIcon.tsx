"use client";

import { useWhiteSvgTexture } from "@/hooks/useWhiteSvgTexture";

type Props = {
  src: string;
  className?: string; // z.B. w-5 h-5
};

export function MaskedIcon({ src, className = "w-5 h-5" }: Props) {
  const dataUrl = useWhiteSvgTexture(src);

  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${dataUrl})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${dataUrl})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}
