import { useEffect, useState } from "react";

export const useWhiteSvgTexture = (svgUrl: string) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!svgUrl) return;

    fetch(svgUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const whiteSvg = svgText.includes('fill="')
          ? svgText
              .replace(/fill="[^"]*"/g, 'fill="#ffffff"')
              .replace(/<svg([^>]*)fill="[^"]*"/, "<svg$1")
          : svgText;

        const base64 = btoa(unescape(encodeURIComponent(whiteSvg)));
        setDataUrl(`data:image/svg+xml;base64,${base64}`);
      })
      .catch((err) => {
        console.warn("⚠️ Fehler beim Laden des SVGs:", svgUrl, err);
        setDataUrl(null);
      });
  }, [svgUrl]);

  return dataUrl;
};
