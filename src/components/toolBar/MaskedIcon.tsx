"use client";

type Props = { src: string; className?: string };

//
// renders a monochrome SVG by applying it as a CSS mask
export function MaskedIcon({ src, className = "w-5 h-5" }: Props) {
  if (!src) return <span className={`inline-block ${className}`} />;

  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-current ${className}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}
