// Writes the account email templates for Supabase (supabase/templates/*.html), and previews of every
// email with sample data (email-previews/, not committed). Paste each template into
// Supabase → Authentication → Emails, with the subject printed below.
// Run with: npm run email:templates [site address for the previews]
import { mkdirSync, writeFileSync } from "node:fs";
import { products } from "../src/data/products.ts";
import { authEmails, newsletterWelcome, orderConfirmation } from "../src/emails/templates.ts";
import type { Order } from "../src/lib/types.ts";

const root = new URL("../", import.meta.url);
const files = { confirmation: "confirmation", recovery: "recovery", magicLink: "magic-link", emailChange: "email-change", invite: "invite" } as const;

mkdirSync(new URL("supabase/templates/", root), { recursive: true });
for (const [key, mail] of Object.entries(authEmails())) {
  writeFileSync(new URL(`supabase/templates/${files[key as keyof typeof files]}.html`, root), mail.html);
  console.log(`supabase/templates/${files[key as keyof typeof files]}.html  subject: "${mail.subject}"`);
}

// Previews, filled in with sample data
const site = process.argv[2] ?? "http://localhost:3000";
const out = new URL("email-previews/", root);
mkdirSync(out, { recursive: true });
for (const [key, mail] of Object.entries(authEmails(site, `${site}/auth/callback?code=sample`))) {
  writeFileSync(new URL(`${files[key as keyof typeof files]}.html`, out), mail.html.replaceAll("{{ .NewEmail }}", "new@example.com"));
}
const featured = products.filter((p) => p.featured);
writeFileSync(new URL("newsletter-welcome.html", out), newsletterWelcome({ site, products: featured, unsubscribe: `${site}/unsubscribed` }).html);
const sample: Order = {
  id: "sample",
  number: 1042,
  createdAt: new Date().toISOString(),
  email: "maria@example.com",
  name: "Maria Lopez",
  address: { line1: "12 Harbour Street", city: "Bristol", postcode: "BS1 4RN", country: "GB" },
  shippingMethod: "standard",
  lines: [
    { productId: "p-guji", name: "Guji Natural", size: "250g", grind: "filter", qty: 2, unitPrice: 1170, every: 4 },
    { productId: "p-morning-field", name: "Morning Field", size: "250g", grind: "espresso", qty: 1, unitPrice: 950 },
  ],
  subtotal: 3290,
  discount: 0,
  shipping: 0,
  total: 3290,
  code: null,
  status: "paid",
};
writeFileSync(new URL("order-confirmation.html", out), orderConfirmation({ site, order: sample, slugs: Object.fromEntries(products.map((p) => [p.id, p.slug])) }).html);
console.log(`Previews written to email-previews/ (images from ${site})`);
