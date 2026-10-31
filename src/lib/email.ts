import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteUrl, supabaseSecret } from "./config";

/*
 * Sends the shop's own emails (newsletter welcome, order confirmation) through Resend.
 * Without RESEND_API_KEY and EMAIL_FROM nothing is sent, and the shop works exactly the same.
 * Account emails (confirm, reset password) are sent by Supabase with the templates in supabase/templates.
 */

export const canSendEmail = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail({ to, subject, html, text, headers }: { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }) {
  if (!canSendEmail) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html, text, headers, reply_to: process.env.SHOP_EMAIL || undefined }),
    });
    if (!res.ok) console.error(`Email to ${to} failed: ${res.status} ${await res.text()}`);
    return res.ok;
  } catch (err) {
    console.error("Email failed", err);
    return false; // an email that can't be sent never stops an order or a sign-up
  }
}

// ---------- One-click unsubscribe links ----------

const secret = () => process.env.NEWSLETTER_SECRET || supabaseSecret || "cinderfield";
const sign = (email: string) => createHmac("sha256", secret()).update(email.toLowerCase()).digest("base64url").slice(0, 32);

export function unsubscribeUrl(email: string) {
  return `${siteUrl}/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${sign(email)}`;
}

export function validUnsubscribe(email: string, token: string) {
  const expected = Buffer.from(sign(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
