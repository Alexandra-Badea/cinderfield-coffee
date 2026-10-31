"use server";

import { updateTag } from "next/cache";
import { hasSupabase } from "@/lib/config";
import { userClient } from "@/lib/supabase/clients";
import type { DiscountCode, OrderStatus } from "@/lib/types";

export type Result = { ok: true; demo?: boolean } | { ok: false; error: string };

const statuses: OrderStatus[] = ["paid", "roasting", "shipped", "delivered", "cancelled"];

/*
 * Admin changes. Without a database they aren't saved on the server (the admin page keeps them in the browser).
 * Live, they run as the signed-in user, so the database refuses anyone who isn't an admin.
 */

async function run(fn: (db: Awaited<ReturnType<typeof userClient>>) => PromiseLike<{ error: { message: string } | null; count?: number | null }>): Promise<Result> {
  if (!hasSupabase) return { ok: true, demo: true };
  const db = await userClient();
  const { error, count } = await fn(db);
  if (error) return { ok: false, error: error.message };
  if (count === 0) return { ok: false, error: "Not saved: only admins can do that." };
  return { ok: true };
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<Result> {
  if (!statuses.includes(status)) return { ok: false, error: "Unknown status." };
  return run((db) => db.from("orders").update({ status }, { count: "exact" }).eq("id", id));
}

export type ProductPatch = { price250: number; price1kg: number; stock: number; active: boolean; featured: boolean };

export async function saveProduct(id: string, p: ProductPatch): Promise<Result> {
  const whole = (n: number) => Number.isInteger(n) && n >= 0;
  if (!whole(p.price250) || !whole(p.price1kg) || p.price250 === 0 || p.price1kg === 0) return { ok: false, error: "Prices must be above zero." };
  if (!whole(p.stock)) return { ok: false, error: "Stock must be a whole number." };
  const result = await run((db) =>
    db.from("products").update({ price_250: p.price250, price_1kg: p.price1kg, stock: p.stock, active: p.active, featured: p.featured }, { count: "exact" }).eq("id", id),
  );
  if (result.ok && !result.demo) updateTag("products");
  return result;
}

export async function createCode(c: DiscountCode): Promise<Result> {
  const code = c.code.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,24}$/.test(code)) return { ok: false, error: "Codes are 3 to 24 letters or numbers." };
  if (!["percent", "amount", "shipping"].includes(c.kind)) return { ok: false, error: "Choose a discount type." };
  if (c.kind === "percent" && !(c.value >= 1 && c.value <= 100)) return { ok: false, error: "Percent must be between 1 and 100." };
  if (c.kind === "amount" && !(c.value > 0)) return { ok: false, error: "Enter an amount off." };
  return run((db) =>
    db.from("discount_codes").insert({ code, kind: c.kind, value: c.kind === "shipping" ? 0 : c.value, min_subtotal: c.minSubtotal, active: true, description: c.description }, { count: "exact" }),
  );
}

export async function setCodeActive(code: string, active: boolean): Promise<Result> {
  return run((db) => db.from("discount_codes").update({ active }, { count: "exact" }).eq("code", code));
}
