import type { MetadataRoute } from "next";
import { BRAND } from "@/constants";
import { createSeedDatabase } from "@/mock/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const db = createSeedDatabase();
  const base = BRAND.domain;
  const staticRoutes = [
    "",
    "/vehicles",
    "/girne",
    "/campaigns",
    "/blog",
    "/about",
    "/contact",
    "/faq",
    "/terms",
    "/privacy",
    "/cookies",
    "/compare",
    "/booking",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-07-22"),
    changeFrequency: "weekly" as const,
    priority: path === "" || path === "/girne" ? 1 : 0.7,
  }));

  const vehicles = db.vehicles.map((v) => ({
    url: `${base}/vehicles/${v.slug}`,
    lastModified: new Date(v.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const posts = db.blogPosts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...vehicles, ...posts];
}
