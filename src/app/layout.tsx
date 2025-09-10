import type { Metadata } from "next";
import "./globals.css";
import { tokens } from "@/theme/tokens";
import type React from "react";

export const metadata: Metadata = {
  title: "KIRETTview",
  description: "Knowledge graph viewer for KIRETT",
};

const cssVars = `
:root{
  --color-bg:${tokens.bg};
  --color-text:${tokens.text};
  --color-border:${tokens.border};
  --color-mark:${tokens.mark};
  --color-edge:${tokens.edge};
  --color-node:${tokens.node};
}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="h-full">
      <head>
        <style>{cssVars}</style>
      </head>
      <body className="min-h-[100dvh] bg-[var(--color-bg)] text-[clamp(0.95rem,1vw+0.2rem,1.05rem)] text-[var(--color-text)] antialiased md:text-base">
        {children}
      </body>
    </html>
  );
}
// Root layout: injects CSS variables for theme tokens and wraps the app
