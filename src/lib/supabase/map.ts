import type { DiscountCode, Order, OrderLine, Product, Review } from "../types";

/* Database rows use snake_case; the app uses camelCase. These keep the two in step. */

export type ProductRow = {
  id: string; slug: string; name: string; origin: string; region: string; process: Product["process"];
  roast: Product["roast"]; roast_level: number; altitude: string; varietal: string; notes: string[];
  flavour: Product["flavour"]; best_for: Product["bestFor"]; tagline: string; description: string;
  price_250: number; price_1kg: number; stock: number; featured: boolean; is_new: boolean; decaf: boolean;
  art: Product["art"]; active: boolean;
};

export const toProduct = (r: ProductRow): Product => ({
  id: r.id, slug: r.slug, name: r.name, origin: r.origin, region: r.region, process: r.process, roast: r.roast,
  roastLevel: r.roast_level, altitude: r.altitude, varietal: r.varietal, notes: r.notes, flavour: r.flavour,
  bestFor: r.best_for, tagline: r.tagline, description: r.description, price250: r.price_250, price1kg: r.price_1kg,
  stock: r.stock, featured: r.featured, isNew: r.is_new, decaf: r.decaf, art: r.art, active: r.active,
});

export type ReviewRow = { id: string; product_id: string; author_name: string; rating: number; body: string; created_at: string };
export const toReview = (r: ReviewRow): Review => ({
  id: r.id, productId: r.product_id, author: r.author_name, rating: r.rating, body: r.body, createdAt: r.created_at,
});

export type DiscountRow = { code: string; kind: DiscountCode["kind"]; value: number; min_subtotal: number; active: boolean; description: string };
export const toDiscount = (r: DiscountRow): DiscountCode => ({
  code: r.code, kind: r.kind, value: r.value, minSubtotal: r.min_subtotal, active: r.active, description: r.description,
});

export type OrderItemRow = { product_id: string; name: string; size: OrderLine["size"]; grind: OrderLine["grind"]; qty: number; unit_price: number; every: number | null };
export type OrderRow = {
  id: string; number: number; created_at: string; email: string | null; name: string | null; address: Order["address"];
  shipping_method: Order["shippingMethod"]; subtotal: number; discount: number; shipping: number; total: number;
  code: string | null; status: Order["status"]; order_items?: OrderItemRow[];
};
export const toOrder = (r: OrderRow): Order => ({
  id: r.id, number: r.number, createdAt: r.created_at, email: r.email ?? "", name: r.name ?? "", address: r.address,
  shippingMethod: r.shipping_method, subtotal: r.subtotal, discount: r.discount, shipping: r.shipping, total: r.total,
  code: r.code, status: r.status,
  lines: (r.order_items ?? []).map((i) => ({
    productId: i.product_id, name: i.name, size: i.size, grind: i.grind, qty: i.qty, unitPrice: i.unit_price,
    every: (i.every ?? undefined) as OrderLine["every"],
  })),
});
