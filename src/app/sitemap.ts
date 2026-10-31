import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/shop", "/subscriptions", "/finder", "/brew-guides", "/shipping", "/privacy", "/terms"];
  const products = await getProducts();
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...products.filter((p) => p.active).map((p) => ({ url: `${siteUrl}/coffee/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
