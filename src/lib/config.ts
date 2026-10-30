import type { Grind, ShippingMethod, Size } from "./types";

/**
 * The shop runs in one of two modes:
 * - demo: no keys needed. The catalogue comes from src/data, orders are kept in the browser,
 *   and checkout skips payment. Good for previews and for trying the shop.
 * - live: Supabase stores products, accounts and orders, and Stripe takes payment (test mode).
 */
export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
export const isLive = hasSupabase && hasStripe && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const shop = {
  name: "Cinderfield Coffee Roasters",
  short: "Cinderfield",
  currency: "gbp",
  freeShippingFrom: 3500,
  subscriptionDiscount: 10,
  email: "hello@cinderfield.example",
};

export const shipping: Record<ShippingMethod, { label: string; price: number; eta: string }> = {
  standard: { label: "Standard delivery", price: 395, eta: "2 to 3 working days" },
  express: { label: "Express delivery", price: 695, eta: "Next working day" },
};

export const sizes: Record<Size, { label: string; cups: string }> = {
  "250g": { label: "250g", cups: "about 15 cups" },
  "1kg": { label: "1kg", cups: "about 60 cups" },
};

export const grinds: Record<Grind, { label: string; hint: string }> = {
  whole: { label: "Whole bean", hint: "Freshest, if you have a grinder" },
  espresso: { label: "Espresso", hint: "Very fine, for espresso machines" },
  moka: { label: "Moka pot", hint: "Fine, for stovetop pots" },
  filter: { label: "Filter", hint: "Medium, for V60, Chemex and drip" },
  cafetiere: { label: "Cafetière", hint: "Coarse, for French press" },
};

export const countries = [
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "US", name: "United States" },
];
