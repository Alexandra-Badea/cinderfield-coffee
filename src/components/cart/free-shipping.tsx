"use client";

import { Truck } from "lucide-react";
import { shop } from "@/lib/config";
import { formatGBP } from "@/lib/pricing";

/** "£6.50 away from free delivery", with a bar that fills as the bag does */
export function FreeShipping({ subtotal, subscription }: { subtotal: number; subscription: boolean }) {
  const gap = Math.max(0, shop.freeShippingFrom - subtotal);
  const done = subscription || gap === 0;
  const pct = done ? 100 : Math.round((subtotal / shop.freeShippingFrom) * 100);
  return (
    <div className="rounded-2xl bg-sand/60 p-3.5">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="h-4 w-4 shrink-0 text-ember" aria-hidden="true" />
        {done ? (
          <span>
            <strong>Free delivery</strong> {subscription ? "on every subscription order" : "unlocked"}
          </span>
        ) : (
          <span>
            You&apos;re <strong>{formatGBP(gap)}</strong> away from free delivery
          </span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-espresso/10" aria-hidden="true">
        <div className="h-full rounded-full bg-ember transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
