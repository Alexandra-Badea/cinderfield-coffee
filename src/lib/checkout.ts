import "server-only";
import { findDiscount, getProducts } from "./catalog";
import { grinds, sizes } from "./config";
import { totals, type Totals } from "./pricing";
import type { Address, CartLine, Product, ShippingMethod } from "./types";

export type CheckoutRequest = {
  lines: CartLine[];
  code?: string;
  method?: ShippingMethod;
  customer?: { email: string; name: string; address: Address };
};

export type Priced = { totals: Totals; products: Map<string, Product>; method: ShippingMethod };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Checks a cart sent from the browser and prices it from the catalogue.
 * Never trusts prices or names from the browser: only which coffee, size, grind, plan and how many.
 */
export async function priceCart(body: CheckoutRequest): Promise<Priced | { error: string }> {
  if (!Array.isArray(body.lines) || body.lines.length === 0) return { error: "Your bag is empty." };
  if (body.lines.length > 30) return { error: "That's a lot of coffee! Please contact us for wholesale orders." };
  const catalogue = await getProducts();
  const products = new Map(catalogue.map((p) => [p.id, p]));

  const lines: CartLine[] = [];
  for (const raw of body.lines) {
    const product = products.get(String(raw.productId));
    if (!product) return { error: "One of the coffees in your bag isn't available any more." };
    const qty = Math.floor(Number(raw.qty));
    if (!(qty >= 1 && qty <= 50)) return { error: "Please check the quantities in your bag." };
    if (!(raw.size in sizes) || !(raw.grind in grinds)) return { error: "Please check the options in your bag." };
    if (raw.every !== undefined && raw.every !== 2 && raw.every !== 4) return { error: "Please check your subscription options." };
    if (qty > product.stock) return { error: `We only have ${product.stock} bags of ${product.name} left. Please lower the quantity.` };
    lines.push({ productId: product.id, slug: product.slug, name: product.name, size: raw.size, grind: raw.grind, qty, every: raw.every });
  }

  // the same coffee in several lines still has to fit the stock
  const perProduct = new Map<string, number>();
  for (const l of lines) perProduct.set(l.productId, (perProduct.get(l.productId) ?? 0) + l.qty);
  for (const [id, n] of perProduct) {
    const p = products.get(id)!;
    if (n > p.stock) return { error: `We only have ${p.stock} bags of ${p.name} left.` };
  }

  const method: ShippingMethod = body.method === "express" ? "express" : "standard";
  const code = body.code ? await findDiscount(body.code) : null;
  const t = totals(lines, products, method, code);
  if (body.code && !t.code) return { error: t.codeError ?? "We don't recognise that discount code." };
  return { totals: t, products, method };
}

export function validCustomer(c: CheckoutRequest["customer"]): string | null {
  if (!c) return "Please fill in your details.";
  if (!EMAIL.test(c.email ?? "")) return "Please enter a valid email address.";
  if (!c.name?.trim()) return "Please enter your name.";
  if (!c.address?.line1?.trim() || !c.address?.city?.trim() || !c.address?.postcode?.trim()) return "Please complete your delivery address.";
  return null;
}
