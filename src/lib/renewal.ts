import type { Address, ShippingMethod } from "./types";

export type OrderItemRow = { product_id: string | null; name: string; size: string; grind: string; qty: number; unit_price: number; every: number | null };
export type OriginalOrder = { user_id: string | null; email: string | null; name: string | null; address: Address | null; shipping_method: ShippingMethod; stripe_subscription: string | null };

/**
 * The order for one subscription renewal: the subscribed bags from the first order, delivered free,
 * at the amount Stripe actually charged. One-off bags from the first order aren't repeated.
 */
export function renewalFrom(original: OriginalOrder, items: OrderItemRow[], amountPaid: number, paidAt: string) {
  const subscribed = items.filter((i) => i.every);
  if (subscribed.length === 0) return null;
  const subtotal = subscribed.reduce((s, i) => s + i.unit_price * i.qty, 0);
  return {
    order: {
      user_id: original.user_id,
      email: original.email,
      name: original.name,
      address: original.address,
      shipping_method: original.shipping_method,
      subtotal,
      discount: Math.max(0, subtotal - amountPaid),
      shipping: 0,
      total: amountPaid,
      code: null,
      status: "paid" as const,
      stripe_subscription: original.stripe_subscription,
      paid_at: paidAt,
    },
    items: subscribed.map(({ product_id, name, size, grind, qty, unit_price, every }) => ({ product_id, name, size, grind, qty, unit_price, every })),
  };
}
