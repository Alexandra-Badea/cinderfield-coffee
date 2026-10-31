import "server-only";
import { products as seedProducts } from "@/data/products";
import { discountCodes as seedCodes } from "@/data/reviews";
import { hasSupabase } from "./config";
import { userClient } from "./supabase/clients";
import { toDiscount, toOrder, toProduct, type DiscountRow, type OrderRow, type ProductRow } from "./supabase/map";
import type { DiscountCode, Order, Product } from "./types";

export type AdminData =
  | { ok: true; live: boolean; orders: Order[] | null; products: Product[]; codes: DiscountCode[] }
  | { ok: false; reason: "signin" | "forbidden" };

/**
 * Everything the admin pages need. Live: read as the signed-in user, so Row Level Security
 * only returns data if they're an admin. Without a database: the built-in catalogue, and orders generated in the browser.
 */
export async function loadAdmin(): Promise<AdminData> {
  if (!hasSupabase) return { ok: true, live: false, orders: null, products: seedProducts, codes: seedCodes };
  const supabase = await userClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "signin" };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (profile?.role !== "admin") return { ok: false, reason: "forbidden" };
  const [orders, products, codes] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").neq("status", "pending").order("created_at", { ascending: false }).limit(500),
    supabase.from("products").select("*").order("name"),
    supabase.from("discount_codes").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    ok: true,
    live: true,
    orders: ((orders.data ?? []) as OrderRow[]).map(toOrder),
    products: ((products.data ?? []) as ProductRow[]).map(toProduct),
    codes: ((codes.data ?? []) as DiscountRow[]).map(toDiscount),
  };
}
