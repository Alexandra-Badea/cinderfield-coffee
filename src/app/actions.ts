"use server";

import { newsletterWelcome } from "@/emails/templates";
import { hasSupabase, siteUrl } from "@/lib/config";
import { findDiscount, getProducts } from "@/lib/catalog";
import { canSendEmail, sendEmail, unsubscribeUrl } from "@/lib/email";
import { publicClient } from "@/lib/supabase/clients";
import type { DiscountCode } from "@/lib/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type NewsletterState = { ok: boolean; message: string } | null;

export async function subscribe(_prev: NewsletterState, form: FormData): Promise<NewsletterState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, message: "That email doesn't look quite right." };
  let isNew = true;
  if (hasSupabase) {
    const { error } = await publicClient().from("newsletter").insert({ email });
    // a repeat sign-up is fine: they're already on the list, and don't need the welcome again
    if (error && error.code !== "23505") return { ok: false, message: "Something went wrong. Please try again." };
    isNew = !error;
  }
  if (isNew && canSendEmail) {
    const featured = (await getProducts()).filter((p) => p.featured);
    const unsubscribe = unsubscribeUrl(email);
    const mail = newsletterWelcome({ site: siteUrl, products: featured, unsubscribe });
    await sendEmail({ to: email, ...mail, headers: { "List-Unsubscribe": `<${unsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
  }
  return { ok: true, message: "You're in. Expect one email a month, when a new coffee lands." };
}

export type CodeResult = { code: DiscountCode } | { error: string };

/** Checks a discount code for the cart. The cart page shows the result; checkout checks it again. */
export async function checkCode(raw: string): Promise<CodeResult> {
  const code = await findDiscount(raw);
  if (!code) return { error: "We don't recognise that code." };
  if (!code.active) return { error: "That code has expired." };
  return { code };
}
