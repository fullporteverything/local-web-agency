import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { brand, siteUrl } from "@/config/brand";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | Websites for local businesses`,
    template: `%s | ${brand.name}`,
  },
  description: `${brand.name} builds simple, good-looking websites for small local businesses. We build a free preview first, you pay only if you like it.`,
  openGraph: { siteName: brand.name, type: "website", locale: "en_US" },
};

export const viewport: Viewport = {
  themeColor: "#1f4d36",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
