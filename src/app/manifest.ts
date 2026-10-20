import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

// Lets Acen install the CRM on a phone's home screen (spec Section 18).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} CRM`,
    short_name: `${brand.shortName} CRM`,
    description: "Run the agency from anywhere.",
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090a09",
    theme_color: "#090a09",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Inbox", url: "/admin/inbox" },
      { name: "Call Queue", url: "/admin/calls" },
    ],
  };
}
