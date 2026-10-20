import type { MetadataRoute } from "next";
import { citySlug, ncCities, siteUrl } from "@/config/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/how-it-works", "/pricing", "/work", "/faq", "/contact", "/free-preview", "/terms", "/privacy"];
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7 })),
    ...ncCities.map((c) => ({ url: `${siteUrl}/web-design/${citySlug(c)}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
