import { useEffect, useState } from "react";

export const useWhiteSvgTexture = (svgUrl: string) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!svgUrl) return;

    fetch(svgUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const whiteSvg = svgText
          .replace(/fill="[^"]*"/g, 'fill="#ffffff"')
          .replace(/<svg([^>]*)fill="[^"]*"/, "<svg$1");

        const base64 = btoa(unescape(encodeURIComponent(whiteSvg)));
        setDataUrl(`data:image/svg+xml;base64,${base64}`);
      });
  }, [svgUrl]);

  return dataUrl;
};
