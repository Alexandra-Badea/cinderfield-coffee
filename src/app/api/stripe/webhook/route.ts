import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isLive } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase/clients";

/**
 * Stripe calls this after checkout. The signature check proves the call really came from Stripe,
 * so an order is only marked paid when Stripe says so, never because the browser landed on the success page.
 */
export async function POST(request: Request) {
  if (!isLive) return NextResponse.json({ error: "Payments aren't configured." }, { status: 404 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const db = serviceClient();

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!orderId) return NextResponse.json({ received: true });
    if (session.payment_status === "unpaid") return NextResponse.json({ received: true }); // e.g. bank transfer still pending

    const shippingTo = session.collected_information?.shipping_details;
    const a = shippingTo?.address ?? session.customer_details?.address;
    const { data: updated } = await db
      .from("orders")
      .update({
        status: "paid",
        email: session.customer_details?.email,
        name: shippingTo?.name ?? session.customer_details?.name,
        address: a ? { line1: a.line1 ?? "", line2: a.line2 ?? undefined, city: a.city ?? "", postcode: a.postal_code ?? "", country: a.country ?? "" } : null,
        stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : null,
        stripe_subscription: typeof session.subscription === "string" ? session.subscription : null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "pending") // Stripe can send an event twice: only the first one counts
      .select("id");
    if (updated?.length) await db.rpc("take_stock", { p_order: orderId });
  }

  if (event.type === "checkout.session.expired") {
    const orderId = event.data.object.metadata?.order_id;
    if (orderId) await db.from("orders").update({ status: "cancelled" }).eq("id", orderId).eq("status", "pending");
  }

  return NextResponse.json({ received: true });
}
