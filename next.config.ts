import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // SVG-Dateien mit @svgr/webpack laden, als JavaScript/React-Komponente
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true, // optional: SVG als Icon optimieren
            },
          },
        ],
        as: "*.js", // Behandlung als JS-Modul
      },
    },
  },
};

export default nextConfig;
