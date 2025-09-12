"use client";

import { useEffect, useState } from "react";

//
// fetches an SVG and normalizes it to white-only for tinting
export function useWhiteSvgTexture(svgUrl: string | null) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!svgUrl) {
      setDataUrl(null);
      return;
    }

    let cancelled = false;

    fetch(svgUrl)
      .then((r) => r.text())
      .then((txt) => {
        if (cancelled) return;

        // remove styles that could override colors/opacities
        let s = txt
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/\sstyle="[^"]*"/gi, "");

        // force fill/stroke to white (except 'none')
        s = s
          .replace(/\sfill="(?!none")[^"]*"/gi, ' fill="#fff"')
          .replace(/\sstroke="(?!none")[^"]*"/gi, ' stroke="#fff"');

        // force full opacities
        s = s
          .replace(/\sopacity="[^"]*"/gi, ' opacity="1"')
          .replace(/\sfill-opacity="[^"]*"/gi, ' fill-opacity="1"')
          .replace(/\sstroke-opacity="[^"]*"/gi, ' stroke-opacity="1"');

        // remove fill/stroke on <svg> root (children decide)
        s = s.replace(/<svg([^>]*)\s(fill|stroke)="[^"]*"/gi, "<svg$1");

        // return as UTF-8 data URL
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
        setDataUrl(url);
      })
      .catch(() => setDataUrl(svgUrl)); // fallback: original

    return () => {
      cancelled = true;
    };
  }, [svgUrl]);

  return dataUrl;
}
