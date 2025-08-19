import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KIRETTview",
  description: "Knowledge graph viewer for KIRETT",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-[100dvh] bg-[var(--back)] text-[clamp(0.95rem,1vw+0.2rem,1.05rem)] text-[var(--text)] antialiased md:text-base`}
      >
        {children}
      </body>
    </html>
  );
}
