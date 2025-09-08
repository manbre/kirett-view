"use client";

import { useEffect, useState } from "react";

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

        // 1) Styles entfernen (könnten Farben/Opazitäten setzen)
        let s = txt
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/\sstyle="[^"]*"/gi, "");

        // 2) fill/stroke auf Weiß setzen (außer 'none')
        s = s
          .replace(/\sfill="(?!none")[^"]*"/gi, ' fill="#fff"')
          .replace(/\sstroke="(?!none")[^"]*"/gi, ' stroke="#fff"');

        // 3) Opazitäten erzwingen
        s = s
          .replace(/\sopacity="[^"]*"/gi, ' opacity="1"')
          .replace(/\sfill-opacity="[^"]*"/gi, ' fill-opacity="1"')
          .replace(/\sstroke-opacity="[^"]*"/gi, ' stroke-opacity="1"');

        // 4) evtl. fill/stroke am <svg>-Root entfernen (Kinder regeln)
        s = s.replace(/<svg([^>]*)\s(fill|stroke)="[^"]*"/gi, "<svg$1");

        // 5) als Data-URL (utf-8) zurückgeben
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
        setDataUrl(url);
      })
      .catch(() => setDataUrl(svgUrl)); // Fallback: Original

    return () => {
      cancelled = true;
    };
  }, [svgUrl]);

  return dataUrl;
}
