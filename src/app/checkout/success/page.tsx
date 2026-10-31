import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ClearCart } from "@/components/cart/clear-cart";
import { DemoReceipt } from "@/components/demo-receipt";
import { OrderReceipt } from "@/components/order-receipt";
import { buttonClass } from "@/components/ui/button";
import { isLive } from "@/lib/config";
import { markPaid } from "@/lib/fulfil";
import { stripe } from "@/lib/stripe";
import { serviceClient } from "@/lib/supabase/clients";
import { toOrder, type OrderRow } from "@/lib/supabase/map";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default function SuccessPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="container-x pt-12 md:pt-16">
      <p className="eyebrow">Order placed</p>
      <h1 className="mt-3 text-5xl md:text-6xl">Your coffee is on its way</h1>
      <div className="mt-10">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-card bg-cream" aria-hidden="true" />}>
          <Receipt searchParams={searchParams} />
        </Suspense>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/account" className={buttonClass("dark")}>See your orders</Link>
        <Link href="/shop" className={buttonClass("outline")}>Keep shopping</Link>
      </div>
    </div>
  );
}

async function Receipt({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;
  const demoId = typeof sp.order === "string" ? sp.order : null;

  if (isLive && sessionId) {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    // Record the payment here as well as in the webhook: whichever arrives first wins, the other changes nothing
    if (session.status === "complete") await markPaid(session);
    const { data } = await serviceClient().from("orders").select("*, order_items(*)").eq("stripe_session_id", sessionId).maybeSingle();
    if (!data) return <p>We couldn&apos;t find that order. If you were charged, please email us and we&apos;ll sort it out.</p>;
    const order = toOrder(data as OrderRow);
    return (
      <>
        <ClearCart />
        <p className="-mt-4 mb-8 text-lg text-roast">
          {session.payment_status === "paid" || session.payment_status === "no_payment_required"
            ? `Payment received. A receipt from Stripe is on its way to ${session.customer_details?.email ?? "your inbox"}.`
            : "We're waiting for your payment to clear. We'll email you as soon as it does."}
        </p>
        <OrderReceipt order={{ ...order, email: order.email || session.customer_details?.email || "", name: order.name || session.customer_details?.name || "" }} />
      </>
    );
  }
  if (demoId) return <DemoReceipt id={demoId} />;
  return <p className="text-roast">Nothing to show here. Your orders are in your account.</p>;
}
