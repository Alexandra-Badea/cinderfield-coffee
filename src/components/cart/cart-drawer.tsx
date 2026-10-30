"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShoppingBag, X } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { formatGBP, totals } from "@/lib/pricing";
import { CartLines } from "./cart-lines";
import { useCart } from "./cart-provider";
import { FreeShipping } from "./free-shipping";

export function CartButton() {
  const { count, setOpen, ready } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative grid h-11 w-11 place-items-center rounded-full transition hover:bg-espresso/[0.06]"
      aria-label={`Open your bag${ready && count ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {ready && count > 0 && (
        <span key={count} className="absolute right-0.5 top-0.5 grid h-5 min-w-5 animate-rise place-items-center rounded-full bg-ember px-1 text-[0.7rem] font-bold text-white tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

export function CartDrawer() {
  const { open, setOpen, lines, products, count } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const t = totals(lines, products);
  const subscription = lines.some((l) => l.every);

  // Escape closes it, the page behind doesn't scroll, and focus moves into the panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-espresso/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        tabIndex={-1}
        inert={!open}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-lift outline-none transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-xl">
            Your bag {count > 0 && <span className="text-muted">({count})</span>}
          </h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-espresso/5" aria-label="Close your bag">
            <X className="h-5 w-5" />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag className="h-10 w-10 text-espresso/25" aria-hidden="true" />
            <p className="font-display text-2xl">Your bag is empty</p>
            <p className="text-muted">Not sure where to start? Four quick questions and we&apos;ll match you with a coffee.</p>
            <div className="flex gap-2">
              <Link href="/shop" onClick={() => setOpen(false)} className={buttonClass("dark")}>
                Shop coffee
              </Link>
              <Link href="/finder" onClick={() => setOpen(false)} className={buttonClass("outline")}>
                Coffee finder
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <CartLines compact onNavigate={() => setOpen(false)} />
            </div>
            <div className="space-y-4 border-t border-line bg-cream px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <FreeShipping subtotal={t.subtotal} subscription={subscription} />
              <div className="flex items-baseline justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-xl font-semibold tabular-nums">{formatGBP(t.subtotal)}</span>
              </div>
              <Link href="/cart" onClick={() => setOpen(false)} className={buttonClass("primary", "lg", "w-full")}>
                Go to checkout
              </Link>
              <button type="button" onClick={() => setOpen(false)} className="w-full text-center text-sm font-semibold text-muted hover:text-espresso">
                Keep shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
