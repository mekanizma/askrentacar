import type { MetadataRoute } from "next";
import { BRAND } from "@/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api"],
    },
    sitemap: `${BRAND.domain}/sitemap.xml`,
  };
}
