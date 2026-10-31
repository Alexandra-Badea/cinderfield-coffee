"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Lock, ShoppingBag, Tag, X } from "lucide-react";
import { checkCode } from "@/app/actions";
import { buttonClass } from "@/components/ui/button";
import { shipping } from "@/lib/config";
import { formatGBP, frequencyProblem, totals } from "@/lib/pricing";
import type { DiscountCode, ShippingMethod } from "@/lib/types";
import { CartLines } from "./cart-lines";
import { useCart } from "./cart-provider";
import { FreeShipping } from "./free-shipping";

export function CartView({ live }: { live: boolean }) {
  const router = useRouter();
  const { lines, products, ready, code, setCode, method, setMethod } = useCart();
  const [discount, setDiscount] = useState<DiscountCode | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checking, startCheck] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // a code saved with the cart is checked again when the page opens
  useEffect(() => {
    if (!ready || !code) return;
    checkCode(code).then((r) => ("code" in r ? setDiscount(r.code) : (setCode(""), setDiscount(null))));
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = totals(lines, products, method, discount);
  const subscription = lines.some((l) => l.every);
  const schedule = frequencyProblem(lines);

  function applyCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);
    startCheck(async () => {
      const r = await checkCode(codeInput);
      if ("error" in r) return setCodeError(r.error);
      setDiscount(r.code);
      setCode(r.code.code);
      setCodeInput("");
    });
  }

  async function checkout() {
    setError(null);
    if (!live) return router.push("/checkout");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, code: discount?.code, method }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout isn't available right now.");
      location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (!ready) return <div className="mt-10 h-64 animate-pulse rounded-card bg-cream" aria-hidden="true" />;

  if (lines.length === 0) {
    return (
      <div className="mt-10 rounded-card bg-cream p-12 text-center shadow-soft">
        <ShoppingBag className="mx-auto h-10 w-10 text-espresso/25" aria-hidden="true" />
        <p className="mt-4 font-display text-3xl">Your bag is empty</p>
        <p className="mt-2 text-muted">Freshly roasted coffee is a click away.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className={buttonClass("dark")}>Shop coffee</Link>
          <Link href="/finder" className={buttonClass("outline")}>Coffee finder</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="rounded-card bg-cream px-6 shadow-soft">
        <CartLines />
      </div>

      <aside className="space-y-5 rounded-card bg-cream p-6 shadow-soft lg:sticky lg:top-28" aria-label="Order summary">
        <h2 className="text-2xl">Order summary</h2>
        <FreeShipping subtotal={t.subtotal} subscription={subscription} />

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Delivery</legend>
          <div className="space-y-2">
            {(Object.keys(shipping) as ShippingMethod[]).map((m) => {
              const price = totals(lines, products, m, discount).shipping;
              return (
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition ${method === m ? "border-espresso bg-paper" : "border-line"}`}>
                  <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} className="h-4 w-4 accent-[#2a1c15]" />
                  <span className="flex-1">
                    <span className="block font-medium">{shipping[m].label}</span>
                    <span className="block text-sm text-muted">{shipping[m].eta}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{price === 0 ? "Free" : formatGBP(price)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {discount ? (
          <p className="flex items-center justify-between rounded-2xl bg-sage/15 px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-sage" aria-hidden="true" />
              <span><strong>{discount.code}</strong> · {discount.description}</span>
            </span>
            <button type="button" onClick={() => (setDiscount(null), setCode(""))} className="rounded-full p-1 hover:bg-espresso/10" aria-label="Remove discount code">
              <X className="h-4 w-4" />
            </button>
          </p>
        ) : (
          <form onSubmit={applyCode}>
            <label htmlFor="code" className="mb-2 block text-sm font-semibold">Discount code</label>
            <div className="flex gap-2">
              <input id="code" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" autoComplete="off" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-paper px-4 uppercase tracking-wide outline-none focus:border-espresso/50" />
              <button type="submit" disabled={!codeInput || checking} className={buttonClass("outline", "md")}>
                {checking ? "Checking…" : "Apply"}
              </button>
            </div>
            {codeError && <p role="alert" className="mt-2 text-sm text-ember">{codeError}</p>}
            {!live && !codeError && <p className="mt-2 text-xs text-muted">Try WELCOME10, BREW5 or FREESHIP.</p>}
          </form>
        )}
        {t.codeError && discount && <p role="alert" className="text-sm text-ember">{t.codeError}</p>}

        <dl className="space-y-2 border-t border-line pt-4 text-[0.95rem]">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatGBP(t.subtotal)}</dd></div>
          {t.discount > 0 && <div className="flex justify-between text-sage"><dt>Discount</dt><dd className="tabular-nums">−{formatGBP(t.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{t.shipping === 0 ? "Free" : formatGBP(t.shipping)}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatGBP(t.total)}</dd></div>
        </dl>
        {subscription && <p className="text-sm text-muted">Subscriptions renew at the same price, with free delivery. Change or cancel anytime from your account.</p>}

        {schedule && <p role="alert" className="rounded-xl bg-ember/10 p-3 text-sm text-ember">{schedule}</p>}
        <button type="button" onClick={checkout} disabled={busy || Boolean(schedule)} className={buttonClass("primary", "lg", "w-full")}>
          <Lock className="h-4 w-4" aria-hidden="true" /> {busy ? "Opening secure checkout…" : "Checkout"}
        </button>
        {error && <p role="alert" className="text-sm text-ember">{error}</p>}
        <p className="text-center text-xs text-muted">
          {live ? "Secure payment by Stripe. We never see your card details." : "Card payments aren't switched on yet: the next step takes your details only."}
        </p>
      </aside>
    </div>
  );
}
