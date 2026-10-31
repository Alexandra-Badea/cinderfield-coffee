import type { Grind, ShippingMethod, Size } from "./types";

/**
 * What the shop is connected to decides how it runs:
 * - Nothing: the catalogue comes from src/data, orders are kept in the browser and checkout takes no payment.
 *   Handy for local work and previews.
 * - Supabase: products, accounts, reviews and orders live in the database.
 * - Supabase and Stripe: checkout takes payment through Stripe.
 *
 * Supabase keys work under either naming: the newer publishable/secret keys or the older anon/service-role keys
 * (which is what the Vercel integration adds).
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const hasSupabase = Boolean(supabaseUrl && supabaseKey);
export const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
export const isLive = hasSupabase && hasStripe && Boolean(supabaseSecret);

/**
 * Real money changes hands only with live Stripe keys. Until then the site shows a one-line
 * "demo store" notice and asks search engines not to index it.
 */
export const takesRealPayments = /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY ?? "");

/** The public address, for links in emails, Stripe redirects and social previews. Vercel provides one automatically. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const shop = {
  name: "Cinderfield Coffee Roasters",
  short: "Cinderfield",
  currency: "gbp",
  freeShippingFrom: 3500,
  subscriptionDiscount: 10,
  /** Shown on the help pages and in emails. Set SHOP_EMAIL to the shop's real address. */
  email: process.env.SHOP_EMAIL || "hello@cinderfield.example",
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
