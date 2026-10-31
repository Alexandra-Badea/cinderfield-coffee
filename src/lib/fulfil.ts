import "server-only";
import type Stripe from "stripe";
import { renewalFrom, type OrderItemRow, type OriginalOrder } from "./renewal";
import { serviceClient } from "./supabase/clients";

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

/**
 * Marks a checkout's order as paid: saves who it's for and where it goes, takes the bags out of stock,
 * and remembers the customer's Stripe id on their account. Safe to call more than once (the webhook
 * and the confirmation page may both call it): only the first call changes anything.
 */
export async function markPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) return false;
  if (session.payment_status === "unpaid") return false; // e.g. a bank transfer still on its way

  const db = serviceClient();
  const to = session.collected_information?.shipping_details;
  const a = to?.address ?? session.customer_details?.address;
  const { data: updated } = await db
    .from("orders")
    .update({
      status: "paid",
      email: session.customer_details?.email,
      name: to?.name ?? session.customer_details?.name,
      address: a ? { line1: a.line1 ?? "", line2: a.line2 ?? undefined, city: a.city ?? "", postcode: a.postal_code ?? "", country: a.country ?? "" } : null,
      stripe_payment_intent: idOf(session.payment_intent),
      stripe_subscription: idOf(session.subscription),
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id, user_id");
  if (!updated?.length) return false;

  await db.rpc("take_stock", { p_order: orderId });
  const customer = idOf(session.customer);
  const userId = updated[0].user_id as string | null;
  if (customer && userId) await db.from("profiles").update({ stripe_customer_id: customer }).eq("id", userId).is("stripe_customer_id", null);
  return true;
}

/** A checkout that was abandoned: its pending order is cancelled */
export async function cancelExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id;
  if (orderId) await serviceClient().from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("status", "pending");
}

/**
 * Each paid renewal of a subscription becomes a new order to roast, copied from the first order.
 * The invoice id is unique on orders, so a repeated event can't create a second one.
 */
export async function recordRenewal(invoice: Stripe.Invoice) {
  if (invoice.billing_reason !== "subscription_cycle") return false; // the first payment is the checkout's own order
  const legacy = invoice as unknown as { subscription?: string | { id: string } | null };
  const subscription = idOf(invoice.parent?.subscription_details?.subscription ?? legacy.subscription);
  if (!subscription || !invoice.id) return false;

  const db = serviceClient();
  const { data: first } = await db
    .from("orders")
    .select("user_id, email, name, address, shipping_method, stripe_subscription, order_items(product_id, name, size, grind, qty, unit_price, every)")
    .eq("stripe_subscription", subscription)
    .is("stripe_invoice", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!first) return false;

  const renewal = renewalFrom(first as unknown as OriginalOrder, (first.order_items ?? []) as OrderItemRow[], invoice.amount_paid, new Date().toISOString());
  if (!renewal) return false;
  const { data: order, error } = await db.from("orders").insert({ ...renewal.order, stripe_invoice: invoice.id }).select("id").single();
  if (error || !order) return false; // 23505: this invoice is already an order
  await db.from("order_items").insert(renewal.items.map((i) => ({ ...i, order_id: order.id })));
  await db.rpc("take_stock", { p_order: order.id });
  return true;
}
