import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { products as seedProducts } from "@/data/products";
import { discountCodes as seedCodes, reviews as seedReviews } from "@/data/reviews";
import { hasSupabase } from "./config";
import { publicClient, serviceClient } from "./supabase/clients";
import { toDiscount, toProduct, toReview, type DiscountRow, type ProductRow, type ReviewRow } from "./supabase/map";
import type { DiscountCode, Product, Review } from "./types";

/** Every active coffee. Cached for an hour and refreshed straight away when the admin edits a product. */
export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");
  if (!hasSupabase) return seedProducts.filter((p) => p.active);
  const { data, error } = await publicClient().from("products").select("*").eq("active", true).order("featured", { ascending: false }).order("name");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as ProductRow[]).map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getReviews(): Promise<Review[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("reviews");
  if (!hasSupabase) return seedReviews;
  const { data, error } = await publicClient().from("reviews").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load reviews: ${error.message}`);
  return (data as ReviewRow[]).map(toReview);
}

export type Rating = { average: number; count: number };

export async function getRatings(): Promise<Record<string, Rating>> {
  const all = await getReviews();
  const out: Record<string, Rating> = {};
  for (const r of all) {
    const cur = out[r.productId] ?? { average: 0, count: 0 };
    out[r.productId] = { average: (cur.average * cur.count + r.rating) / (cur.count + 1), count: cur.count + 1 };
  }
  return out;
}

/** Looks up a discount code. Codes are not public, so in live mode this uses the service role on the server. */
export async function findDiscount(raw: string): Promise<DiscountCode | null> {
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  if (!hasSupabase) return seedCodes.find((c) => c.code === code) ?? null;
  const { data } = await serviceClient().from("discount_codes").select("*").eq("code", code).maybeSingle();
  return data ? toDiscount(data as DiscountRow) : null;
}
