"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { OrdersList } from "./orders-list";
import { buttonClass } from "./ui/button";
import { useBrowserStore, useHydrated } from "@/lib/browser-store";
import { demoOrders } from "@/lib/demo-orders";

export function DemoAccount() {
  const saved = useBrowserStore(demoOrders);
  const orders = useHydrated() ? saved : null;
  return (
    <div className="space-y-8">
      <p className="flex gap-3 rounded-2xl bg-sand/70 p-4 text-roast">
        <Info className="mt-1 h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
        <span>
          In the live shop, customers sign in here to see their orders and manage subscriptions (accounts run on Supabase). In this demo, there are no accounts: below are the demo orders placed in this browser.
        </span>
      </p>
      <section>
        <h2 className="text-3xl">Orders from this browser</h2>
        <div className="mt-5">
          {orders === null ? (
            <div className="h-24 animate-pulse rounded-card bg-cream" aria-hidden="true" />
          ) : orders.length ? (
            <OrdersList orders={orders} />
          ) : (
            <div className="rounded-card border border-dashed border-espresso/20 p-10 text-center">
              <p className="font-display text-2xl">No orders yet</p>
              <p className="mt-2 text-muted">Try the whole flow: add a coffee, check out, and your order shows up here.</p>
              <Link href="/shop" className={buttonClass("dark", "md", "mt-6")}>Shop coffee</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
