import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { brand, siteUrl } from "@/config/brand";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });

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
  themeColor: "#090a09",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
