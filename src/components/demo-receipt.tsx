"use client";

import Link from "next/link";
import { OrderReceipt } from "./order-receipt";
import { buttonClass } from "./ui/button";
import { useBrowserStore, useHydrated } from "@/lib/browser-store";
import { demoOrders, lastOrder } from "@/lib/demo-orders";

/** Shows an order placed before payments were switched on (those orders stay in this browser) */
export function DemoReceipt({ id }: { id: string }) {
  const last = useBrowserStore(lastOrder);
  const saved = useBrowserStore(demoOrders);
  const hydrated = useHydrated();
  // the last order is kept for this tab even if localStorage is blocked
  const order = !hydrated ? undefined : last?.id === id ? last : (saved.find((o) => o.id === id) ?? null);

  if (order === undefined) return <div className="h-72 animate-pulse rounded-card bg-cream" aria-hidden="true" />;
  if (order === null)
    return (
      <div className="rounded-card bg-cream p-10 text-center shadow-soft">
        <p className="font-display text-2xl">We couldn&apos;t find that order in this browser.</p>
        <Link href="/account" className={buttonClass("dark", "md", "mt-6")}>See your orders</Link>
      </div>
    );
  return (
    <>
      <p className="-mt-4 mb-8 text-lg text-roast">
        Thanks, {order.name.split(" ")[0]}! We&apos;ll send updates to <strong>{order.email}</strong>. No payment was taken.
      </p>
      <OrderReceipt order={order} />
    </>
  );
}
