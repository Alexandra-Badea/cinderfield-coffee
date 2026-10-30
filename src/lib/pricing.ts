import { shipping as shippingRates, shop } from "./config";
import type { CartLine, DiscountCode, Product, ShippingMethod, Size } from "./types";

/** Price of one bag, in pence. Subscriptions get the subscription discount, rounded to the nearest 5p. */
export function unitPrice(product: Pick<Product, "price250" | "price1kg">, size: Size, subscribe = false) {
  const base = size === "1kg" ? product.price1kg : product.price250;
  if (!subscribe) return base;
  return Math.round((base * (100 - shop.subscriptionDiscount)) / 100 / 5) * 5;
}

export type PricedLine = CartLine & { unitPrice: number; lineTotal: number };

export type Totals = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  freeShippingGap: number;
  code: DiscountCode | null;
  codeError: string | null;
};

export function priceLines(lines: CartLine[], products: Map<string, Pick<Product, "price250" | "price1kg">>): PricedLine[] {
  return lines.flatMap((line) => {
    const product = products.get(line.productId);
    if (!product || line.qty < 1) return [];
    const price = unitPrice(product, line.size, Boolean(line.every));
    return [{ ...line, unitPrice: price, lineTotal: price * line.qty }];
  });
}

/**
 * Totals for a cart. Used by the cart in the browser and again on the server at checkout,
 * so the price someone sees is the price they pay, and nobody can change it in the browser.
 */
export function totals(
  lines: CartLine[],
  products: Map<string, Pick<Product, "price250" | "price1kg">>,
  method: ShippingMethod = "standard",
  code: DiscountCode | null = null,
): Totals {
  const priced = priceLines(lines, products);
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const hasSubscription = priced.some((l) => l.every);

  let codeError: string | null = null;
  let applied: DiscountCode | null = null;
  if (code) {
    if (!code.active) codeError = "That code has expired.";
    else if (subtotal < code.minSubtotal) codeError = `That code needs an order of at least ${formatGBP(code.minSubtotal)}.`;
    else applied = code;
  }

  // Standard delivery is free over the threshold, and always free for subscriptions
  const freeStandard = subtotal >= shop.freeShippingFrom || hasSubscription || applied?.kind === "shipping";
  let ship = priced.length === 0 ? 0 : shippingRates[method].price;
  if (method === "standard" && freeStandard) ship = 0;
  if (method === "express" && applied?.kind === "shipping") ship = shippingRates.express.price - shippingRates.standard.price;

  let discount = 0;
  if (applied?.kind === "percent") discount = Math.round((subtotal * applied.value) / 100);
  if (applied?.kind === "amount") discount = Math.min(applied.value, subtotal);

  return {
    lines: priced,
    subtotal,
    discount,
    shipping: ship,
    total: Math.max(0, subtotal - discount + ship),
    freeShippingGap: hasSubscription ? 0 : Math.max(0, shop.freeShippingFrom - subtotal),
    code: applied,
    codeError,
  };
}

export function formatGBP(pence: number) {
  const pounds = pence / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: pence % 100 === 0 ? 0 : 2,
  }).format(pounds);
}

/** A stable key for a cart line: the same coffee, size, grind and plan add up instead of making a new line */
export function lineKey(line: Pick<CartLine, "productId" | "size" | "grind" | "every">) {
  return [line.productId, line.size, line.grind, line.every ?? "once"].join(":");
}
