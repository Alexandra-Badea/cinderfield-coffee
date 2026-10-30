import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** The Stripe client, created on first use so the demo never needs a key */
export function stripe() {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY!, { appInfo: { name: "Cinderfield Coffee" } });
  return client;
}
