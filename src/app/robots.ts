import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // The private pages never belong in search results. (Until real payments are on, the layout also marks every page noindex.)
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/cart", "/checkout", "/api", "/auth"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
