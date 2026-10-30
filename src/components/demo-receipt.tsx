"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderReceipt } from "./order-receipt";
import { buttonClass } from "./ui/button";
import { readDemoOrders } from "@/lib/demo-orders";
import type { Order } from "@/lib/types";

/** Shows a demo order from this browser (demo orders never leave it) */
export function DemoReceipt({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useEffect(() => {
    let found: Order | null = null;
    try {
      const last = JSON.parse(sessionStorage.getItem("cinderfield:last-order") ?? "null") as Order | null;
      if (last?.id === id) found = last;
    } catch {}
    setOrder(found ?? readDemoOrders().find((o) => o.id === id) ?? null);
  }, [id]);

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
        Thanks, {order.name.split(" ")[0]}! A confirmation would go to <strong>{order.email}</strong>. (It&apos;s a demo, so nothing was sent or charged.)
      </p>
      <OrderReceipt order={order} />
    </>
  );
}
