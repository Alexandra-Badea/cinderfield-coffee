import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { isLive } from "@/lib/config";
import { cancelExpired, markPaid, recordRenewal } from "@/lib/fulfil";
import { stripe } from "@/lib/stripe";

/**
 * Stripe calls this when something happens to a payment. The signature check proves the call really
 * came from Stripe. Events handled:
 * - checkout.session.completed / async_payment_succeeded: the order is paid (the confirmation page does this too,
 *   so orders still go through if the webhook isn't set up yet)
 * - checkout.session.expired: the abandoned order is cancelled
 * - invoice.paid: a subscription renewed, so there's a new order to roast
 */
export async function POST(request: Request) {
  if (!isLive) return NextResponse.json({ error: "Payments aren't switched on." }, { status: 404 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET isn't set." }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await markPaid(event.data.object);
      break;
    case "checkout.session.expired":
      await cancelExpired(event.data.object);
      break;
    case "invoice.paid":
      await recordRenewal(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
