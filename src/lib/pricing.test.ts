import { describe, expect, it } from "vitest";
import { formatGBP, lineKey, totals, unitPrice } from "./pricing";
import type { CartLine, DiscountCode } from "./types";

const products = new Map([
  ["a", { price250: 950, price1kg: 3000 }],
  ["b", { price250: 1300, price1kg: 4200 }],
]);
const line = (over: Partial<CartLine> = {}): CartLine => ({ productId: "a", slug: "a", name: "A", size: "250g", grind: "whole", qty: 1, ...over });
const code = (over: Partial<DiscountCode>): DiscountCode => ({ code: "X", kind: "percent", value: 10, minSubtotal: 0, active: true, description: "", ...over });

describe("unitPrice", () => {
  it("uses the price for the size", () => {
    expect(unitPrice({ price250: 950, price1kg: 3000 }, "250g")).toBe(950);
    expect(unitPrice({ price250: 950, price1kg: 3000 }, "1kg")).toBe(3000);
  });
  it("takes 10% off subscriptions, rounded to 5p", () => {
    expect(unitPrice({ price250: 950, price1kg: 3000 }, "250g", true)).toBe(855);
    expect(unitPrice({ price250: 1300, price1kg: 4200 }, "250g", true)).toBe(1170);
  });
});

describe("totals", () => {
  it("adds up lines and charges standard delivery under the threshold", () => {
    const t = totals([line({ qty: 2 })], products);
    expect(t.subtotal).toBe(1900);
    expect(t.shipping).toBe(395);
    expect(t.total).toBe(2295);
    expect(t.freeShippingGap).toBe(1600);
  });
  it("makes standard delivery free from £35", () => {
    const t = totals([line({ size: "1kg" }), line({ productId: "b" })], products);
    expect(t.subtotal).toBe(4300);
    expect(t.shipping).toBe(0);
    expect(t.freeShippingGap).toBe(0);
  });
  it("always charges for express", () => {
    expect(totals([line({ size: "1kg", qty: 2 })], products, "express").shipping).toBe(695);
  });
  it("gives subscriptions free standard delivery", () => {
    const t = totals([line({ every: 4 })], products);
    expect(t.subtotal).toBe(855);
    expect(t.shipping).toBe(0);
  });
  it("applies percentage and fixed discounts", () => {
    expect(totals([line({ qty: 4 })], products, "standard", code({ value: 10 })).discount).toBe(380);
    expect(totals([line({ qty: 4 })], products, "standard", code({ kind: "amount", value: 500 })).total).toBe(3800 - 500);
  });
  it("never discounts more than the subtotal", () => {
    expect(totals([line()], products, "standard", code({ kind: "amount", value: 5000 })).discount).toBe(950);
  });
  it("refuses a code below its minimum spend", () => {
    const t = totals([line()], products, "standard", code({ kind: "amount", value: 500, minSubtotal: 3000 }));
    expect(t.code).toBeNull();
    expect(t.discount).toBe(0);
    expect(t.codeError).toMatch(/at least £30/);
  });
  it("refuses an expired code", () => {
    expect(totals([line()], products, "standard", code({ active: false })).codeError).toMatch(/expired/);
  });
  it("makes standard delivery free with a free-shipping code, and takes it off express", () => {
    const free = code({ kind: "shipping", value: 0 });
    expect(totals([line()], products, "standard", free).shipping).toBe(0);
    expect(totals([line()], products, "express", free).shipping).toBe(300);
  });
  it("ignores coffees that aren't in the catalogue", () => {
    expect(totals([line({ productId: "gone" })], products).lines).toHaveLength(0);
  });
});

describe("helpers", () => {
  it("formats pounds", () => {
    expect(formatGBP(950)).toBe("£9.50");
    expect(formatGBP(3000)).toBe("£30");
  });
  it("gives the same key to the same choice, and a different one to a subscription", () => {
    expect(lineKey(line())).toBe(lineKey(line({ qty: 3 })));
    expect(lineKey(line())).not.toBe(lineKey(line({ every: 2 })));
  });
});
