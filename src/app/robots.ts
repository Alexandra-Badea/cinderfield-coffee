import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // The private pages never belong in search results. (The whole demo is also marked noindex in the layout;
    // remove that line for a real shop.)
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/cart", "/checkout", "/api", "/auth"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
