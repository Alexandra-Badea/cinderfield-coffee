import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { priceCart, validCustomer, type CheckoutRequest } from "@/lib/checkout";
import { countries, grinds, isLive, shipping, shop, siteUrl } from "@/lib/config";
import { stripe } from "@/lib/stripe";
import { serviceClient, userClient } from "@/lib/supabase/clients";
import type { Order } from "@/lib/types";

/**
 * Starts checkout.
 * Live: saves a pending order, then hands over to Stripe Checkout (test mode). The webhook marks it paid.
 * Demo: prices the order on the server and returns it; the browser keeps it. No payment is taken.
 */
export async function POST(request: Request) {
  let body: CheckoutRequest;
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const priced = await priceCart(body);
  if ("error" in priced) return NextResponse.json({ error: priced.error }, { status: 422 });
  const { totals: t, method } = priced;

  if (!isLive) {
    const problem = validCustomer(body.customer);
    if (problem) return NextResponse.json({ error: problem }, { status: 422 });
    const c = body.customer!;
    const order: Order = {
      id: `demo-${crypto.randomUUID().slice(0, 8)}`,
      number: 1000 + Math.floor(Math.random() * 9000),
      createdAt: new Date().toISOString(),
      email: c.email.trim(),
      name: c.name.trim(),
      address: { ...c.address, country: countries.some((k) => k.code === c.address.country) ? c.address.country : "GB" },
      shippingMethod: method,
      lines: t.lines.map((l) => ({ productId: l.productId, name: l.name, size: l.size, grind: l.grind, qty: l.qty, unitPrice: l.unitPrice, every: l.every })),
      subtotal: t.subtotal,
      discount: t.discount,
      shipping: t.shipping,
      total: t.total,
      code: t.code?.code ?? null,
      status: "paid",
    };
    return NextResponse.json({ demo: true, order });
  }

  // ---- Live: save a pending order, then send the customer to Stripe ----
  const db = serviceClient();
  const { data: auth } = await (await userClient()).auth.getUser();
  const { data: order, error } = await db
    .from("orders")
    .insert({
      user_id: auth.user?.id ?? null,
      email: auth.user?.email ?? null,
      shipping_method: method,
      subtotal: t.subtotal,
      discount: t.discount,
      shipping: t.shipping,
      total: t.total,
      code: t.code?.code ?? null,
      status: "pending",
    })
    .select("id, number")
    .single();
  if (error || !order) return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 500 });

  const { error: itemsError } = await db.from("order_items").insert(
    t.lines.map((l) => ({ order_id: order.id, product_id: l.productId, name: l.name, size: l.size, grind: l.grind, qty: l.qty, unit_price: l.unitPrice, every: l.every ?? null })),
  );
  if (itemsError) return NextResponse.json({ error: "We couldn't start checkout. Please try again." }, { status: 500 });

  // Signed-in customers keep one Stripe customer record, so their cards and subscriptions stay together
  let customerId: string | null = null;
  if (auth.user) {
    const { data: profile } = await db.from("profiles").select("stripe_customer_id").eq("id", auth.user.id).maybeSingle();
    customerId = profile?.stripe_customer_id ?? null;
  }

  const subscription = t.lines.some((l) => l.every);
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = t.lines.map((l) => ({
    quantity: l.qty,
    price_data: {
      currency: shop.currency,
      unit_amount: l.unitPrice,
      product_data: { name: `${l.name}, ${l.size}`, description: `${grinds[l.grind].label}${l.every ? `, every ${l.every} weeks` : ""}`, metadata: { product_id: l.productId } },
      ...(l.every ? { recurring: { interval: "week" as const, interval_count: l.every } } : {}),
    },
  }));
  // Subscriptions can't use Checkout shipping rates, so paid delivery becomes a one-off line
  if (subscription && t.shipping > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: shop.currency, unit_amount: t.shipping, product_data: { name: shipping[method].label } } });
  }

  const s = stripe();
  const discounts = t.discount > 0 ? [{ coupon: (await s.coupons.create({ amount_off: t.discount, currency: shop.currency, duration: "once", name: t.code?.code, max_redemptions: 1 })).id }] : undefined;

  const session = await s.checkout.sessions.create({
    mode: subscription ? "subscription" : "payment",
    line_items: lineItems,
    discounts,
    ...(customerId ? { customer: customerId } : { customer_email: auth.user?.email }),
    // one-off orders only create a Stripe customer when asked; subscriptions always do
    ...(!subscription && !customerId && auth.user ? { customer_creation: "always" as const } : {}),
    client_reference_id: order.id,
    metadata: { order_id: order.id },
    ...(subscription ? { subscription_data: { metadata: { order_id: order.id } } } : {}),
    shipping_address_collection: { allowed_countries: countries.map((c) => c.code) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] },
    ...(!subscription
      ? {
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: t.shipping === 0 ? `${shipping[method].label} (free)` : shipping[method].label,
                fixed_amount: { amount: t.shipping, currency: shop.currency },
              },
            },
          ],
        }
      : {}),
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/cart?cancelled=1`,
  });

  await db.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
  return NextResponse.json({ url: session.url });
}
