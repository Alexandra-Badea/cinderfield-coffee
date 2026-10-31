"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatGBP } from "@/lib/pricing";

/**
 * On phones, once the options have scrolled out of view, a bar at the bottom keeps the price
 * and a way back to them in reach.
 */
export function StickyBuy({ name, price }: { name: string; price: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById("buy");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={`fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-30 transition duration-300 lg:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
      aria-hidden={!show}
    >
      <div className="glass flex items-center gap-3 rounded-full border border-espresso/10 p-1.5 pl-5 shadow-lift">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{name}</span>
          <span className="text-xs text-muted">from {formatGBP(price)}</span>
        </span>
        <a href="#buy" tabIndex={show ? 0 : -1} className="inline-flex h-11 items-center gap-2 rounded-full bg-ember px-5 text-sm font-semibold text-white shadow-glow">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Choose &amp; add
        </a>
      </div>
    </div>
  );
}
