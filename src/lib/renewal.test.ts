import { describe, expect, it } from "vitest";
import { renewalFrom, type OrderItemRow, type OriginalOrder } from "./renewal";

const original: OriginalOrder = {
  user_id: "u1",
  email: "ann@example.com",
  name: "Ann",
  address: { line1: "1 Mill Lane", city: "Bristol", postcode: "BS1 1AA", country: "GB" },
  shipping_method: "standard",
  stripe_subscription: "sub_1",
};
const item = (over: Partial<OrderItemRow>): OrderItemRow => ({ product_id: "p-guji", name: "Guji Natural", size: "250g", grind: "filter", qty: 1, unit_price: 1170, every: 4, ...over });

describe("subscription renewals", () => {
  it("repeats only the subscribed bags, delivered free, at what Stripe charged", () => {
    const r = renewalFrom(original, [item({ qty: 2 }), item({ product_id: "p-konga", name: "Yirgacheffe Konga", every: null, unit_price: 1200 })], 2340, "2026-11-28T09:00:00Z")!;
    expect(r.items).toHaveLength(1);
    expect(r.items[0]).toMatchObject({ product_id: "p-guji", qty: 2, every: 4 });
    expect(r.order).toMatchObject({ subtotal: 2340, shipping: 0, discount: 0, total: 2340, status: "paid", user_id: "u1", stripe_subscription: "sub_1" });
    expect(r.order.address?.city).toBe("Bristol");
  });

  it("records any difference Stripe applied as a discount", () => {
    expect(renewalFrom(original, [item({})], 1000, "2026-11-28T09:00:00Z")!.order.discount).toBe(170);
  });

  it("does nothing for an order with no subscription in it", () => {
    expect(renewalFrom(original, [item({ every: null })], 1170, "2026-11-28T09:00:00Z")).toBeNull();
  });
});
